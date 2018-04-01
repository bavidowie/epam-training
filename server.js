// APP CONFIG
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const multer  = require('multer');
const upload = multer();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
// DB CONFIG
const mongoose = require('mongoose');
mongoose.connect('mongodb://openodeapp:qwerty123@ds259258.mlab.com:59258/training');
const userSchema = mongoose.Schema({
	login: String,
	email: String,
	pass: String,
	courses: []
});
const registeredUser = mongoose.model('registered_user', userSchema);
// CRYPTOGRAPHY
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
// AUTHORIZATION CONFIG
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({ 
	secret: 'cats',
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({mongooseConnection: mongoose.connection}) }));
const passport = require('passport')
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
	done(null, user.id);
});
passport.deserializeUser(function(id, done) {
	registeredUser.findById(id, function(err, user) {
		done(err, user);
	});
});
const localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy(function(username, password, done) {
	registeredUser.findOne({ login: username }, function(err, user) {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (!bcrypt.compareSync(password, user.pass)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, user);
	});
}));

// APP ROUTES
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Account, Authentificate
app.get('/', passport.authenticate('local', {successRedirect: '/account.html'}));
app.all('/account.html', passport.authenticate('local', {successRedirect: '/account.html', failureRedirect: '/'}));

app.post('/register', function(req, res) {
	let newUser = new registeredUser({
		login: req.body.r_login,
		email: req.body.r_email,
		pass: bcrypt.hashSync(req.body.r_pass, salt),
		courses: [{
			date: req.body.r_date,
			time: req.body.r_time }]
	});
	loginCheck(newUser.r_login)
	.then(emailCheck(newUser.r_email))
	.then(function() {
		console.log(newUser);
		newUser.save(function (err, newUser) {
			if (err) return console.error(err);
			req.login(newUser._id, function(err) {
				if (err) { return next(err); }
				res.redirect(303, '/account.html');
			});
		});
	}).catch(function(error_msg) {
		switch (error_msg) {
			case 'login taken':
				res.redirect(303, '/');
				break;
			case 'email taken':
				res.send(303, '/');
				break;
		}
	});
});
app.get('/logout', function(req, res) {
	req.logout();
	res.redirect(303, '/');
});

app.get('/',)

//SERVICE FUNCTIONS
function loginCheck (loginChecked) {
	return new Promise(function(resolve, refuse) {
		registeredUser.findOne({login: loginChecked}, function (err, user) {
			if (err) return console.error(err);
			if (!user){
				resolve();
			} else {
				refuse();
				throw 'login taken';
			}
		});
	});
}
function emailCheck (emailChecked) {
	return new Promise(function(resolve, refuse) {
		registeredUser.findOne({email: emailChecked}, function (err, user) {
			if (err) return console.error(err);
			if (!user){
				resolve();
			} else {
				refuse();
				throw 'email taken';
			}
		});
	});
}

//SERVICE ROUTES
app.post('/logincheck', upload.array(), function(req, res) {
	loginCheck(req.body.r_login)
	.then(function() {
		res.send('0');
	}).catch(function() {
		res.send('1');
	});
});
app.post('/emailcheck', upload.array(), function(req, res) {
	emailCheck(req.body.r_email)
	.then(function() {
		res.send('0');
	}).catch(function() {
		res.send('1');
	});
});

//APP START
app.listen(process.env.PORT || 5000, (err) => {
	if (!err) {
		console.log('server is listening on port ', process.env.PORT || 5000);
	}
});