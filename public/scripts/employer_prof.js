var user = firebase.auth().currentUser;

var geocoder;
function mapInit(){
	geocoder = new google.maps.Geocoder();
}

function addTextBox() {
	var box4 = document.getElementById("box");
	box4.style.display = "inline";
}
// Save name from "box"
function hideTextBox() {
	var box4 = document.getElementById("box");
	var name = box4.value;
	firebase.database().ref('users/'+user.email.replace('.','(')+'/name').set(name);
	box4.style.display = "none";
}

function addTextBox2() {
	var box5 = document.getElementById("box1");
	box5.style.display = "inline";
}
// Geocode and save location from "box1"
function hideTextBox2(){
	var box5 = document.getElementById("box1");
	var lloc = box5.value;
	geocoder.geocode({"address":lloc}, function(results, status) {
		if(status == "OK"){
			var loc = results[0].geometry.location;
			firebase.database().ref('users/'+user.email.replace('.','(')+'/loc').set(lloc);
			firebase.database().ref('users/'+user.email.replace('.','(')+'/lat').set(loc.lat());
			firebase.database().ref('users/'+user.email.replace('.','(')+'/lng').set(loc.lng());
		}
	});
	box5.style.display = "none";
}

function addTextBox3() {
	var box6 = document.getElementById("box2");
	box6.style.display = "inline";
}
// Save bio from "box2"
function hideTextBox3() {
	var box6 = document.getElementById("box2");
	var about = box6.value;
	firebase.database().ref('users/'+user.email.replace('.','(')+'/about').set(about);
	box6.style.display = "none";
}

function addTextBox4() {
	var box7 = document.getElementById("box3");
	box7.style.display = "inline";
}
//Save phone from "box4"
function hideTextBox4() {
	var box7 = document.getElementById("box3");
	var phone = box7.value;
	firebase.database().ref('users/'+user.email.replace('.','(')+'/phone').set(phone);
	box7.style.display = "none";
}

var button = document.getElementById("edit");
var d2 = document.getElementById("d3");
function showbutt() {
	button.style.display="none";
	d2.style.display="inline";
}

function showedit() {
	button.style.display="inline-block";
	d2.style.display="none";
	var boxval = document.getElementById("box").value;
	document.getElementById("namebox").innerHTML = boxval || "None";
}

var button2 = document.getElementById("edit2");
var d4 = document.getElementById("d4");
function showbutt2() {
	button2.style.display="none";
	d4.style.display="inline";
}

function showedit2() {
	button2.style.display="inline-block";
	d4.style.display="none";
	var box1val = document.getElementById("box1").value;
	document.getElementById("loc").innerHTML = box1val || "None";
}

var button3 = document.getElementById("edit3");
var d5 = document.getElementById("d5");
function showbutt3() {
	button3.style.display="none";
	d5.style.display="inline";
}

function showedit3() {
	button3.style.display="inline-block";
	d5.style.display="none";
	var box2val = document.getElementById("box2").value;
	document.getElementById("abt").innerHTML = box2val || "None";
}

var button4 = document.getElementById("edit4");
var d6 = document.getElementById("d6");
function showbutt4() {
	button4.style.display="none";
	d6.style.display="inline";
}

function showedit4() {
	button4.style.display="inline-block";
	d6.style.display="none";
	var box3val = document.getElementById("box3").value;
	document.getElementById("phonebox").innerHTML = box3val || "None";
}

onFileInputChange = function() {
	var img = document.querySelector('.upload');
	var file = document.querySelector('input[type=file]').files[0];
	var reader = new FileReader();

	reader.addEventListener("load", function (){
	img.src = reader.result;
	}, false);

	if (file){
		var user = firebase.auth().currentUser;
		var picref = firebase.storage().ref('users/' + user.email.replace('.','(') + '/profile_pic.jpg');
		picref.put(file);
		reader.readAsDataURL(file);
	};
}

onFileChange = function() {
	var file = document.querySelector('#upl2').files[0];
	var reader = new FileReader();

	if (file){
		var user = firebase.auth().currentUser;
		var resref = firebase.storage().ref('users/' + user.email.replace('.','(') + '/resume.pdf');
		resref.put(file).then(function(snapshot){
			firebase.storage().ref('users/'+ user.email.replace('.','(') + '/resume.pdf').getDownloadURL().then(
				function(URL){
					document.querySelector("#res").href = URL;
				});
		});
	};
}


function logout() {
    firebase.auth().signOut();
	window.location.href = "/";
}

firebase.auth().onAuthStateChanged(function(u){
	user = u;
    if(u) {
		firebase.database().ref('users/' + user.email.replace('.','(')).once('value', function(snapshot) {
			var username = snapshot.val().username;
			var type = snapshot.val().type;
			var name = snapshot.val().name;
			var lloc = snapshot.val().loc;
			var phone = snapshot.val().phone;
			var about = snapshot.val().about;
			document.querySelector("#namebox").innerHTML = name || "None";;
			document.querySelector("#loc").innerHTML = lloc || "None";;
			document.querySelector("#abt").innerHTML = about || "None";;
			document.querySelector("#box").value = name || "";
			document.querySelector("#box1").value = lloc || "";
			document.querySelector("#box2").value = about || "";
			document.getElementById("welcome_user_text").innerHTML = "Hello " +
					username;
			document.getElementById("welcome_user").style.display = "block";
			if(type === "employer"){
				document.getElementById("post_job_button").style.display = "block";
				document.getElementById("prof_link").href = "/employer_profile";
				document.getElementById("jobs_link").href = "/employer_jobs";
			}if(type === "finder"){
				document.getElementById("adv_search_button").style.display = "block";
				document.getElementById("prof_link").href = "/finder_profile";
				document.getElementById("jobs_link").href = "/finder_jobs";
			}document.getElementById("prof_button").style.display = "block";
			document.getElementById("jobs_button").style.display = "block";
			document.getElementById("logout_button").style.display = "block";});
		firebase.storage().ref('users/'+ user.email.replace('.','(') + '/profile_pic.jpg').getDownloadURL().then(
			function(URL){
				document.querySelector(".upload").src = URL;
			}, function(error){
				document.querySelector(".upload").src = "/images/img_avatar2.png";
			});
    }else window.location.href ="/";
});
