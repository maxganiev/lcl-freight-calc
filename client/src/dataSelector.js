import { ui_Setter } from './uiSetter';
import { setAlert } from './alert';
import { spinner } from './spinner';
import { unitForm } from './unitForm';

//object to control data flow:
export const data_Selector = {
	regex: /^[0-9]*\.?[0-9]*$/,
	delMode: null,
	depCountriesList: [],
	depCountry: null,
	deliveryTermsList: [],
	deliveryTerm: null,
	workingWeight: null,
	portOfLading: null,
	portsOfLadingList: [],
	currency: null,
	tax: null,
	today: new Date().toLocaleDateString('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}),
	selectionData: [],

	//DOM elements:
	selector_main: document.getElementById('selector-delMode'),
	input_weight: document.getElementById('input-weight'),

	//CBM calc group:
	input_length: document.getElementById('input-length'),
	input_width: document.getElementById('input-width'),
	input_height: document.getElementById('input-height'),
	input_volume: null,
	input_volume_output: document.getElementById('input-volume-output'),

	input_tax: document.getElementById('input-tax'),
	//this input is needed if there is problem with currency data server response:
	input_currency: document.getElementById('input-currency'),

	//methods:
	setDelMode_and_DepCountriesList: function (e) {
		let infoToPrint = 'Способ отправки: ';

		switch (e.target.value) {
			case 'Ж/Д':
				this.delMode = 'railMode';
				this.depCountriesList = ['Выберите страну отправки', 'Китай Юг, Центр', 'Китай Север'];
				infoToPrint += e.target.value;
				break;

			case 'Авиа':
				this.delMode = 'airMode';
				this.depCountriesList = ['Выберите страну отправки', 'Корея', 'Китай'];
				infoToPrint += e.target.value;
				break;
		}

		//calling a function to update UI:
		ui_Setter.populateOptionList(this.selector_main, 'selector-Country', this.depCountriesList);

		this.selectionData.push(infoToPrint);
		ui_Setter.displayDataOnSelection(this.selectionData, e.target);
	},

	setDepCountry: function (e) {
		let infoToPrint = 'Страна отправления: ';

		switch (e.target.value) {
			case 'Китай Юг, Центр':
				this.depCountry = 'CN, South_Center';
				infoToPrint += e.target.value;
				break;

			case 'Китай Север':
				this.depCountry = 'CN, North';
				infoToPrint += e.target.value;
				break;

			case 'Корея':
				this.depCountry = 'Kor';
				infoToPrint += e.target.value;
				break;

			case 'Китай':
				this.depCountry = 'CN';
				infoToPrint += e.target.value;
				break;
		}

		this.setDeliveryTermsList();

		ui_Setter.populateOptionList(e.target, 'selector-deliveryTerms', this.deliveryTermsList);

		this.selectionData.push(infoToPrint);
		ui_Setter.displayDataOnSelection(this.selectionData, e.target);
	},

	setDeliveryTermsList: function () {
		switch (this.depCountry) {
			case 'CN, South_Center':
			case 'CN, North':
				this.deliveryTermsList = ['Выберите условия поставки', 'EXW', 'FCA', 'FOB'];
				break;

			case 'Kor':
			case 'CN':
				this.deliveryTermsList = ['Выберите условия поставки', 'EXW', 'FCA'];
				break;
		}
	},

	setDeliveryTerm: function (e) {
		this.deliveryTerm = e.target.value.indexOf('Выберите') === -1 && e.target.value;

		let infoToPrint = `Условия поставки: ${this.deliveryTerm}`;
		this.setPortsOfLadingList();

		ui_Setter.populateOptionList(e.target, 'selector-POL', this.portsOfLadingList);

		this.selectionData.push(infoToPrint);
		ui_Setter.displayDataOnSelection(this.selectionData, e.target);
	},

	setVolume: function (length, width, height, units) {
		if (units.length === 0) {
			this.input_volume = length * width * height;
			this.input_volume_output.textContent = this.input_volume !== 0 ? `Текущий объем: ${this.input_volume} м. куб.` : '';
		} else {
			this.input_volume = unitForm.units.reduce((acc, curr) => acc + curr['Объем (м. куб.)'], 0);
			this.input_volume_output.textContent = `Общий объем: ${this.input_volume.toFixed(2)} м. куб.`;
		}
	},

	setWorkingWeight: function (delMode, length, width, height, units) {
		this.setVolume(length, width, height, units);
		switch (delMode) {
			case 'railMode':
				this.workingWeight = Math.max(this.input_weight.value / 500, this.input_volume);
				break;

			case 'airMode':
				this.workingWeight = Math.max(this.input_weight.value, this.input_volume * 167);
				break;
		}
	},

	setTax: function (e) {
		this.tax = Number(this.input_tax.value) / 100;
	},

	setPortsOfLadingList: function () {
		switch (this.delMode) {
			case 'railMode':
				this.portsOfLadingList = ['Выберите станцию доставки', 'Ворсино/ Электроугли'];
				break;

			case 'airMode':
				this.portsOfLadingList = ['Выберите аэропорт прилета', 'SVO1', 'SVO2', 'DME', 'LED'];
				break;
		}
	},

	setPortOfLading: function (e) {
		this.portOfLading = e.target.value;

		let infoToPrint =
			this.delMode === 'railMode' ? `Станция прибытия: ${this.portOfLading}` : `Аэропорт прилета: ${this.portOfLading}`;

		this.selectionData.push(infoToPrint);
		ui_Setter.displayDataOnSelection(this.selectionData, e.target);
	},

	setCurrency: async function () {
		try {
			spinner.addSpinner();

			const formData = new FormData();
			formData.append('callback', 'getCurrencyAPI');

			const request = await fetch('../proxy.php', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
				},
				body: formData,
			});
			const response = await request.json();

			this.currency = JSON.parse(response).USD_RUB[this.today];
			spinner.removeSpinner();
		} catch (err) {
			spinner.removeSpinner();

			this.currency = undefined;
			this.input_currency.style.display = 'block';
			console.log(err);

			setAlert('err-fillDetails', 'Сбой сервера, введите курс валюты вручную');
		}
	},

	//calling this method if there were problems with currency fetching from server:
	setCurrencyManually: function (e) {
		this.currency = Number(this.input_currency.value);
	},
};
