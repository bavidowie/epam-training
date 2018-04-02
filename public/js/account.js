const coursesTable = document.getElementsByClassName('courses')[0];

var xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	coursesTable.innerHTML = JSON.parse(this.responseText);
	console.log(this);
});
xhr.open('GET', '/courses');
xhr.send();

