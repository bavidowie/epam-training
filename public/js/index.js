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


let RegisterForm = document.getElementsByClassName('register')[0];
let RegisterDate = document.getElementsByName('r_date')[0];
let RegisterTime = document.getElementsByName('r_time')[0];
let RegisterLogin = document.getElementsByName('r_login')[0];
let RegisterEmail = document.getElementsByName('r_email')[0];
let RegisterPass = document.getElementsByName('r_pass')[0];
let RegisterPassRe = document.getElementsByName('r_pass_re')[0];
let LoginForm = document.getElementsByClassName('login')[0];
let LoginLogin = document.getElementsByName('l_login')[0];
let LoginPass = document.getElementsByName('l_pass')[0];

let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
let dd = tomorrow.getDate();
let mm = tomorrow.getMonth()+1; //January is 0!
let yyyy = tomorrow.getFullYear();
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


RegisterForm.addEventListener('submit', function(evt) {
	evt.preventDefault();
	validateRegisterLogin()
	.then(validateRegisterEmail)
	.then(validateRegisterPassRe)
	.then(() => this.submit());
});

function validateRegisterLogin () {
	return new Promise(function(resolve) {
		let RegisterData = new FormData(RegisterForm);
		let xhr = new XMLHttpRequest();
		xhr.addEventListener('loadend', function() {
			if (this.responseText === '1') {
				displayInputError(RegisterLogin, 'Login already taken');
			} else {
				clearInputError(RegisterLogin);
				resolve();
			}
		});
		xhr.open('POST', '/logincheck');
		xhr.send(RegisterData);
	});
}
function validateRegisterEmail () {
	return new Promise(function(resolve) {
		let RegisterData = new FormData(RegisterForm);
		let xhr = new XMLHttpRequest();
		xhr.addEventListener('loadend', function() {
			if (this.responseText === '1') {
				displayInputError(RegisterEmail, 'Email already registered');
			} else {
				clearInputError(RegisterEmail);
				resolve();
			}
		});
		xhr.open('POST', '/emailcheck');
		xhr.send(RegisterData);
	});
}
function validateRegisterPassRe () {
	return new Promise(function(resolve) {
		if (RegisterPass.value !== RegisterPassRe.value) {
			displayInputError(RegisterPassRe, 'Passwords do not match');
		} else {
			resolve();
		}
	});
}

function displayInputError (InputField, ErrorText) {
	clearInputError(InputField);
	let ErrorBlock = document.createElement('div');
	ErrorBlock.classList.add('errormsg');
	let ErrorTextNode = document.createTextNode(ErrorText);
	ErrorBlock.appendChild(ErrorTextNode);
	InputField.parentNode.appendChild(ErrorBlock);
}
function clearInputError (InputField) {
	let LastSibling = InputField.parentNode.children[InputField.parentNode.children.length-1];
	if (LastSibling.classList.contains('errormsg')) {
		LastSibling.remove();
	}
}

RegisterLogin.addEventListener('blur', validateRegisterLogin);
RegisterLogin.addEventListener('focus', function() {
	clearInputError(RegisterLogin);
});
RegisterEmail.addEventListener('blur', validateRegisterEmail);
RegisterEmail.addEventListener('focus', function() {
	clearInputError(RegisterEmail);
});
RegisterPassRe.addEventListener('blur', validateRegisterPassRe);
RegisterPassRe.addEventListener('focus', function() {
	clearInputError(RegisterPassRe);
});