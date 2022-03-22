import { emailSender } from './emailSender';
import { freightCalc } from './freightCalc';
import { data_Selector } from './dataSelector';

//Object to setup UI:
export const ui_Setter = {
	////DOM elements:
	calculatorResults: document.getElementById('calculator-results'),
	calculatorNavPanel: document.getElementById('calculator-navPanel'),
	btnToGetResults: document.getElementById('btn-getResults'),
	div_inputCBMCalcGroup: document.getElementById('input-cbm-calc-group'),
	link_switchCalcModeToCBM: document.getElementById('link-switch-calc-mode-to-cbm'),
	link_switchCalcModeToUnits: document.getElementById('link-switch-calc-mode-to-units'),

	////calcs result:
	calcRes: null,

	////max number of select elements to select options from:
	maxNumberOfSelectors: 4,

	////clean up select and populate it with proper option list:
	populateOptionList: function (ref, id, refList) {
		//resetting id
		ref.removeAttribute('id');
		ref.setAttribute('id', id);

		//clearing options list
		while (ref.firstElementChild) {
			ref.removeChild(ref.firstElementChild);
		}

		//populating options list
		const newSelector = document.getElementById(id);

		refList.forEach((val, index) => {
			const option = document.createElement('option');
			option.disabled = index === 0 && true;
			option.selected = index === 0 && true;
			option.value = val;
			option.innerHTML = val;
			newSelector.appendChild(option);
		});
	},

	////adding info against selection of data from dataSelector object:
	displayDataOnSelection: function (selectionDataArr, selectorElement) {
		const currentSelectionData = selectionDataArr.slice(0, selectionDataArr.length + 1);
		selectorElement.disabled = selectionDataArr.length < this.maxNumberOfSelectors ? false : true;

		const info = document.createElement('p');
		currentSelectionData.forEach((data) => {
			info.innerText = data;
			this.calculatorResults.appendChild(info);

			info.style.transform = 'translateX(300%)';
			setTimeout(() => {
				info.style.transform = 'translateX(0%)';
				info.style.transition = 'transform 0.4s ease-in-out';
			}, 0);
		});

		while (this.calculatorResults.children.length > selectionDataArr.length) {
			this.calculatorResults.lastElementChild.remove();
		}

		this.btnToGetResults.style.visibility = selectionDataArr.length < this.maxNumberOfSelectors ? 'hidden' : 'visible';
	},

	////apend or remove emailBox against btnToGetResults click ev:
	setMailForm: function (totalTransportationCost, selectionDataArr) {
		totalTransportationCost !== 0 && selectionDataArr.length === this.maxNumberOfSelectors
			? emailSender.setFormBody(this.calculatorNavPanel)
			: emailSender.removeFormBody(this.calculatorNavPanel);
	},

	////print calc result:
	printRes: function (resultToPrint, selectionDataArr) {
		this.calcRes = new Intl.NumberFormat('ru-RU').format(resultToPrint.toFixed(2));

		while (this.calculatorResults.nextElementSibling && this.calculatorResults.nextElementSibling.className.includes('result')) {
			this.calculatorResults.nextElementSibling.remove();
		}

		const result = document.createElement('div');
		result.id = 'result';
		result.className = 'result';

		result.innerHTML = `
		<br />
		<p> Итоговая стоимость доставки: ${this.calcRes} руб. </p>
		<button id='popup' class='btn-Popup btn btn-sm'> Узнать, что включено в ставку. </button>
		<br />
		<ul id='costOptionsList' class='list'> </ul>
		`;

		this.calculatorResults.insertAdjacentElement('afterend', result);

		result.addEventListener('click', (e) => {
			if (e.target.id === 'popup') {
				this.showPopup(document.getElementById('costOptionsList'));
				e.target.id = 'popup-hide';
				e.target.innerHTML = 'Свернуть';
			} else if (e.target.id === 'popup-hide') {
				this.hidePopup(document.getElementById('costOptionsList'));
				e.target.id = 'popup';
				e.target.innerHTML = 'Узнать, что включено в ставку';
			}
		});

		selectionDataArr.length < this.maxNumberOfSelectors && result.remove();
	},

	////expand infromation about additional expenses against click:
	showPopup: function (parentElem) {
		this.hidePopup(parentElem);

		const popupHeaders = [
			'Расчет сделан',
			'Курс валюты',
			'Пошлина (%)',
			'Способ доставки',
			'Страна отправки',
			'Условия поставки',
			'Порт доставки',
			'Итоговая стоимость расходов в стране отправки (USD)',
			'Итоговая стоимость локальных расходов в стране назначения (руб.)',
			' Итоговая стоимость, включая НДС 20% (руб.)',
		];

		const { delMode, workingWeight } = data_Selector;

		freightCalc.optionsCostList.forEach((option, index) => {
			const listItem = document.createElement('li');
			listItem.setAttribute('class', 'listItem');

			listItem.innerHTML = `${popupHeaders[index]}: ${
				typeof option === 'number'
					? '<span class="span-listItem">' + new Intl.NumberFormat('ru-RU').format(option.toFixed(2)) + '</span>'
					: '<span class="span-listItem">' + option + '</span>'
			}`;

			if (index === freightCalc.optionsCostList.length - 1) {
				listItem.innerHTML += `<br /> <span class="span-listItem">Расчет выполнен для груза ${
					delMode === 'railMode'
						? 'объемом ' + workingWeight.toFixed(2) + ' куб.м.'
						: 'рабочим весом ' + workingWeight.toFixed(2) + ' кг'
				} </span>`;
			}

			setTimeout(() => {
				parentElem.appendChild(listItem);

				window.scrollTo(0, listItem.getBoundingClientRect().bottom * 1.05);
			}, 100 * index);
		});
	},

	////hide popup:
	hidePopup: function (parentElem) {
		while (parentElem.firstElementChild) {
			parentElem.removeChild(parentElem.firstElementChild);
		}
	},
};
