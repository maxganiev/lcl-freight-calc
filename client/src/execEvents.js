import { data_Selector } from './dataSelector';
import { ui_Setter } from './uiSetter';
import { freightCalc } from './freightCalc';
import { emailSender } from './emailSender';
import { setAlert } from './alert';
import { checkSession } from './session';

document.addEventListener('DOMContentLoaded', () => {
	checkSession();
});

export const execEvents = () => {
	////setting working weight and tax to calculate:
	Array.from(document.querySelectorAll('.input-param')).forEach(
		(elem) =>
			(elem.onkeyup = (e) => {
				//validation to exclude text from input:
				if (e.code !== 'Backspace' && e.target.value.match(data_Selector.regex) === null) {
					setAlert('err-fillDetails', 'Введите число!');
					e.target.value = '';
				}
				//max CBM validation for volume input:
				else if (e.target.id === 'input-volume' && e.target.value > 23) {
					setAlert('err-fillDetails', 'Макс. объем к расчету - 23 куб. м!');
					e.target.value = '';
				}
				//max kgs validation for weight input:
				else if (e.target.id === 'input-weight' && e.target.value > 11500) {
					setAlert('err-fillDetails', 'Макс. вес к расчету -  11 500 кг!');
					e.target.value = '';
				}

				data_Selector.setWorkingWeight(e.target.value);
				data_Selector.setTax(e.target.value);

				if (e.target.id === 'input-currency') {
					data_Selector.setCurrencyManually(e.target.value);
				}
			})
	);

	////calculate and get results:
	document.getElementById('btn-getResults').onclick = async () => {
		const { delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax } = data_Selector;

		if (
			Array.from(document.querySelectorAll('.input-param')).some(
				(elem) => (elem.value === '' || Number(elem.value) === 0) && elem.id !== 'input-tax' && elem.id !== 'input-currency'
			)
		) {
			setAlert('err-fillDetails', 'Заполните все необходимые поля!');
		} else {
			await freightCalc.getTotalTransportationCost(delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax);
			await ui_Setter.printRes(freightCalc.totalTransportationCost, data_Selector.selectionData);
			await ui_Setter.setMailForm(freightCalc.totalTransportationCost, data_Selector.selectionData);
		}
	};

	////setting select option list to previous state:
	document.getElementById('btn-returnToPrevState').onclick = async (e) => {
		//data to populate options list using ui_Setter.populateOptionList() method; population starts with index 1, when data_Selector.selectionData.length > 0, that's why first element in array is null:
		const dataToPopulateOptionsList = [
			null,
			{
				ref: document.getElementById('selector-Country'),
				id: 'selector-delMode',
				refList: ['Выберите способ доставки', 'Ж/Д', 'Авиа'],
			},

			{
				ref: document.getElementById('selector-deliveryTerms'),
				id: 'selector-Country',
				refList: data_Selector.depCountriesList,
			},

			{
				ref: document.getElementById('selector-POL'),
				id: 'selector-deliveryTerms',
				refList: data_Selector.deliveryTermsList,
			},

			{
				ref: document.getElementById('selector-POL'),
				id: 'selector-POL',
				refList: data_Selector.portsOfLadingList,
			},
		];

		//selecting a proper object from array basing on data_Selector.selectionData.length:
		if (data_Selector.selectionData.length > 0) {
			//destructing each object received from array to fill ui_Setter.populateOptionList arguments list:
			const { ref, id, refList } = dataToPopulateOptionsList[data_Selector.selectionData.length];
			ui_Setter.populateOptionList(ref, id, refList);

			//reducing selectionData used to populate optionsList by one against each click:
			data_Selector.selectionData.pop();

			ui_Setter.displayDataOnSelection(
				//getting current data:
				data_Selector.selectionData,
				//getting the only select presented in DOM atm by its tagName:
				document.getElementsByTagName('select')[0]
			);

			await ui_Setter.setMailForm(freightCalc.totalTransportationCost, data_Selector.selectionData);
			await ui_Setter.printRes(freightCalc.totalTransportationCost, data_Selector.selectionData);
		}

		//hiding button if returned to initial select and there is no way to return:
		if (data_Selector.selectionData.length === 0) {
			e.target.style.visibility = 'hidden';
		}
	};

	////selecting options to calculate:
	document.body.addEventListener('change', (e) => {
		switch (e.target.id) {
			case 'selector-delMode':
				data_Selector.setDelMode_and_DepCountriesList(e);
				data_Selector.setWorkingWeight(e);
				//showing return buttom when first select option was switched:
				document.getElementById('btn-returnToPrevState').style.visibility = 'visible';
				break;

			case 'selector-Country':
				data_Selector.setDepCountry(e);
				break;

			case 'selector-deliveryTerms':
				data_Selector.setDeliveryTerm(e);
				break;

			case 'selector-POL':
				data_Selector.setPortOfLading(e);
				break;
		}
	});
};

////form event to sent data via ajax call:
document.body.addEventListener('submit', (e) => {
	if (e.target.id === 'formData') {
		e.preventDefault();
		emailSender.sendEmail();

		Array.from(e.target.children).forEach((child) => (child.value = child.id !== 'btn-Submit' ? '' : child.value));
	}
});
