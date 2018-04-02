const coursesTable = document.getElementsByClassName('courses')[0];

var xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	courses = JSON.parse(this.responseText);
	courses.map(function(val, i) {
		let courseDiv = document.createElement('div');
		let courseDetails = document.createTextNode(val);
		let cancelCourseBtn = document.createElement('input').setAttribute('type', 'button');
		cancelCourseBtn.addEventListener('click', () => alert(val));
		courseDiv.appendChild(courseDetails)
				 .appendChild(cancelCourseBtn);
	});
});
xhr.open('GET', '/courses');
xhr.send();

