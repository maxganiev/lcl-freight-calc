import { data_Selector } from './dataSelector';
import { ui_Setter } from './uiSetter';
import { freightCalc } from './freightCalc';
import { emailSender } from './emailSender';
import { setAlert } from './alert';
import { checkSession } from './session';
import { unitForm } from './unitForm';
import { globeContext } from './globeContext';

document.addEventListener('DOMContentLoaded', () => {
	checkSession();
});

export const execEvents = () => {
	////selecting mode of calculation:
	ui_Setter.link_switchCalcModeToCBM.onclick = ui_Setter.link_switchCalcModeToUnits.onclick = (e) => {
		e.preventDefault();
		ui_Setter.div_inputCBMCalcGroup.style.transform =
			e.target.id === 'link-switch-calc-mode-to-cbm' ? 'rotate3d(0, 1, 0, 180deg)' : 'rotate3d(0, 0, 0, 180deg)';

		Array.from(document.getElementsByClassName('input-param')).forEach((elem) => {
			if (elem.id !== 'input-weight') {
				elem.value = '';
			}
		});
		globeContext.resetDataToDefault();
	};

	////setting working weight and tax to calculate:
	document.body.addEventListener('keyup', (e) => {
		if (e.target.className.includes('input-param')) {
			if (data_Selector.delMode === null && e.code !== 'Backspace') {
				setAlert('err-fillDetails', 'Сначала укажите способ доставки!');
				e.target.value = '';
			} else {
				//validation to exclude text from input:
				if (e.code !== 'Backspace' && e.target.value.match(data_Selector.regex) === null) {
					setAlert('err-fillDetails', 'Введите число!');
					e.target.value = '';
				}
				//max kgs validation for weight input:
				else if (e.target.id === 'input-weight' && e.target.value > 11500) {
					setAlert('err-fillDetails', 'Макс. вес к расчету -  11 500 кг!');
					e.target.value = '';
				} else if (data_Selector.volume > 23) {
					setAlert('err-fillDetails', 'Макс. объем к расчету -  23 м. куб.!');
					e.target.value = '';
				} else if (
					Number(data_Selector.input_length.value) *
						Number(data_Selector.input_width.value) *
						Number(data_Selector.input_height.value) >
						23 ||
					Number(data_Selector.input_volume.value) > 23
				) {
					setAlert('err-fillDetails', 'Макс. объем к расчету -  23 м. куб.!');
					e.target.value = '';
				}

				//float nums validation:
				const temp = e.target.value.indexOf('.') !== -1 && e.target.value.slice(e.target.value.indexOf('.'));
				if (temp && temp.length > 3) {
					setAlert('err-fillDetails', 'Макс. число знаков после запятой - 2');
					e.target.value = '';
				}

				if (e.target.id === 'input-currency') {
					data_Selector.setCurrencyManually(e.target.value);
				}

				data_Selector.setWorkingWeight(
					data_Selector.delMode,
					unitForm.units,
					Number(data_Selector.input_length.value),
					Number(data_Selector.input_width.value),
					Number(data_Selector.input_height.value),
					Number(data_Selector.input_weight.value),
					Number(data_Selector.input_volume.value)
				);

				data_Selector.setTax();
			}
		}
	});

	////calculate and get results:
	document.getElementById('btn-getResults').onclick = async () => {
		const { delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax, weight, volume } = data_Selector;

		console.log(weight, volume);
		if (weight === 0 || volume === 0) {
			setAlert('err-fillDetails', 'Заполните все необходимые поля!');
		} else {
			await freightCalc.getTotalCost(delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax);
			ui_Setter.printRes(freightCalc.totalTransportationCost, data_Selector.selectionData);
			ui_Setter.setMailForm(freightCalc.totalTransportationCost, data_Selector.selectionData);

			Array.from(document.querySelectorAll('.input-param')).forEach((elem) => (elem.value = ''));
		}
	};

	////setting select option list to previous state:
	document.getElementById('btn-returnToPrevState').onclick = (e) => {
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

			ui_Setter.setMailForm(freightCalc.totalTransportationCost, data_Selector.selectionData);
			ui_Setter.printRes(freightCalc.totalTransportationCost, data_Selector.selectionData);
		}

		//hiding button if returned to initial select and there is no way to return:
		if (data_Selector.selectionData.length === 0) {
			e.target.style.visibility = 'hidden';
			data_Selector.delMode = null;
		}
	};

	////selecting options to calculate:
	document.body.addEventListener('change', (e) => {
		switch (e.target.id) {
			case 'selector-delMode':
				data_Selector.setDelMode_and_DepCountriesList(e);

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

	////form event to sent data via ajax call:
	document.body.addEventListener('submit', (e) => {
		if (e.target.id === 'formData') {
			e.preventDefault();
			emailSender.sendEmail();

			Array.from(e.target.children).forEach((child) => (child.value = child.id !== 'btn-Submit' ? '' : child.value));
		}
	});

	document.body.addEventListener('click', (e) => {
		//hide unit form:
		if (e.target.id.includes('icn-hide-unit-form')) {
			unitForm.hideUnitForm();
		}
		//remove unit:
		else if (e.target.id.includes('icn-delete-unit')) {
			const unitName = e.target.parentElement.childNodes[e.target.parentElement.childNodes.length - 1].textContent;
			unitForm.removeUnits(unitName);
		}
		//show update unit form:
		else if (e.target.id.includes('icn-edit-unit')) {
			const unitName = e.target.parentElement.childNodes[e.target.parentElement.childNodes.length - 1].textContent;
			unitForm.showUpdateUnitForm(unitName);
		}
		//hide unit update form:
		else if (e.target.id.includes('icn-hide-update-unitform')) {
			unitForm.hideUpdateUnitForm('list-mask');
		}
		//edit unit:
		else if (e.target.id.includes('btn-submit-unitform-changes')) {
			const values = Array.from(document.getElementById('list-unitForm-update').children)
				.filter((child) => child.firstElementChild.tagName === 'INPUT')
				.map((li) => li.firstElementChild.value);

			values.every((value) => value.match(/^(?!\s*$).+/))
				? unitForm.updateUnits(...values)
				: setAlert('err-fillDetails', 'Заполните все поля!');
		}
	});

	////show disclaimer
	document.getElementById('btn-disclaimer').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(0%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';
		e.target.parentElement.style.visibility = 'visible';
	});

	////hide disclaimer
	document.getElementById('icn-close').addEventListener('click', (e) => {
		e.target.parentElement.style.transform = 'translateX(100%)';
		e.target.parentElement.style.transition = 'transform 0.6s ease-in-out';

		setTimeout(() => {
			e.target.parentElement.style.visibility = 'hidden';
		}, 700);
	});

	////add cargo units:
	document.getElementById('icn-add-unit').addEventListener('click', () => {
		const inputs = [
			Number(data_Selector.input_length.value),
			Number(data_Selector.input_width.value),
			Number(data_Selector.input_height.value),
			Number(data_Selector.input_weight.value),
		];
		inputs.every((input) => input > 0) && unitForm.addUnits(...inputs);

		if (unitForm.units.length > 0 && inputs.every((input) => input > 0)) {
			data_Selector.setVolume(
				data_Selector.delMode,
				Number(data_Selector.input_length.value),
				Number(data_Selector.input_width.value),
				Number(data_Selector.input_height.value),
				unitForm.units
			);

			data_Selector.setWeight(Number(data_Selector.input_weight.value), unitForm.units);

			data_Selector.printData();

			data_Selector.input_length.value =
				data_Selector.input_width.value =
				data_Selector.input_height.value =
				data_Selector.input_weight.value =
					'';
		}
	});

	////show cargo unit form:
	document.getElementById('icn-units').addEventListener('click', () => {
		unitForm.showUnitForm();
	});
};
