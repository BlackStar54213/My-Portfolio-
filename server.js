const express = require('express');
const session = require('express-session');
const mongodb = require("mongodb");
const mongoose = require('mongoose');
const content = require("./models/content");
const multer = require('multer');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local');
const adminRouter = require('./routes/admin');
const Details = require('./models/details');
const app = express();

const port = process.env.PORT || 4000;


//middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// Configure and use express-session middleware
app.use(session({
    secret: 'food', // Change this to a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure to true if you're using HTTPS
}));

// Initialize Passport and restore session state
app.use(passport.initialize());
app.use(passport.session());
app.use("/admin", adminRouter)



const dbUri = "mongodb+srv://desmond:desmond54213@cluster0.d4ugy5t.mongodb.net/Portfolio-Content?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(dbUri)
    .then(() => {
        app.listen(port, () => {
            console.log("Server has been activated");
        })
    })
    .catch((err) => console.log(err));

//request handlers

app.get('/', (req, res) => {
    content.find()
        .then((result) => {
            Details.find()
                .then((result2) => {
                    res.render('index', { project: result, Details: result2 });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
})
app.get('/register', (req, res) => {
    res.render('register');
})
