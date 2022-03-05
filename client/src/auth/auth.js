import { setAlert } from '../alert';
import { spinner } from '../spinner';

(async function () {
	document.body.style.visibility = 'hidden';

	if (localStorage.getItem('lcl_ls')) {
		const token = JSON.parse(localStorage.getItem('lcl_ls')).token;
		const formData = new FormData();
		formData.append('auth_token', token);
		try {
			document.body.style.visibility = 'visible';
			spinner.addSpinner();
			const req = await fetch('../db/auth.php', {
				method: 'POST',
				body: formData,
				Accept: 'application/json',
			});

			if (req.status === 200) {
				spinner.removeSpinner();
				window.location.replace('fileuploader.html');
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		document.body.style.visibility = 'visible';
		const authForm = document.getElementById('auth-form');
		const authEmail = document.getElementById('auth-email');
		const authPass = document.getElementById('auth-pass');
		const regex = /^(?!\s*$).+/;
		const togglerPassGroup = document.getElementsByClassName('toggler-pass-gr');
		const togglerPassCheckbox = document.getElementById('toggler-pass');

		authPass.onkeyup = (e) => {
			Array.from(togglerPassGroup).forEach((elem) => (elem.style.visibility = e.target.value ? 'visible' : 'hidden'));

			if (!e.target.value) {
				togglerPassCheckbox.checked = false;

				//label:
				togglerPassCheckbox.previousElementSibling.innerText = 'Показать пароль';
				e.target.type = 'password';
			}
		};

		togglerPassCheckbox.onchange = (e) => {
			authPass.type = e.target.checked ? 'text' : 'password';

			//label:
			e.target.previousElementSibling.innerText = authPass.type === 'text' ? 'Скрыть пароль' : 'Показать пароль';
		};

		authForm.addEventListener('submit', async (e) => {
			e.preventDefault();

			if (authEmail.value.match(regex) && authPass.value.match(regex) && !authPass.value.match(/[\u0401\u0451\u0410-\u044f]/)) {
				const formData = new FormData();
				formData.append('auth_email', encodeURIComponent(window.btoa(authEmail.value)));
				formData.append('auth_pass', encodeURIComponent(window.btoa(authPass.value)));

				try {
					spinner.addSpinner();
					const req = await fetch('../db/auth.php', {
						method: 'POST',
						body: formData,
						Accept: 'application/json',
					});

					if (req.status === 200) {
						spinner.removeSpinner();
						const res = await req.json();
						localStorage.setItem('lcl_ls', JSON.stringify(res));
						window.location.replace('fileuploader.html');
					} else {
						spinner.removeSpinner();
						setAlert('err-fillDetails', 'Отказано в доступе');
					}
				} catch (error) {
					console.log(error);
				}
			} else {
				setAlert('err-fillDetails', 'Введите корректные реквизиты');
			}
		});
	}
})();
