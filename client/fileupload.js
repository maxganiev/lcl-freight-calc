(async function () {
	if (localStorage.getItem('lcl_ls')) {
		const token = JSON.parse(localStorage.getItem('lcl_ls')).token;
		const formData = new FormData();
		formData.append('auth_token', token);
		try {
			const req = await fetch('../db/auth.php', {
				method: 'POST',
				body: formData,
				Accept: 'application/json',
			});

			if (req.status !== 200) {
				window.location.replace('auth.html');
				localStorage.removeItem('lcl_ls');
			}
		} catch (error) {
			console.log(error);
		}

		//const elapsed = 86400000;
		const elapsed = 120000;

		if (Date.now() - JSON.parse(localStorage.getItem('lcl_ls')).loggedin > elapsed) {
			localStorage.removeItem('lcl_ls');
			window.location.replace('auth.html');
		}
	} else {
		window.location.replace('auth.html');
	}
})();

if (!localStorage.getItem('lcl_ls')) {
	window.location.replace('auth.html');
}
