
function init_map(){
	userloc = new google.maps.LatLng(36.9741171, -122.03079630000002);
	geocoder = new google.maps.Geocoder();
}

function login_display () {
    if(firebase.auth().currentUser) {
        document.getElementById("welcome_guest").style.display = "none";
        document.getElementById("welcome_user_text").innerHTML = "Hello " +
                firebase.auth().currentUser.email;
        document.getElementById("welcome_user").style.display = "block";
    } else {
        document.getElementById("welcome_guest").style.display = "block";
        document.getElementById("welcome_user").style.display = "none";
    }
}

function open_login_pop(){
	toggle_visibility('login_pop');
	document.querySelector("#email").focus();
}

function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block'){
        e.style.display = 'none';
   }else{
        e.style.display = 'block';
   }
}

function logout() {
    firebase.auth().signOut();
}

firebase.auth().onAuthStateChanged(function(user){
    if(user) {
		firebase.database().ref('users/' + user.email.replace('.','(')).once('value', function(snapshot) {
			var username = snapshot.val().username;
			var type = snapshot.val().type;
			var loc = snapshot.val().loc;
			if(loc){
				userloc = new google.maps.LatLng(snapshot.val().lat, snapshot.val().lng);
				sort_jobs_list();
			}
			document.getElementById("welcome_guest").style.display = "none";
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
    } else {
		try{
			userloc = new google.maps.LatLng(36.9741171, -122.03079630000002);
		}catch(err){
			userloc = {lat: function(){return 36.9741171;}, lng: function(){return  -122.03079630000002;}};
		}
		sort_jobs_list();
        document.getElementById("welcome_guest").style.display = "block";
        document.getElementById("welcome_user").style.display = "none";
		document.getElementById("post_job_button").style.display = "none";
		document.getElementById("adv_search_button").style.display = "none";
		document.getElementById("prof_button").style.display = "none";
		document.getElementById("jobs_button").style.display = "none";
		document.getElementById("logout_button").style.display = "none";
    }
});

var geocoder;
var userloc;
var ordered_jobs=[];

function update_loc(address, user){
	geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        var loc = results[0].geometry.location;
		var snap = firebase.database().ref('users/'+user.replace('.','('));
		snap.child('loc').set(address);
		snap.child('lat').set(loc.lat());
		snap.child('lng').set(loc.lng());
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}



function gotoSignup() {
    window.location.href = "/signup";
}

function login() {
        document.getElementById("bad_login").style.display = "none";

	var userPass = document.getElementById("psw").value;
	var userEmail = document.getElementById("email").value;
        if(userEmail == ""){
                document.getElementById("login_error").innerHTML = "Email address cannot be empty.";
                document.getElementById("bad_login").style.display = "block";
        }else if(userPass == ""){
                document.getElementById("login_error").innerHTML = "Password cannot be empty.";
                document.getElementById("bad_login").style.display = "block";
        }else{
        firebase.auth().signInWithEmailAndPassword(userEmail, userPass).then(function() {
                //Login is Successful //
				document.getElementById("psw").value = "";
                document.getElementById("bad_login").style.display = "none";
                toggle_visibility("login_pop");
        }).catch(function(error) {
                // Handle account creation errors here.
                document.getElementById("login_error").innerHTML = error.message;
                document.getElementById("bad_login").style.display = "block";
        });}
}


function open_job_popup(id){
	document.querySelector("#job_pop_error").style.display = "none";
	firebase.database().ref('jobs/'+id).once('value', function(snapshot) {
		document.getElementById("job_pop_pic").src = "/images/logo1.png";
		var picref = firebase.storage().ref('jobs/'+id+'/job_post_pic.jpg').getDownloadURL().then(
		function(URL){
			document.getElementById("job_pop_pic").src = URL;
		}, function(error){});
		var snap = snapshot.val();
		var empname = snap.employer;
		var title = snap.title;
		var notes = snap.notes;
		var loc = snap.loc;
		var lat = snap.lat;
		var lng = snap.lng;
		var date = snap.posted;
		var gloc = new google.maps.LatLng(lat, lng);
		var dist = (google.maps.geometry.spherical.computeDistanceBetween(gloc, userloc)/1609.34).toFixed(1);
		var tags = "Tags Not Yet Implimented";
		var type = snap.type;
		var pay = snap.pay;
		/*etc*/
		document.getElementById("job_pop_employer").innerHTML = empname;
		document.getElementById("job_pop_title").innerHTML = title;
		document.getElementById("job_pop_notes").innerHTML = notes;
		document.getElementById("job_pop_loc").innerHTML = loc;
		document.getElementById("job_pop_dist").innerHTML = dist + " miles away";
		document.getElementById("job_pop_tags").innerHTML = tags;
		document.getElementById("job_pop_typePay").innerHTML = type+", $"+pay+"/hour";
		document.getElementById("job_pop_date").innerHTML = "Posted: "+date;
		document.getElementById("job_pop_accept").setAttribute( "onclick", "job_apply('"+id+"', '"+empname+"', '"+title+"', '"+loc+"')");
			toggle_visibility("job_pop");//});
	});
}

function job_apply(id, empname, title, loc){
	var user = firebase.auth().currentUser;
	if(user){
		var emailFixed = user.email.replace('.','(');
		firebase.database().ref('users/'+emailFixed).once('value', function(snapshot){
			if(snapshot.val().type != 'finder'){
				document.querySelector("#job_pop_error").style.display = "block";
				return;}
			toggle_visibility("job_pop");
			if(!snapshot.val().name) document.querySelector("#appName").disabled = "disabled";
			else document.querySelector("#appName").disabled = "";
			document.querySelector("#appNameText").innerHTML="Name: "+(snapshot.val().name || "None");
			if(!snapshot.val().loc) document.querySelector("#appLocation").disabled = "disabled";
			else document.querySelector("#appLocation").disabled = "";
			document.querySelector("#appLocationText").innerHTML="Location: "+(snapshot.val().loc || "None");
			document.querySelector("#appEmailText").innerHTML="Email: "+ user.email;
			if(!snapshot.val().phone) document.querySelector("#appPhone").disabled = "disabled";
			else document.querySelector("#appPhone").disabled = "";
			document.querySelector("#appPhoneText").innerHTML="Phone Number: "+(snapshot.val().phone || "None");
			//document.querySelector("#appPhotoText").innerHTML+=snapshot.name.val();
			//if(!snapshot.val().pic) document.querySelector("#appPhoto").disabled = "disabled";
			//else document.querySelector("#appPhoto").disabled = "";
			document.querySelector("#appBioText").innerHTML="About: "+(snapshot.val().about || "None");
			if(!snapshot.val().about) document.querySelector("#appBio").disabled = "disabled";
			else document.querySelector("#appBio").disabled = "";
			document.getElementById("jobapp_pop_accept").setAttribute( "onclick", "applyToJob('"+id+"', '"+empname+"', '"+title+"', '"+loc+"')");
			toggle_visibility("jobapp_pop");
		});
	}else document.querySelector("#job_pop_error").style.display = "block";
}

function applyToJob (jobid, empname, title, loc) {
	var user = firebase.auth().currentUser;
	if(user){
		var emailFixed = user.email.replace('.','(');
		firebase.database().ref('users/'+emailFixed).once('value', function(snapshot){
			if(snapshot.val().type != "finder") return;
			const jobappRef = firebase.database().ref("jobs/"+jobid+"/applications");
			const userappRef = firebase.database().ref("users/"+emailFixed+"/applications");
			const appRef = firebase.database().ref("applications");
			var applicant_name = "Not Provided";
			var applicant_username = snapshot.val().username;
			var applicant_bio = "Not Provided";
			var applicant_email = "Not Provided";
			var applicant_phone = "Not Provided";
			var applicant_photo = "Not Provided";
			var applicant_resume = "Not Provided";
			var applicant_loc = "Not Provided";
			var applicant_notes = document.querySelector("#appNotes").value;
			if(document.querySelector("#appName").checked){
				applicant_name = snapshot.val().name || "None";
			}if(document.querySelector("#appBio").checked){
				applicant_bio = snapshot.val().about || "None";
			}if(document.querySelector("#appEmail").checked){
				applicant_email = user.email || "None";
			}if(document.querySelector("#appPhone").checked){
				applicant_phone = snapshot.val().phone || "None";
			}if(document.querySelector("#appLocation").checked){
				applicant_loc = snapshot.val().loc || "None";
			}if(document.querySelector("#appPhoto").checked){
				applicant_photo = true;
			}if(document.querySelector("#appResume").checked){
				applicant_resume = true;
			}
			var appData = {
				name: applicant_name,
				username: applicant_username,
				loc: applicant_loc,
				about: applicant_bio,
				notes: applicant_notes,
				email: applicant_email,
				phone: applicant_phone
				 ,photo: applicant_photo
				 ,resume: applicant_resume
				 ,jobid: jobid
				 ,jobemp: empname
				 ,jobtitle: title
				 ,jobloc: loc
			}
			var newRef = appRef.push(appData);
			var newRefKey = newRef.key;
			jobappRef.child(newRefKey).set(newRefKey);
			userappRef.child(newRefKey).set(newRefKey);
			toggle_visibility("jobapp_pop");
			document.querySelector("#appNotes").value = "";
			document.querySelector("#appName").checked = false;
			document.querySelector("#appBio").checked = false;
			document.querySelector("#appEmail").checked = false;
			document.querySelector("#appPhone").checked = false;
			document.querySelector("#appLocation").checked = false;
			document.querySelector("#appPhoto").checked = false;
			document.querySelector("#appResume").checked = false;
		});
	}
}

$("#psw").on('keydown.sortable', function(event) {
        if(event.keyCode == 13){
			login();
		}
});

$("#login_pop").mouseup(function(e)
{
    var container = $("#login_pop_inner");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target)
		&& container.has(e.target).length === 0)
    {
        $("#login_pop").hide();
    }
});

