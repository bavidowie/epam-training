function createCoursesTable (coursesArr) {
	coursesArr.sort((x,y) => (Date.parse(x.date) > Date.parse(y.date)))
			  .map(function(val) {
		let courseDiv = document.createElement('div');
		courseDiv.classList.add('clearfix');
		let courseDetails = document.createElement('div');
		
		let courseDateTime = new Date(val.date);
		courseDetails.classList.add('courseDetails');
		let dayToShow = courseDateTime.getDate();
		if (dayToShow < 10)
			dayToShow = '0' + dayToShow;
		let monthToShow = courseDateTime.getMonth() + 1;
		if (monthToShow < 10)
			monthToShow = '0' + monthToShow;
		let yearToShow = courseDateTime.getFullYear();
		let hourToShow = courseDateTime.getUTCHours();
		if (hourToShow < 10)
			hourToShow = '0' + hourToShow;
		let minutesToShow = courseDateTime.getMinutes();
		if (minutesToShow < 10)
			minutesToShow = '0' + minutesToShow;
		courseDetails.innerHTML = `${dayToShow}.${monthToShow}.${yearToShow} ${hourToShow}:${minutesToShow} ${val._id}`;
		courseDiv.appendChild(courseDetails);
		if (courseDateTime > Date.now()) {
			let cancelCourseBtn = document.createElement('input');
			cancelCourseBtn.setAttribute('type', 'button');
			cancelCourseBtn.setAttribute('value', 'Cancel course');
			cancelCourseBtn.classList.add('cancelCourse');
			cancelCourseBtn.addEventListener('click', function() {
				let xhr = new XMLHttpRequest();
				xhr.addEventListener('loadend', function() {
					response = JSON.parse(this.responseText);
					createCoursesTable(response);
				});
				xhr.open('DELETE', '/courses');
				xhr.send('courseID' : val._id);
			});
			courseDiv.appendChild(cancelCourseBtn);
			futureCoursesTable.appendChild(courseDiv);
		} else {
			pastCoursesTable.appendChild(courseDiv);
		}
	});
}

let greetings = document.getElementsByClassName('greetings')[0];
let futureCoursesTable = document.getElementsByClassName('futureCourses')[0];
let pastCoursesTable = document.getElementsByClassName('pastCourses')[0];

let xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	response = JSON.parse(this.responseText);
	let username = response.pop();
	greetings.innerHTML += `${username}!`;
	createCoursesTable(response);
});
xhr.open('GET', '/courses');
xhr.send();

let courseDate = document.getElementsByName('date')[0];
let courseTime = document.getElementsByName('time')[0];
let addCourse = document.getElementsByName('addCourse')[0];
let courseForm = document.getElementsByClassName('newCourse')[0];
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
courseDate.min = tomorrow;
courseDate.value = tomorrow;
courseTime.value = '09:00';
addCourse.addEventListener('click', function() {
	// evt.preventDefault();
	// let body = JSON.stringify({date: courseDate.value, time: courseTime.value});
	let body = new FormData(courseForm);
	let xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function() {
		response = JSON.parse(this.responseText);
		createCoursesTable(response);
	});
	xhr.open('POST', '/courses');
	xhr.send(body);
});