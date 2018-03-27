const express = require('express');
const app = express();
const path = require('path');
const multer  = require('multer');
const upload = multer();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');
mongoose.connect('mongodb://openodeapp:qwerty123@ds259258.mlab.com:59258/training');
const userSchema = mongoose.Schema({
	login: String,
	email: String,
	pass: String
});
const registeredUser = mongoose.model('registered_user', userSchema);

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

app.use(session({
	secret: 'keybroad cat',
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({ mongooseConnection: mongoose.connection, touchAfter: 24 * 3600 }),
	cookie: { secure: true }
}));


function loginCheck (loginChecked) {
	return new Promise(function(resolve, refuse) {
		registeredUser.find({login: loginChecked}, function (err, user_found) {
			if (err) return console.error(err);
			if (user_found.length > 0){
				refuse();
				throw 'login taken';
			} else {
				resolve();
			}
		});
	});
}
function emailCheck (emailChecked) {
	return new Promise(function(resolve, refuse) {
		registeredUser.find({email: emailChecked}, function (err, user_found) {
			if (err) return console.error(err);
			if (user_found.length > 0){
				refuse();
				throw 'email taken';
			} else {
				resolve();
			}
		});
	});
}

app.all('/account.html', function(req, res) {
	console.log(req.session);
	console.log('entering private area');
	// if (req.session._id)
});

app.post('/register', function(req, res) {
	let newUser = new registeredUser({
		login: req.body.r_login,
		email: req.body.r_email,
		pass: bcrypt.hashSync(req.body.r_pass, salt)
	});
	loginCheck(newUser.r_login)
	.then(emailCheck(newUser.r_email))
	.then(function() {
		newUser.save(function (err, newUser) {
			if (err) return console.error(err);
			req.session.uid = newUser._id;
			res.redirect(303, '/account.html');
		});
	}).catch(function(error_msg) {
		switch (error_msg) {
			case 'login taken':
				res.send('login taken');
				break;
			case 'email taken':
				res.send('email taken');
				break;
		}
	});
});
app.post('/signin', function(req, res) {
	let Login = req.body.l_login;
	let Pass = req.body.l_pass;
	registeredUser.find({$or:[{login: Login},{email: Login}]}, function(err, found) {
		if (err) return console.error(err);
		if (found.length > 0 && bcrypt.compareSync(Pass, found[0].pass)) {
			req.session.uid = found[0]._id;
			res.redirect(303, '/account.html');
		} else {
			res.redirect(303, '/error.html');
		}
	});
});
app.get('/logout', function(req, res) {
	// if (req.session.id ) {
		// req.session.destroy(function() {
			res.redirect(303, '/');
		// });
	}
});

app.post('/logincheck', upload.array(), function(req, res) {
	loginCheck(req.body.r_login)
	.then(function() {
		res.send('0');
	}).catch(function() {
		res.send('1');
	});
});
app.post('/emailcheck', upload.array(), function(req, res) {
	emailCheck(req.body.r_email).then(function() {
		res.send('0');
	}).catch(function() {
		res.send('1');
	});
});


app.listen(process.env.PORT || 5000, (err) => {
	if (!err) {
		console.log('server is listening on port ', process.env.PORT || 5000);
	}
});