$("#job_pop").mouseup(function(e)
{
    var container = $("#job_pop_inner");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target)
		&& container.has(e.target).length === 0)
    {
        $("#job_pop").hide();
    }
});

$("#jobapp_pop").mouseup(function(e)
{
    var container = $("#jobapp_pop_inner");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target)
		&& container.has(e.target).length === 0)
    {
        $("#jobapp_pop").hide();
    }
});

function hide_popups(){
	document.getElementById("login_pop").style.display = 'none';
	document.getElementById("job_pop").style.display = 'none';
}

function fill_jobs_list(){
	firebase.database().ref('jobs').once('value', function(snapshot){
		ordered_jobs = [];
		for (var job_id in snapshot.val()){
			var subsnap = snapshot.child(job_id);
			var empname = subsnap.child("employer").val();
			var titlename = subsnap.child("title").val();
			var notes = subsnap.child("notes").val();
			var lloc = subsnap.child("loc").val();
			var typePay = subsnap.child("type").val() + ": $" + subsnap.child("pay").val() + "/hour";
			var lat = subsnap.child("lat").val();
			var lng = subsnap.child("lng").val();
			var date = subsnap.child("posted").val();
			var about = subsnap.child("notes").val();
			var loc;
			if(lat != null && lng != null){
				loc = new google.maps.LatLng(lat, lng);
			}else{
				loc = new google.maps.LatLng(0,0);
			}
			var dist = google.maps.geometry.spherical.computeDistanceBetween(loc, userloc)/1609.34;
			var this_job = {date: date, title: titlename, employer: empname, typePay: typePay, id: job_id, lat: lat, lng: lng, dist:dist, loc: lloc, notes: about};
			ordered_jobs.unshift(this_job);
			//goes here
		}
	});
}

