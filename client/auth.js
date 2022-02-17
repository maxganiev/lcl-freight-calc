if (localStorage.getItem('lcl_ls')) {
	window.location.replace('fileuploader.html');
}

document.addEventListener('DOMContentLoaded', () => {
	const authForm = document.getElementById('auth-form');
	const authEmail = document.getElementById('auth-email');
	const authPass = document.getElementById('auth-pass');

	authForm.addEventListener('submit', async (e) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('auth_email', encodeURIComponent(window.btoa(authEmail.value)));
		formData.append('auth_pass', encodeURIComponent(window.btoa(authPass.value)));

		try {
			const req = await fetch('../db/auth.php', {
				method: 'POST',
				body: formData,
				Accept: 'application/json',
			});

			if (req.status === 200) {
				const res = await req.json();
				console.log(res);

				localStorage.setItem('lcl_ls', JSON.stringify(res));

				setTimeout(() => {
					window.location.replace('fileuploader.html');
				}, 200);
			}
		} catch (error) {
			console.log(error);
		}
	});
});
