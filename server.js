const path = require('path');
//const logger = require('morgan');

const express = require('express');
const app = express();
//app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const multer  = require('multer');
const upload = multer();

const mongoose = require('mongoose');
mongoose.connect('mongodb://openodeapp:qwerty123@ds259258.mlab.com:59258/training');
const userSchema = mongoose.Schema({
	login: String,
	email: String,
	pass: String
});
const registered_user = mongoose.model('registered_user', userSchema);

var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);


app.post('/logincheck', upload.array(), function(req, res) {
	registered_user.find({login: req.body.r_login}, function (err, user_found) {
		if (err) return console.error(err);
		user_found.length > 0 ? res.send('1') : res.send('0');
	});
});
app.post('/emailcheck', upload.array(), function(req, res) {
	registered_user.find({email: req.body.r_email}, function (err, user_found) {
		if (err) return console.error(err);
		user_found.length > 0 ? res.send('1') : res.send('0');
	});
});

app.post('/register', upload.array(), function(req, res) {
	var UserNew = new registered_user({
		login: req.body.r_login,
		email: req.body.r_email,
		pass: bcrypt.hashSync(req.body.r_pass, salt)
	});
	UserNew.save(function (err, UserNew) {
		if (err) return console.error(err);
		res.send();
	});
});

app.post('/signin', upload.array(), function(req, res) {
	var Login = req.body.l_login;
	var Pass = req.body.l_pass;
	registered_user.find({$or:[{login: Login},{email: Login}]}, function(err, found) {
		if (err) return console.error(err);
		if (found.length > 0) {
			console.log(found[0]);
			if (bcrypt.compareSync(Pass, found[0].pass)) {
				return res.redirect('/account.html');
			}
		}
	});
	res.send('login error');
});

app.listen(process.env.PORT || 5000, (err) => {
	if (!err) {
		console.log('server is listening on 80');
	}
});