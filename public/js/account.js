let greetings = document.getElementsByClassName('greetings')[0];
let futureCoursesTable = document.getElementsByClassName('futureCourses')[0];
let pastCoursesTable = document.getElementsByClassName('pastCourses')[0];

let xhr = new XMLHttpRequest();
xhr.addEventListener('loadend', function() {
	response = JSON.parse(this.responseText);
	let username = response.pop();
	greetings.innerHTML += `${username}!`;
	response.map(function(val, i) {
		let courseDiv = document.createElement('div');
		courseDiv.classList.add('clearfix');
		let courseDetails = document.createElement('div');
		
		let courseDateTime = new Date(val.date);
		courseDetails.classList.add('courseDetails');
		let dayToShow = courseDateTime.getDate();
		if (dayToShow < 10)
			dayToShow = '0' + dayToShow;
		let monthToShow = courseDateTime.getMonth();
		if (monthToShow < 10)
			monthToShow = '0' + monthToShow;
		let yearToShow = courseDateTime.getFullYear();
		let hourToShow = courseDateTime.getUTCHours();
		if (hourToShow < 10)
			hourToShow = '0' + hourToShow;
		let minutesToShow = courseDateTime.getMinutes();
		if (minutesToShow < 10)
			minutesToShow = '0' + minutesToShow;
		courseDetails.innerHTML = `${dateToShow}.${monthToShow}.$yearToShow ${hourToShow}:${minutesToShow}`;
		courseDiv.appendChild(courseDetails);
		if (courseDateTime > Date.now()) {
			let cancelCourseBtn = document.createElement('input');
			cancelCourseBtn.setAttribute('type', 'button');
			cancelCourseBtn.setAttribute('value', 'Cancel course');
			cancelCourseBtn.classList.add('cancelCourse');
			cancelCourseBtn.addEventListener('click', () => alert(val._id));
			courseDiv.appendChild(cancelCourseBtn);
			futureCoursesTable.appendChild(courseDiv);
		} else {
			pastCoursesTable.appendChild(courseDiv);
		}
	});
});
xhr.open('GET', '/courses');
xhr.send();

let CourseDate = document.getElementsByName('date')[0];
let CourseTime = document.getElementsByName('time')[0];
let CourseForm = document.getElementsByClassName('newCourse')[0];
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
CourseDate.min = tomorrow;
CourseDate.value = tomorrow;
CourseTime.value = '09:00';
CourseForm.addEventListener('submit', function(evt) {
	//evt.preventDefault();
	let xhr = new XMLHttpRequest();
	xhr.addEventListener('loadend', function() {
		console.log(this);
	});
	xhr.open('POST', '/courses');
	xhr.send();
});