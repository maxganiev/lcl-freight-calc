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
	weight: 0,

	//CBM calc group:
	input_length: document.getElementById('input-length'),
	input_width: document.getElementById('input-width'),
	input_height: document.getElementById('input-height'),
	input_volume: document.getElementById('input-volume'),
	volume: 0,
	output: document.getElementById('output'),

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

	setWeight: function (weight, units) {
		if (units.length === 0) {
			this.weight = weight;
		} else {
			this.weight = unitForm.units.reduce((acc, curr) => acc + curr['Вес (кг)'], 0);
		}
	},

	setVolume: function (vol, units) {
		if (units.length === 0) {
			this.volume = vol;
		} else {
			this.volume = unitForm.units.reduce((acc, curr) => acc + curr['Объем (м. куб.)'], 0);
		}
	},

	printData: function () {
		if (unitForm.units.length === 0) {
			this.output.innerHTML =
				this.volume !== 0 &&
				this.weight !== 0 &&
				!isNaN(this.volume) &&
				this.weight !== undefined &&
				typeof this.weight !== 'undefined'
					? `Текущий объем: ${this.volume.toFixed(2)} м. куб. <br /> Вес: ${this.weight} кг`
					: '';
		} else {
			this.output.innerHTML =
				this.volume !== 0 &&
				this.weight !== 0 &&
				!isNaN(this.volume) &&
				this.weight !== undefined &&
				typeof this.weight !== 'undefined'
					? `Общий объем: ${this.volume.toFixed(2)} м. куб. <br /> Вес итого: ${this.weight} кг`
					: '';
		}
	},

	setWorkingWeight: function (delMode, units, length = 0, width = 0, height = 0, weight = 0, vol) {
		if (length !== 0 && width !== 0 && height !== 0) {
			const v = length * width * height;
			this.setVolume(v, units);
		} else {
			const v = vol;
			this.setVolume(v, units);
		}

		this.setWeight(weight, units);
		this.printData();

		switch (delMode) {
			case 'railMode':
				this.workingWeight = Math.max(this.weight / 500, this.volume);
				break;

			case 'airMode':
				this.workingWeight = Math.max(this.weight, this.volume * 167);
				break;
		}
	},

	setTax: function () {
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
	setCurrencyManually: function () {
		this.currency = Number(this.input_currency.value);
	},
};
