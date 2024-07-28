const express = require('express');
const session = require('express-session');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local')
const multer = require('multer');
const Content = require("../models/content");
const Details = require('../models/details');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/dbimg')
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
    res.render('admin');
})

router.post("/upload", upload.single('Image'), (req, res) => {
    let { Title, Tech, Client, Design, Link } = req.body;

    const content = new Content({
        Title: Title,
        Tech: Tech,
        Client: Client,
        Design: Design,
        Link: Link,
        imagePath: req.file.filename
    })

    content.save()
        .then((result) => {
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        })
})


router.post('/update', (req, res) => {
    let { Name, Brief, Job, Contact, City, Degree, Email, Partners } = req.body;

    Details.find()
        .then((result) => {
            if (result.length > 0) {

                Details.findByIdAndDelete(result[0]._id)
                    .then((result) => {
                        console.log(`Details has been deleted`)
                    })
            }
        })
        .catch((err) => console.log(err))
    const update = new Details({
        Name,
        Brief,
        Job,
        Contact,
        City,
        Degree,
        Email,
        Partners
    })

    update.save()
        .then((result) => {
            console.log("Updates have been made");
            res.redirect('/')
        })
        .catch((err) => console.log(err))
})



router.get('/login', (req, res) => {
    res.render("login");
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

    } catch (error) {
        console.error('Error registering user:', error.message);
    }
}

)
router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login'
}))

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
module.exports = router;