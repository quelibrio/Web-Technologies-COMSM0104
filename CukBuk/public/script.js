function out(){
	$('#inuser').hide();
	$('#inout').hide();
	$('#outup').show();
	$('#outin').show();
}

function search(){
	var keyword = $('#inrecipe')[0];
	var params = {
		keyword: keyword.value
	}
	$.ajax({
		type:'POST',
		url:"./search",
		contentType: 'application/x-www-form-urlencoded'
		data:params,
		success:
			success: function (response) {
				localStorage.setItem("keyword",response.result.keyword);
				$(location).attr('href','search.html');
			},
			error: function (xhr, status, error) {
				//var err = eval("(" + xhr.responseText + ")");
				$('#errorMessage').innerHTML = err;
			},
			done: function (response) {
			}

		});

		$('#errorMessage').text("Unable to create an user with that name.");
}

$.validator.setDefaults({
	submitHandler: function(){
		alert("Submit successfully");
	}
});

function register2admin() {
	var email = $('#registeremail')[0];
	var username = $('#registerusrname')[0];
	var password = $('#registerpass')[0];
	var confirm = $('#registerpass2')[0];
	// since it does not work with jquery validation, we validate manually
	if (confirm.value != password.value) {
		$('#errorMessage').text("Passwords dont match.");
		$('#registerpass').css('border','1px solid red');
		$('#registerpass2').css('border','1px solid red');}
	else {
		var dataValue = {
			email: email.value,
			username: username.value,
			password: password.value,
		}
		$.ajax({
			type: 'POST',
			url: "./register",
			contentType: 'application/x-www-form-urlencoded',
			//Add form data
			data: dataValue,
			success: function (response) {
				localStorage.setItem("token", response.result.token);
				localStorage.setItem("username", response.result.username);
				$('#inuser').show();
				$('#inout').show();
				$('#outup').hide();
				$('#outin').hide();
			},
			error: function (xhr, status, error) {
				//var err = eval("(" + xhr.responseText + ")");
				$('#errorMessage').innerHTML = err;
			},
			done: function (response) {
			}

		});

		$('#errorMessage').text("Unable to create an user with that name.");
	}
}
function login2admin() {
	var username = $('#loginusrname')[0];
	var password = $('#loginpass')[0];
	var dataValue = {
		username: username.value,
		password: password.value,
	}
	$.ajax({
		type: 'POST',
		url: "./login",
		dataType: 'json',
		cache:false,
		timeout:5000,
		//contentType: 'application/x-www-form-urlencoded',
		//Add form data
		data: dataValue,
		success: function (response) {
			localStorage.setItem("token", response.result.token);
			localStorage.setItem("username", response.result.username);
				$('#inuser').show();
				$('#inout').show();
				$('#outup').hide();
				$('#outin').hide();
		},
		error: function (xhr, status, error) {
			//var err = eval("(" + xhr.responseText + ")");
			$('#errorMessage').innerHTML = err;
		},
		done: function(response) {
		}
	})
	$('#errorMessage').text("Unable to match username/password.");
}
