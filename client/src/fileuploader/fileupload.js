import { setAlert } from '../alert';

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

			if (req.status === 200) {
				const form = document.getElementById('fileuploader-form');
				const fileupload = document.getElementById('fileupload');

				//list of permitted table names in order to update an appropriate table in sql db:
				const fileNamesAcceptable = [
					'exp_rail_cn_north',
					'exp_rail_cn_center_south',
					'exp_air_cn',
					'exp_air_kor',
					'imp_rail_vorsino',
					'imp_air_svo1',
					'imp_air_svo2',
					'imp_air_dme',
					'imp_air_led',
				];

				//.csv validation:
				fileupload.addEventListener('change', (e) => {
					if (e.target.value.slice(-3) !== 'csv') {
						setAlert('err-fillDetails', 'Разрешено использование только файлов .CSV');
						e.target.value = '';
					}

					//filename validation:
					else if (
						!fileNamesAcceptable.includes(e.target.files[0].name.slice(0, e.target.files[0].name.indexOf('.')))
					) {
						setAlert(
							'err-fillDetails',
							'Проверьте название таблицы. Таблица с текущим названием не может быть вложена.'
						);
						e.target.value = '';
					}
				});

				form.addEventListener('submit', async (e) => {
					e.preventDefault();

					if (fileupload.files.length > 0) {
						const formData = new FormData();
						formData.append(
							'fileupload',
							fileupload.files[0],
							fileupload.files[0].name.slice(0, fileupload.files[0].name.indexOf('.'))
						);

						try {
							const req = await fetch('../db/uploadfile.php', {
								method: 'POST',
								body: formData,
							});

							if (req.status === 200) {
								const res = await req.json();
								setAlert('success', res);
								fileupload.value = '';
							}
						} catch (error) {
							console.log(error);
						}
					}
				});
			} else {
				window.location.replace('auth.html');
				localStorage.removeItem('lcl_ls');
			}
		} catch (error) {
			console.log(error);
		}

		//half a day in ms:
		const elapsed = 43200000;
		//const elapsed = 120000;

		if (Date.now() - JSON.parse(localStorage.getItem('lcl_ls')).loggedin > elapsed) {
			localStorage.removeItem('lcl_ls');
			window.location.replace('auth.html');
		}
	} else {
		window.location.replace('auth.html');
	}
})();
