

function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block'){
        e.style.display = 'none';
   }else{
        e.style.display = 'block';}
}

firebase.auth().onAuthStateChanged(function(user){
    if(user) {
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
			page_init();

    } else {
		window.location.href = "/";
    }
});

function logout() {
    firebase.auth().signOut();
	window.location.href = "/";
}


function open_app_popup(id){

		firebase.database().ref('applications/'+id).once('value', function(snapshot) {
			var snap = snapshot.val();
			var username = snap.username;
			var name = snap.name;
			var loc = snap.loc;
			var email = snap.email;
			var phone = snap.phone;
			var about = snap.about;
			var notes = snap.notes;
			var jobid = snap.jobid;

			document.querySelector("#app_pop_accept").setAttribute( "onclick", "acc_app('"+id+"')");
            document.querySelector("#app_pop_reject").setAttribute( "onclick", "rej_app('"+id+"','"+jobid+"')");
			document.getElementById("app_pop_username").innerHTML = username;
			document.getElementById("app_pop_name").innerHTML = name;
			document.getElementById("app_pop_loc").innerHTML = loc;
			document.getElementById("app_pop_email").innerHTML = email;
			document.getElementById("app_pop_phone").innerHTML = phone;
			document.getElementById("app_pop_bio").innerHTML = about;
			document.getElementById("app_pop_notes").innerHTML = notes;
			if(snap.photo == true){
				var storageref = firebase.storage().ref('users/'+email.replace('.','(')+'/profile_pic.jpg').getDownloadURL().then(
					function(URL){
						document.querySelector("#app_pop_pic").src = URL;
					}, function(error){
						document.querySelector("#app_pop_pic").src = "/images/ProfilePic.png";
					});
			}if(snap.resume == true){
				var storageref = firebase.storage().ref('users/'+email.replace('.','(')+'/resume.pdf').getDownloadURL().then(
					function(URL){
						document.querySelector("#app_pop_res").href = URL;
						document.querySelector("#app_pop_res").style.display = "inline";
					}, function(error){
						document.querySelector("#app_pop_res").href = "#";
						document.querySelector("#app_pop_res").style.display = "none";
					});
			}
			toggle_visibility("app_pop");
		});
}

$("#app_pop").mouseup(function(e)
{
    var container = $("#app_pop_inner");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target)
		&& container.has(e.target).length === 0)
    {
        $("#app_pop").hide();
    }
});
$("#delete_pop").mouseup(function(e)
{
    var container = $("#delete_pop_inner");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target)
        && container.has(e.target).length === 0)
    {
        $("#delete_pop").hide();
    }
});
function hide_popups(){
	document.getElementById("job_pop").style.display = 'none';
}

function rmv_job(jobid){
	document.querySelector("#confirm_remove_button").setAttribute( "onclick", "del_job('"+jobid+"')");
	toggle_visibility("delete_pop");
}

function del_job(jobid){
	toggle_visibility("delete_pop");
	var user = firebase.auth().currentUser;
    var emailFixed = user.email.replace('.','(');
	firebase.database().ref('jobs/'+jobid+'/applications').once('value', function(snapshot){
		for(var app_id in snapshot.val()){
			firebase.database().ref('applications/'+app_id).once('value', function(snapshot2){
				if(snapshot2.val().status !== "accepted"){
					firebase.database().ref('applications/'+snapshot2.key+'/status').set("rejected");
				}
			});
		}firebase.database().ref("jobs/"+jobid).remove();
	});
	firebase.database().ref('users/'+emailFixed+'/jobs/'+jobid).remove();
	var jobdiv = document.getElementById(jobid);
    var pardiv = document.getElementById('jobList');
    pardiv.removeChild(jobdiv);
}

function acc_app(appid){
	toggle_visibility("app_pop")
	firebase.database().ref('applications/'+appid+'/status').set('accepted');
}

function rej_app(appid, jobid){
	toggle_visibility("app_pop")
	firebase.database().ref('jobs/'+jobid+'/applications/'+appid).remove();
	firebase.database().ref('applications/'+appid+'/status').set('rejected');
	var jobdiv = document.getElementById(jobid);
    var appelem = document.getElementById(appid);
    jobdiv.removeChild(appelem);
}

function page_init(){
	var user = firebase.auth().currentUser;
	document.getElementById("emp_contact").value = user.email;
	var emailFixed = user.email.replace('.','(');
	firebase.database().ref('users/'+emailFixed+'/jobs').once('value',function(snapshot){
		for(var job_id in snapshot.val()){
			firebase.database().ref('jobs/'+job_id).once('value',function(snapshot2){
				var result = "";
				result += "<div id="+snapshot2.key+">"
				result += "<li>";
				result += "<div class=\"jobListLeft\">";
				result += "<h5>"+snapshot2.val().title+"</h5>";
				result += "<p>"+ snapshot2.val().employer+"</p>";
				result += "<p>"+snapshot2.val().type+": $"+snapshot2.val().pay+"/hour</p>";
				result += "</div><div class=\"jobListRight\">";
				result += "<p>"+snapshot2.val().posted+"</p>";
				result += "<p>"+snapshot2.val().loc+"</p>";
				result += "<button onclick=\"rmv_job('"+snapshot2.key+"')\">Remove Job</button>"
				result += "</div></li></div>";

				document.getElementById('jobList').innerHTML += result;

				firebase.database().ref('jobs/'+snapshot2.key+'/applications').once('value', function(apps){
					for(var appId in apps.val()){
						firebase.database().ref('applications/'+appId).once('value',function(snapshot3){
							var subres = "";
							subres += "<li id=\""+snapshot3.key+"\"class=\"appli\" onclick=\"open_app_popup('"+snapshot3.key+"')\">";
							subres += "<h5>"+snapshot3.val().username+"</h5></li>";
							document.getElementById(snapshot3.val().jobid).innerHTML += subres;
						});
					}
				});

			}, false);
		}
	});


}