function first_jobs_fill(){
	firebase.database().ref('jobs').once('value', function(snapshot){
		ordered_jobs = [];
		for (var job_id in snapshot.val()){
			var subsnap = snapshot.child(job_id);
			var empname = subsnap.child("employer").val();
			var titlename = subsnap.child("title").val();
			var notes = subsnap.child("notes").val();
			var lloc = subsnap.child("loc").val();
			var typePay = subsnap.child("type").val() + ": $" + subsnap.child("pay").val() + "/hour";
			var lat = subsnap.child("lat").val();
			var lng = subsnap.child("lng").val();
			var date = subsnap.child("posted").val();
			var about = subsnap.child("notes").val();
			var loc;
			if(lat != null && lng != null){
				loc = new google.maps.LatLng(lat, lng);
			}else{
				loc = new google.maps.LatLng(0,0);
			}
			var dist = google.maps.geometry.spherical.computeDistanceBetween(loc, userloc)/1609.34;
			var this_job = {date: date, title: titlename, employer: empname, typePay: typePay, id: job_id, lat: lat, lng: lng, dist:dist, loc: lloc, notes: about};
			ordered_jobs.unshift(this_job);
			//goes here
		}
	sort_jobs_list();
	});
}

function sort_jobs_list(){
	fill_jobs_list();
	for(job in ordered_jobs){
		loc = new google.maps.LatLng(ordered_jobs[job].lat, ordered_jobs[job].lng);
		ordered_jobs[job].dist = google.maps.geometry.spherical.computeDistanceBetween(loc, userloc)/1609.34;
	}
	//filter by search string
	//goes here-----------
	// Concat employer/title/notes/location with spaces
	var filter = document.querySelector("#mySearch").value;
	filter = filter.toLowerCase();
	filter_pre = " " + filter;
	filter_post = filter + " ";
	var ss = "";
	for (var i = 0; i < ordered_jobs.length; i++){
		ss = "";
		var job = ordered_jobs[i];
		ss += job.title + " " + job.employer + " " + job.notes + " " + job.loc;
		ss = ss.toLowerCase();
		if(ss.search(filter_pre) == -1 && ss.search(filter_post) == -1){
			ordered_jobs.splice(i, 1);
			i--;
		}
	}
	// if search string in concat, keep in list
	// else discard
	// if multiple strings (comma sep) require all
	//--------------------
	if(ordered_jobs)
		ordered_jobs.sort(function(a,b){return a.dist-b.dist;});
	var i = 0;
	for (job in ordered_jobs){
		/*etc*/
		document.getElementById("Job"+(i+1).toString()).style.display = "block";
		document.getElementById("Job"+(i+1).toString()).setAttribute( "onclick", "open_job_popup('"+ordered_jobs[job].id+"')");
		document.getElementById("Job"+(i+1).toString()+"_employer").innerHTML = ordered_jobs[job].employer;
		document.getElementById("Job"+(i+1).toString()+"_title").innerHTML = ordered_jobs[job].title;
		document.getElementById("Job"+(i+1).toString()+"_typePay").innerHTML = ordered_jobs[job].typePay;
		document.getElementById("Job"+(i+1).toString()+"_loc").innerHTML = ordered_jobs[job].loc;
		document.getElementById("Job"+(i+1).toString()+"_dist").innerHTML = (ordered_jobs[job].dist).toFixed(1) + " miles away";
		document.getElementById("Job"+(i+1).toString()+"_date").innerHTML = ordered_jobs[job].date;
		/*etc*/
		i++;
	}for (i; i < 100; i++){
		document.getElementById("Job"+(i+1).toString()).style.display = "none";
	}
}

function page_init(){
	var result = "";
	for(var i = 1; i <= 100; i++){
		result += "<li id=\"Job" + i + "\" onclick=\"open_job_popup('Ident Goes Here')\" style=\"display:none;\">"
		result += "<div class=\"jobListLeft\">";
		result += "<h5 id=\"Job" + i + "_title\"></h5>";
		result += "<p id=\"Job" + i +"_employer\"></p>";
		result += "<p id=\"Job" + i +"_typePay\"></p>";
		result += "</div><div class=\"jobListRight\">";
		result += "<p id=\"Job" + i +"_date\"></p>";
		result += "<p id=\"Job" + i +"_loc\"></p>";
		result += "<h5 id=\"Job" + i + "_dist\"></h5>";
		result += "</div></li>";
	}
    resultElement = document.getElementById('jobList');

	// Set the inner HTML
	resultElement.innerHTML += result;
	first_jobs_fill();
}
page_init();
