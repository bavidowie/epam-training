$('.form').find('input, textarea').on('keyup blur focus', function(e) {

    var $this = $(this);
	var label = $this.prev('label');

    if (e.type === 'keyup') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.removeClass('highlight');
        }
    } else if (e.type === 'focus') {
        if ($this.val() === '') {
            label.removeClass('highlight');
        } else if ($this.val() !== '') {
            label.addClass('highlight');
        }
    }

});

$('.tab a').on('click', function(e) {

    e.preventDefault();

    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');

    target = $(this).attr('href');

    $('.tab-content > div').not(target).hide();

    $(target).fadeIn(600);

});


var RegisterForm = document.getElementsByClassName('register')[0];
var RegisterDate = document.getElementsByName('r_date')[0];
var RegisterTime = document.getElementsByName('r_time')[0];
var RegisterLogin = document.getElementsByName('r_login')[0];
var RegisterEmail = document.getElementsByName('r_email')[0];
var RegisterPass = document.getElementsByName('r_pass')[0];
var RegisterPassRe = document.getElementsByName('r_pass_re')[0];
var LoginForm = document.getElementsByClassName('login')[0];
var LoginLogin = document.getElementsByName('l_login')[0];
var LoginPass = document.getElementsByName('l_pass')[0];

var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
var dd = tomorrow.getDate();
var mm = tomorrow.getMonth()+1; //January is 0!
var yyyy = tomorrow.getFullYear();
if(dd<10) {
    dd = '0'+dd
}
if(mm<10) {
    mm = '0'+mm
} 
tomorrow = yyyy + '-' + mm + '-' + dd;
RegisterDate.min = tomorrow;
RegisterDate.value = tomorrow;

RegisterTime.value = '09:00';

RegisterLogin.addEventListener('blur', validateRegisterLogin);
RegisterLogin.addEventListener('focus', function() {
	clearInputError(RegisterLogin);
});
RegisterEmail.addEventListener('blur', validateRegisterEmail);
RegisterEmail.addEventListener('focus', function() {
	clearInputError(RegisterEmail);
});
RegisterPass.addEventListener('blur', validateRegisterPass);
RegisterPass.addEventListener('focus', function() {
	clearInputError(RegisterPass);
});
RegisterPassRe.addEventListener('blur', validateRegisterPassRe);
RegisterPassRe.addEventListener('focus', function() {
	clearInputError(RegisterPassRe);
});

RegisterForm.addEventListener('submit', function(e) {
	e.preventDefault();
	if (validateRegisterLogin && validateRegisterEmail && validateRegisterPass && validateRegisterPassRe) {
		var RegisterData = new FormData(RegisterForm);
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('loadend', function(res) {
			console.log('Register ok');
		});
		xhr.open('POST', '/register');
		xhr.send(RegisterData);
	}
});
LoginForm.addEventListener('submit', function(e) {
	e.preventDefault();
	var LoginData = new FormData(LoginForm);
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function(res) {
		console.log(res);
		document.body.innerHTML = this.responseText;
	});
	xhr.open('POST', '/account.html');
	xhr.send(LoginData);
});


function validateRegisterLogin () {
	if (RegisterLogin.value.length < 4) {
		displayInputError(RegisterLogin, 'Login too short, 4 characters minimum');
		return false;
	} else if (RegisterLogin.value.length > 64) {
		displayInputError(RegisterLogin, 'Login too long, 64 characters maximum');
		return false;
	} else if (RegisterLogin.value.match(/[^a-zA-Z0-9_]/) !== null) {
		displayInputError(RegisterLogin, 'Login can only contain letters, numbers and underscores');
		return false;
	}
	var RegisterData = new FormData(RegisterForm);
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function() {
		if (this.responseText === '1') {
			displayInputError(RegisterLogin, 'Login already taken');
			return false;
		} else {
			clearInputError(RegisterLogin);
			return true;
		}
	});
	xhr.open('POST', '/logincheck');
	xhr.send(RegisterData);
}
function validateRegisterEmail () {
	if (RegisterEmail.value == '') {
		displayInputError(RegisterEmail, 'Email empty');
		return false;
	} else if (RegisterEmail.value.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i) === null) {
		displayInputError(RegisterEmail, 'Email invalid');
		return false;
	}
	var RegisterData = new FormData(RegisterForm);
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function() {
		if (this.responseText === '1') {
			displayInputError(RegisterEmail, 'Email already registered');
			return false;
		} else {
			clearInputError(RegisterEmail);
			return true;
		}
	});
	xhr.open('POST', '/emailcheck');
	xhr.send(RegisterData);
}
function validateRegisterPass () {
	if (RegisterPass.value.length < 5) {
		displayInputError(RegisterPass, 'Password must be at least 5 symbols long');
		return false;
	} else if (RegisterPass.value.length > 64) {
		displayInputError(RegisterPass, 'Password too long, 64 characters maximum');
		return false;
	}
	return true;
}
function validateRegisterPassRe () {
	if (RegisterPass.value !== RegisterPassRe.value) {
		displayInputError(RegisterPassRe, 'Passwords do not match');
		return false;
	}
	return true;
}


function displayInputError (InputField, ErrorText) {
	clearInputError(RegisterLogin);
	var ErrorBlock = document.createElement('div');
	ErrorBlock.classList.add('errormsg');
	var ErrorTextNode = document.createTextNode(ErrorText);
	ErrorBlock.appendChild(ErrorTextNode);
	InputField.parentNode.appendChild(ErrorBlock);
}
function clearInputError (InputField) {
	var LastSibling = InputField.parentNode.children[InputField.parentNode.children.length-1];
	if (LastSibling.classList.contains('errormsg')) {
		LastSibling.remove();
	}
}