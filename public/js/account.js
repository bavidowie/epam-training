const coursesTable = document.getElementsByClassName('courses')[0];

var xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	courses = JSON.parse(this.responseText);
	console.log(courses);
});
xhr.open('GET', '/courses');
xhr.send();

