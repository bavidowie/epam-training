const coursesTable = document.getElementsByClassName('courses')[0];

var xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	console.log(this);
	coursesTable.innerHTML = JSON.parse(this.responseText);
});
xhr.open('GET', '/courses');
xhr.send();

