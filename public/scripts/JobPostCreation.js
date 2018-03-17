firebase.auth().onAuthStateChanged(function(u){
	user = u;
    if(u) {
		firebase.database().ref('users/' + user.email.replace('.','(')).once('value', function(snapshot) {
			var username = snapshot.val().username;
			document.getElementById("welcome_user_text").innerHTML = "Hello " +
					username;
			document.getElementById("welcome_user").style.display = "block";
			document.getElementById("post_job_button").style.display = "block";
			document.getElementById("prof_link").href = "/employer_profile";
			document.getElementById("jobs_link").href = "/employer_jobs";
			document.getElementById("prof_button").style.display = "block";
			document.getElementById("jobs_button").style.display = "block";
			document.getElementById("logout_button").style.display = "block";});
    }else window.location.href ="/";
});



function logout() {
    firebase.auth().signOut();
	window.location.href = "/";
}

function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block')
        e.style.display = 'none';
   else
        e.style.display = 'block';
}

function on() {
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}

var geocoder;
function mapInit(){
	geocoder = new google.maps.Geocoder();
}

function writeJob(){
	var user = firebase.auth().currentUser;
	if(user){
		var emailFixed = user.email.replace('.','(');
		firebase.database().ref("users/"+emailFixed).once("value", function(snapshot){
			const jobRef = firebase.database().ref("jobs");
			const userJobRef = firebase.database().ref("users/"+emailFixed+"/jobs");
			var jobEmployer = snapshot.val().name || snapshot.val().username;
			var jobTitle = document.querySelector("#Title").value;
			var jobLoc = document.querySelector("#Location").value;
			var jobPay = document.querySelector("#Payment").value;
			var jobDesc = document.querySelector("#Desc").value;
			if(jobTitle == "" || jobLoc == "" || jobPay == "" || jobDesc == ""){
				document.querySelector("#errortext").style.color = "#ff4444";
				return;
			}
			var jobPic = document.querySelector("#pic").files[0];
			var jobPostDate = new Date();
			var day = jobPostDate.getDate();
			var month = jobPostDate.getMonth()+1;
			var year = jobPostDate.getFullYear();
			if(day < 10){
				day = "0" + day;
			}
			if(month < 10){
				month = "0" + month;
			}
			jobPostDate = month + "/" + day + "/" + year;
			var jobType = "";

			if(document.querySelector("#full").checked){
				jobType = "Full-Time";
			}
			if(document.querySelector("#part").checked){
				jobType = "Part-Time";
			}
			if(document.querySelector("#small").checked){
				jobType = "Small-Time";
			}
			if(document.querySelector("#once").checked){
				jobType = "One-Time";
			}
			var jobLat = "empty";
			var jobLng = "empty";
			geocoder.geocode({"address":jobLoc}, function(results, status) {
				if(status == 'OK'){
					var loc = results[0].geometry.location;
					jobLat = loc.lat();
					jobLng = loc.lng();
				}
				else{
					return;
				}
				var jobData = {
					employer: jobEmployer,
					lat: jobLat,
					lng: jobLng,
					loc: jobLoc,
					posted: jobPostDate,
					notes: jobDesc,
					pay: jobPay,
					title: jobTitle,
					type: jobType
				};
				var newJob = jobRef.push(jobData);
				var newJobKey = newJob.key;
			    var pictureRef = firebase.storage().ref('jobs/'+newJobKey).child('job_post_pic.jpg');
				userJobRef.child(newJobKey).set(newJobKey);
				if(jobPic)
				pictureRef.put(jobPic).then(function(snapshot){
					window.location.href = "/";});
				else window.location.href = "/";
			});
		});
	}
}
