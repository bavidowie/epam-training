// APP CONFIG
const express = require('express');
const app = express();
const path = require('path');
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
	done(null, user._id);
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
app.use('/account.html', function(req, res, next) {
	if (!req.user) {
		res.redirect('/');
	}
	next();
});
app.use(express.static(path.join(__dirname, 'public')));
// APP ROUTES
app.post('/signin', passport.authenticate('local', {successRedirect: '/account.html', failureRedirect: '/'}));
app.post('/register', function(req, res) {
	let newUser = new registeredUser({
		login: req.body.r_login,
		email: req.body.r_email,
		pass: bcrypt.hashSync(req.body.r_pass, salt),
		courses: [{
			date: req.body.r_date,
			time: req.body.r_time }]
	});
	loginCheck(newUser.login)
	.then(emailCheck(newUser.email))
	.then(function() {
		newUser.save(function (err, newUser) {
			if (err) return console.error(err);
			req.login(newUser, function(err) {
				if (err) return console.error(err);
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

app.get('/courses', function(req, res) {
	let response = req.user.courses.concat(req.user.login);
	res.send(JSON.stringify(response));
});
app.post('/courses', function(req, res) {
	// console.log(req.body);
	req.user.courses.push({date: req.body.date, time: req.body.time});
	registeredUser.update({_id: req.user.id}, {courses: req.user.courses}, function() {
		res.send(JSON.stringify(req.user.courses));
	});
});

//APP START
app.listen(process.env.PORT || 5000, (err) => {
	if (!err) {
		console.log('server is listening on port ', process.env.PORT || 5000);
	}
});