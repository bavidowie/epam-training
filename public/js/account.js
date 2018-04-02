const futureCoursesTable = document.getElementsByClassName('futureCourses')[0];
const pastCoursesTable = document.getElementsByClassName('pastCourses')[0];

var xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	courses = JSON.parse(this.responseText);
	courses.map(function(val, i) {
		let courseDateTime = Date.parse(`${val.date}T${val.time}:00.000Z`);
		let courseDiv = document.createElement('div');
		let courseDetails = document.createTextNode(`${val.date}, ${val.time}`);
		courseDiv.appendChild(courseDetails);
		if (courseDateTime > Date.now()) {
			let cancelCourseBtn = document.createElement('input');
			cancelCourseBtn.setAttribute('type', 'button');
			cancelCourseBtn.addEventListener('click', () => alert(i));
			courseDiv.appendChild(cancelCourseBtn);
			coursesTable.appendChild(courseDiv);
		}
	});
});
xhr.open('GET', '/courses');
xhr.send();

