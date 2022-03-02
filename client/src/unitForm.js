import { data_Selector } from './dataSelector';

export const unitForm = {
	parentElem: document.getElementById('body-index'),
	unitIcon: document.getElementById('icn-units'),
	num: 0,
	unit: null,
	units: [],

	addUnits: function (length, width, height) {
		this.num++;

		this.unit = {
			Место: this.num,
			'Длина (м)': length,
			'Ширина (м)': width,
			'Высота (м)': height,
			'Объем (м. куб.)': length * width * height,
		};

		this.units.push(this.unit);

		this.unitIcon.style.visibility = 'visible';
		this.unitIcon.style.transform = 'scale(1.2)';
		this.unitIcon.style.transition = 'transform 0.3s ease-in-out';

		setTimeout(() => {
			this.unitIcon.style.transform = 'scale(1)';
			this.unitIcon.style.transition = 'transform 0.3s ease-in-out';
		}, 500);

		console.log(this.units);
	},

	removeUnits: function (text) {
		const temp = this.units.filter((un) => `${Object.keys(un)[0]} ${un['Место']}` !== text);
		this.units = temp;

		data_Selector.setWorkingWeight(
			data_Selector.delMode,
			Number(data_Selector.input_length.value),
			Number(data_Selector.input_width.value),
			Number(data_Selector.input_height.value),
			this.units
		);

		console.log(data_Selector.workingWeight);

		//handle ids
		this.showUnitForm();
	},

	showUnitForm: function () {
		const list_unitForm =
			this.parentElem.firstElementChild.id !== 'unitForm' ? document.createElement('ul') : document.getElementById('unitForm');

		if (list_unitForm.getAttribute('id') === null) {
			list_unitForm.id = 'unitForm';
			list_unitForm.className = 'list list-unitForm';
		}

		Array.from(list_unitForm.children).forEach((child) => child.tagName !== 'IMG' && child.remove());

		if (!list_unitForm.firstElementChild) {
			const img = document.createElement('img');
			img.src = './assets/minus-solid.svg';
			img.alt = 'Hide form';
			img.id = 'icn-hide-unit-form';
			img.className = 'icn-hide-unit-form';

			img.onload = () => {
				const listItem = document.createElement('li');
				listItem.id = 'listItem-icn-hide-unit-form';
				listItem.insertAdjacentElement('afterbegin', img);
				list_unitForm.insertAdjacentElement('afterbegin', listItem);
			};
		}

		this.units.forEach((un, index) => {
			Object.keys(un).forEach((key) => {
				const listItem = document.createElement('li');
				listItem.innerHTML = key === 'Место' ? `${key} ${un[key]}` : `${key}: ${un[key]}`;

				list_unitForm.appendChild(listItem);
				key === 'Место' &&
					listItem.insertAdjacentHTML(
						'beforeend',
						`<img src="./assets/pen-solid.svg" alt="modify" id="icn-edit-unit-${index}" />  <img src="./assets/delete-left-solid.svg" alt="delete" id="icn-delete-unit-${index}" />`
					);

				key === 'Место' && listItem.setAttribute('class', 'listitem-toolkit');

				key === 'Объем (м. куб.)' && listItem.insertAdjacentHTML('afterend', '<li> <br /> </li>');
			});
		});

		this.parentElem.insertAdjacentElement('afterbegin', list_unitForm);

		if (list_unitForm.style.transform !== 'translateY(0%)') {
			list_unitForm.style.transform = 'translateY(-100%)';

			setTimeout(() => {
				list_unitForm.style.transform = 'translateY(0%)';
				list_unitForm.style.transition = 'all 0.6s ease-out';
			}, 50);
		}
	},

	hideUnitForm: function () {
		document.getElementById('unitForm').style.transform = 'translateY(-100%)';
		document.getElementById('unitForm').style.transition = 'all 0.6s ease-out';
	},
};
