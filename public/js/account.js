let greetings = document.getElementsByClassName('greetings')[0];
let futureCoursesTitle = document.getElementsByClassName('futureCoursesTitle')[0];
let pastCoursesTitle = document.getElementsByClassName('pastCoursesTitle')[0];
let futureCoursesTable = document.getElementsByClassName('futureCourses')[0];
let pastCoursesTable = document.getElementsByClassName('pastCourses')[0];
let courseDate = document.getElementsByName('date')[0];
let courseTime = document.getElementsByName('time')[0];
let courseForm = document.getElementsByClassName('newCourse')[0];

function dateToStr (date) {
	let courseDateTime = new Date(date);
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
	return `${dayToShow}.${monthToShow}.${yearToShow} ${hourToShow}:${minutesToShow}`;
}
function createCourseDiv (course) {
	let courseDiv = document.createElement('div');
	courseDiv.classList.add('clearfix');
	let courseDetails = document.createElement('div');
	courseDetails.classList.add('courseDetails');
	
	let courseDateTime = dateToStr(course.date);
	courseDetails.innerHTML = courseDateTime;
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
			xhr.send(course._id);
		});
		courseDiv.appendChild(cancelCourseBtn);
	}
	return courseDiv;
}
function createCoursesTable (coursesArr) {
	futureCoursesTitle.style.display = 'none';
	pastCoursesTitle.style.display = 'none';
	futureCoursesTable.innerHTML = '';
	pastCoursesTable.innerHTML = '';
	if (Array.isArray(coursesArr)) {
		coursesArr.sort((x,y) => (Date.parse(x.date) > Date.parse(y.date)))
				  .map(function(val) {
			courseDiv = createCourseDiv(val);
			if (courseDateTime > Date.now()) {
				futureCoursesTitle.style.display = 'block';
				futureCoursesTable.appendChild(courseDiv);
			} else {
				pastCoursesTitle.style.display = 'block';
				pastCoursesTable.appendChild(courseDiv);
			}
		});
	}
}


let xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	response = JSON.parse(this.responseText);
	let username = response.pop();
	greetings.innerHTML += `${username}!`;
	createCoursesTable(response);
});
xhr.open('GET', '/courses');
xhr.send();

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
courseForm.addEventListener('submit', function(evt) {
	evt.preventDefault();
	let body = new FormData(courseForm);
	let xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function() {
		response = JSON.parse(this.responseText);
		createCoursesTable(response);
	});
	xhr.open('POST', '/courses');
	xhr.send(body);
});