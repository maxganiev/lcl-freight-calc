import { data_Selector } from './dataSelector';
import { freightCalc } from './freightCalc';
import { setAlert } from './alert';
import { spinner } from './spinner';

export const emailSender = {
	setFormBody: function (parentElem) {
		if (!Array.from(parentElem.children).some((child) => child.className.includes('email-box'))) {
			const emailBox = document.createElement('div');
			emailBox.setAttribute('class', 'email-box');

			emailBox.innerHTML = `
    <form id='formData' class='formData form' method='post'>
    <label for 'input-inquiry> Введите номер проработки </label>
    <input type='text' id='input-inquiry' class='input-inquiry' placeholder='ПР-' />
    <label for 'input-email> Отправить расчет на электронный адрес </label>
    <input type='email' id='input-email' class='input-email' />
    <input type='submit' id='btn-Submit' class='btn-Submit btn btn-sm' value='Отправить' />
    </form>
    `;

			parentElem.appendChild(emailBox);
		}
	},

	removeFormBody: function (parentElem) {
		while (parentElem.lastElementChild.className.includes('email-box')) {
			parentElem.lastElementChild.remove();
		}
	},

	sendEmail: async function () {
		const eAddress = document.getElementById('input-email').value;
		const inquiry = document.getElementById('input-inquiry').value;
		const regex = /^(?!\s*$).+/;

		const eHeaders = [
			'<b> Расчет сделан: </b>',
			'<b> Курс валюты: </b>',
			'<b> Способ доставки: </b>',
			'<b> Страна отправки: </b>',
			'<b> Условия поставки: </b>',
			'<b> Порт доставки: </b>',
			'<b> Итоговая стоимость расходов в стране отправки (USD): </b>',
			'<b> Итоговая стоимость локальных расходов в стране назначения (руб.): </b>',
			'<big> Итоговая стоимость, включая НДС 20% (руб.): </big>',
		];

		const eBodyMapped = freightCalc.optionsCostList.map(
			(str, index) =>
				eHeaders[index] +
				' ' +
				(typeof str === 'number' ? new Intl.NumberFormat('ru-RU').format(str.toFixed(2)) : str) +
				'\n' +
				'\n'
		);
		eBodyMapped.unshift('<pre>' + '\n' + '\n');

		const { delMode, workingWeight } = data_Selector;

		const eBody =
			eBodyMapped.join(' ') +
			` Расчет выполнен для груза <b> ${
				delMode === 'railMode' ? 'объемом ' + workingWeight + ' куб.м.' : 'рабочим весом ' + workingWeight + ' кг'
			} </b> </pre>`;

		if (!eAddress.match(regex)) {
			setAlert('err-fillDetails', 'Введите электронный адрес!');
		} else
			try {
				spinner.addSpinner();

				const formData = new FormData();
				formData.append('callback', 'getGmailApi');

				const request = await fetch('../proxy.php', {
					method: 'POST',
					headers: {
						Accept: 'application/json',
					},
					body: formData,
				});

				const res = await request.json();

				await Email.send({
					Host: 'smtp.gmail.com',
					Username: 'eservice.robot@gmail.com',
					Password: atob(atob(res)),
					To: eAddress,
					From: 'eservice.robot@gmail.com',
					Subject: `Номер проработки: ПР-${inquiry}`,
					Body: eBody,
				});

				setAlert('success', 'Сообщение успешно отправлено.');
				spinner.removeSpinner();
			} catch (err) {
				spinner.removeSpinner();
				console.log(err);
				setAlert('err-fillDetails', 'Возникла проблема с отправкой сообщения. Повторите попытку позже.');
			}
	},
};
