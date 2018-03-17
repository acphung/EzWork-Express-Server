function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block'){
        e.style.display = 'none';
   }else{
        e.style.display = 'block';}
}

function logout() {
    firebase.auth().signOut();
	window.location.href ="/";
}

firebase.auth().onAuthStateChanged(function(user){
    if(user) {
		firebase.database().ref('users/' + user.email.replace('.','(')).once('value', function(snapshot) {
			var username = snapshot.val().username;
			var type = snapshot.val().type;
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
			page_init();

    }else window.location.href ="/";
});





function hide_popups(){
	document.getElementById("login_pop").style.display = 'none';
	document.getElementById("job_pop").style.display = 'none';
}

function remove_app(appid, jobid){
	firebase.database().ref('applications/'+appid).remove();
	firebase.database().ref('jobs/'+jobid).once('value', function(snapshot){
		if(snapshot.val() !== null)
			firebase.database().ref('jobs/'+jobid+'/applications/'+appid).remove();
	});
	var user = firebase.auth().currentUser;
	var emailFixed = user.email.replace('.','(');
	firebase.database().ref('users/'+emailFixed+'/applications/'+appid).remove();
	page_init();
}




function page_init(){
	document.getElementById('rejectedList').innerHTML = "";
	document.getElementById('acceptedList').innerHTML = "";
	document.getElementById('jobList').innerHTML = "";
	var user = firebase.auth().currentUser;
	var emailFixed = user.email.replace('.','(');
	firebase.database().ref('users/'+emailFixed+'/applications').once('value',function(snapshot){
		for(var app_id in snapshot.val()){
			firebase.database().ref('applications/'+app_id).once('value',function(snapshot2){
				var result = "";
				result += "<li>";
				result += "<div class=\"jobListLeft\">";
				result += "<h5>"+snapshot2.val().jobtitle+"</h5>";
				result += "<p>"+ snapshot2.val().jobemp+"</p>";
				result += "<p>"+snapshot2.val().jobloc+"</p>";
				if(snapshot2.val().status == "accepted")
				{
					result+="<p>Contact: "+snapshot2.val().contact+"</p>";
				}
				result += "</div><div class=\"jobListRight\">";
				result += "<button class=\"remove\" onclick=\"remove_app('"+snapshot2.key+"','"+snapshot2.val().jobid+"')\">Remove</button>";
				result += "</div></li>";

				if(snapshot2.val().status == "rejected")
				{
					document.getElementById('rejectedList').innerHTML += result;
				}else if(snapshot2.val().status == "accepted")
				{
					document.getElementById('acceptedList').innerHTML += result;
				}else
					document.getElementById('jobList').innerHTML += result;




			});
		}
	});


}
