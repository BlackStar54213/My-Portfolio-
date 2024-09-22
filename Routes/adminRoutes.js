const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Content = require('../models/content');
const Exp = require('../models/exp');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const dbimgPath = path.join(__dirname, '../public/dbimg');
if (!fs.existsSync(dbimgPath)) {
    fs.mkdirSync(dbimgPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dbimgPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })





passport.use(new LocalStrategy({ usernameField: 'email' }, async function verify(email, password, cb) {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.hashed_password);

        if (!isMatch) {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }

        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));
// Serialize user into the session
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, email: user.email }); // Adjust as needed
    });
});


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/login'); // Redirect to the login page if not authenticated
}
// Deserialize user from the session
passport.deserializeUser(async function (user, cb) {
    try {
        const foundUser = await User.findById(user.id); // Adjust to match serialized user data
        cb(null, foundUser);
    } catch (err) {
        cb(err);
    }
});
//request handler for all admin requests
router.get("/", ensureAuthenticated, (req, res) => {
    res.render('dashboard', { page: "dashboard" });
})




router.post('/register', async (req, res) => {
    let { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance
        const newUser = new User({
            email: email,
            hashed_password: hashedPassword,
            // Add other fields if necessary
        });

        // Save the user to the database
        await newUser.save();
        console.log('User registered successfully');
        res.redirect('/admin/login')

    } catch (error) {
        console.error('Error registering user:', error.message);
    }
})

router.get('/login', (req, res) => {
    res.render('login')
})
router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
}))


router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


router.post('/uploadport', upload.array('pics', 4), (req, res) => {
    let { title, client, tech, style, description } = req.body;

    const content = new Content({
        title: title,
        tech: tech,
        client: client,
        style: style,
        description: description,
        images: req.files.map(file => file.filename)
    })

    content.save()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        })
})


router.post('/uploadexp', (req, res) => {
    let { company, role } = req.body;

    const exp = new Exp({
        company: company,
        role: role
    })

    exp.save()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        })
})
module.exports = router;