if (!localStorage.getItem('lcl_ls')) {
	window.location.replace('auth.html');
}

if (Date.now() - JSON.parse(localStorage.getItem('lcl_ls')).loggedin > 86400000) {
	localStorage.removeItem('lcl_ls');
	window.location.replace('fileuploader.html');
}
