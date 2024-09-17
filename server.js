const express = require('express');
const mongoose = require('mongoose')
const app = express();
const port = process.env.PORT || 3000;
const session = require('express-session');
const passport = require('passport');
const User = require('./models/user');
const Content = require('./models/content');
const Exp = require('./models/exp');
const adminRouter = require('./Routes/adminRoutes')
const nodemailer = require('nodemailer');
//middlewares
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
app.use("/admin", adminRouter);


// Configure nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: 'izuokeme@gmail.com', // Your email address
        pass: 'qhkh pqvx jdqv gpot'    // Your email password or an app-specific password
    }
});
//database connection and server initiation
const dbUri = "mongodb+srv://desmond:desmond54213@cluster0.d4ugy5t.mongodb.net/Zee-Portfolio-Content?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(dbUri)
    .then(() => {
        app.listen(port, () => {
            console.log("Server has been activated");
        })
    })
    .catch((err) => console.log(err));





app.get('/', (req, res) => {
    Content.find()
        .then((result) => {
            Exp.find()
                .then((result2) => {
                    res.render('index', { projects: result, exp: result2, page: "home" })
                })
                .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
})
app.get('/portfolio', (req, res) => {
    const style = req.query.style;

    switch (style) {
        case 'mobile':
            Content.find({ style: 'Mobile Design' })
                .then((result) => {
                    res.render('portfolio', { projects: result, style: style, page: "portfolio" })
                })
                .catch((err) => console.log(err))
            break;

        case 'graphics':
            Content.find({ style: 'Graphics' })
                .then((result) => {
                    res.render('portfolio', { projects: result, style: style, page: "portfolio" })
                })
                .catch((err) => console.log(err))

            break;

        case 'ui':
            Content.find({ style: 'Ui' })
                .then((result) => {
                    res.render('portfolio', { projects: result, style: style, page: "portfolio" })
                })
                .catch((err) => console.log(err))
            break;
        case 'brand':
            Content.find({ style: 'Brand Identity' })
                .then((result) => {
                    res.render('portfolio', { projects: result, style: style, page: "portfolio" })
                })
                .catch((err) => console.log(err))

            break;
        default:
            res.redirect('/portfolio?style=mobile')
            break;
    }


})
app.get('/about', (req, res) => {
    Exp.find()
        .then((result2) => {
            res.render('about', { exp: result2, page: "about" })
        })
        .catch((err) => console.log(err))
})

app.get('/contact', (req, res) => {
    res.render('contact', { page: "contact" });
})
app.get('/details', (req, res) => {
    const itemId = req.query.id;
    Content.findById(itemId)
        .then((result) => {
            res.render('details', { dets: result, page: "details" })
        })
})



app.post('/contact', (req, res) => {
    let { fname, lname, tel, email, message } = req.body

    const mailOptions = {
        from: email, // sender address
        to: 'okokonewomazino@gmail.com',                      // list of receivers
        subject: 'Message from portfolio',            // Subject line
        text: `My name is ${fname} ${lname}.\n Email: ${email},\n Phone number: ${tel},\n Message: ${message}`                   // plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.status(200).redirect('/');
    });
})