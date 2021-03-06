const express = require('express');
const app = express();
const path = require('path');
const multer  = require('multer');
const upload = multer();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
// DB CONFIG
const mongoose = require('mongoose');
mongoose.connect('mongodb://openodeapp:qwerty123@ds259258.mlab.com:59258/training');
const courseSchema = mongoose.Schema({
	user: String,
	date: Date
});
const courseModel = mongoose.model('course', courseSchema);
const userSchema = mongoose.Schema({
	login: String,
	email: String,
	pass: String
});
const userModel = mongoose.model('registered_user', userSchema);
function getCourses (userID) {
	return new Promise(function(resolve, refuse) {
		courseModel.find({user: userID}, function (err, courses) {
			if (err) return console.error(err);
			if (courses){
				resolve(courses);
			} else {
				refuse();
			}
		});
	});
}
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
	userModel.findById(id, function(err, user) {
		done(err, user);
	});
});
const localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy(function(username, password, done) {
	userModel.findOne({ login: username }, function(err, user) {
		if (err) { return done(err); }
		if (!(user && bcrypt.compareSync(password, user.pass)))
			return done(null, false);
		return done(null, user);
		// if (!user) {
			// return done(null, false, { message: 'Incorrect username.' });
		// }
		// if (!bcrypt.compareSync(password, user.pass)) {
			// return done(null, false, { message: 'Incorrect password.' });
		// }
	});
}));
// APP ROUTES
app.use('/account.html', function(req, res, next) {
	if (!req.user) {
		res.redirect('/');
	} else {
		next();
	}
});
app.use(express.static(path.join(__dirname, 'public')));
app.post('/signin', passport.authenticate('local', {successRedirect: '/account.html', failureRedirect: '/'}));
app.post('/register', function(req, res) {
	let newUser = new userModel({
		login: req.body.r_login,
		email: req.body.r_email,
		pass: bcrypt.hashSync(req.body.r_pass, salt)
	});
	loginCheck(newUser.login)
	.then(emailCheck(newUser.email))
	.then(function() {
		newUser.save(function (err, newUser) {
			if (err) return console.error(err);
			req.login(newUser, function(err) {
				if (err) return console.error(err);
				if (!isNaN(Date.parse(`${req.body.r_date}T${req.body.r_time}Z`))) {
					let newCourse = new courseModel({
						user: newUser._id,
						date: new Date(`${req.body.r_date}T${req.body.r_time}Z`)
					});
					newCourse.save(function (err, newCourse) {
						if (err) return console.error(err);
						res.redirect(303, '/account.html');
					});
				} else {
					res.redirect(303, '/account.html');
				}
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
		userModel.findOne({login: loginChecked}, function (err, user) {
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
		userModel.findOne({email: emailChecked}, function (err, user) {
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
	getCourses(req.user._id)
	.then(function(courses){
		courses.push(req.user.login);	// for greeting
		res.send(JSON.stringify(courses));
	}).catch(function(){
		res.send(JSON.stringify([req.user.login]));
	})
});
function sendCoursesArr (userID, res) {
	getCourses(userID)
	.then(function(courses){
		res.send(JSON.stringify(courses));
	}).catch(function(){
		res.send(JSON.stringify([]));
	});
}
app.post('/courses', upload.array(), function(req, res) {
	if (!isNaN(Date.parse(`${req.body.date}T${req.body.time}Z`))) {
		let courseDate = new Date(`${req.body.date}T${req.body.time}Z`);
		courseModel.findOne({user: req.user._id, date: courseDate}, function (err, found) {
			if (err) return console.error(err);
			if (!found){
				let newCourse = new courseModel({
					user: req.user._id,
					date: courseDate
				});
				newCourse.save(function (err, newCourse) {
					sendCoursesArr(req.user._id, res);
				});
			} else {
				sendCoursesArr(req.user._id, res);
			}
		});
	} else {
		sendCoursesArr(req.user._id, res);
	}
});
app.delete('/courses', function(req, res) {
	courseModel.remove({'_id':req.body, 'user':req.user._id}, function() {
		sendCoursesArr(req.user._id, res);
	});
});

app.listen(process.env.PORT || 5000, (err) => {
	if (!err) {
		console.log('server is listening on port ', process.env.PORT || 5000);
	}
});