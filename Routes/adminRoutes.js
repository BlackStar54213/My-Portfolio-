const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Content = require('../models/content');
const Exp = require('../models/exp');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); // Import the config file


// Set up Cloudinary storage for image uploads
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio', // You can change this to your desired Cloudinary folder
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed formats
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional transformation (resize)
    }
});

const upload = multer({ storage: storage }); // Set up multer with Cloudinary storage

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
        cb(null, { id: user.id, email: user.email });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/login');
}

// Deserialize user from the session
passport.deserializeUser(async function (user, cb) {
    try {
        const foundUser = await User.findById(user.id);
        cb(null, foundUser);
    } catch (err) {
        cb(err);
    }
});

// Request handler for all admin requests
router.get("/", ensureAuthenticated, (req, res) => {
    res.render('dashboard', { page: "dashboard" });
});

// Register user
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
        });

        // Save the user to the database
        await newUser.save();
        console.log('User registered successfully');
        res.redirect('/admin/login');
    } catch (error) {
        console.error('Error registering user:', error.message);
    }
});

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
}));

// Logout route
router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Upload portfolio images to Cloudinary
router.post('/uploadport', upload.array('pics', 4), (req, res) => {
    let { title, client, tech, style, description } = req.body;

    const content = new Content({
        title: title,
        tech: tech,
        client: client,
        style: style,
        description: description,
        images: req.files.map(file => file.path) // Cloudinary URLs are stored in `file.path`
    });

    content.save()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
});

// Upload experience
router.post('/uploadexp', (req, res) => {
    let { company, role } = req.body;

    const exp = new Exp({
        company: company,
        role: role
    });

    exp.save()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;
