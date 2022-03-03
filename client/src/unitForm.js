import { data_Selector } from './dataSelector';

export const unitForm = {
	parentElem: document.getElementById('body-index'),
	list_unitForm: document.getElementById('unitForm') === null ? document.createElement('ul') : document.getElementById('unitForm'),
	unitIcon: document.getElementById('icn-units'),
	unit: null,
	units: [],

	addUnits: function (length, width, height, weight) {
		this.unit = {
			Место: null,
			'Длина (м)': length,
			'Ширина (м)': width,
			'Высота (м)': height,
			'Объем (м. куб.)': length * width * height,
			'Вес (кг)': weight,
		};

		this.units.push(this.unit);

		this.units.forEach((un, index) => {
			un['Место'] = index + 1;
		});

		this.unitIcon.style.visibility = 'visible';
		this.unitIcon.style.transform = 'scale(1.2)';
		this.unitIcon.style.transition = 'transform 0.3s ease-in-out';

		setTimeout(() => {
			this.unitIcon.style.transform = 'scale(1)';
			this.unitIcon.style.transition = 'transform 0.3s ease-in-out';
		}, 500);

		console.log(this.units);
	},

	removeUnits: function (unitName) {
		const temp = this.units.filter((un) => `${Object.keys(un)[0]} ${un['Место']}` !== unitName);
		this.units = temp;

		this.units.forEach((un, index) => {
			un['Место'] = index + 1;
		});

		data_Selector.setWorkingWeight(data_Selector.delMode, null, null, null, null, this.units);

		console.log(data_Selector.workingWeight);

		this.showUnitForm();

		this.unitIcon.style.visibility = this.units.length > 0 ? 'visible' : 'hidden';
	},

	updateUnits: function (unitName, length, width, height, weight) {
		const updated = {
			Место: Number(unitName.slice(unitName.indexOf(' ') + 1)),
			'Длина (м)': length,
			'Ширина (м)': width,
			'Высота (м)': height,
			'Объем (м. куб.)': length * width * height,
			'Вес (кг)': weight,
		};

		const index = this.units.findIndex((un) => `${Object.keys(un)[0]} ${un['Место']}` === unitName);
		this.units.splice(index, 1, updated);

		data_Selector.setWorkingWeight(data_Selector.delMode, null, null, null, null, this.units);

		console.log(data_Selector.workingWeight);

		this.showUnitForm();
	},

	showUpdateUnitForm: function (unitName) {
		Array.from(this.list_unitForm.children).forEach((child) => child.id === 'list-mask' && child.remove());

		const current = this.units.find((un) => `${Object.keys(un)[0]} ${un['Место']}` === unitName);

		const list_Mask = document.createElement('li');
		list_Mask.id = list_Mask.className = 'list-mask';

		const listItem = document.createElement('li');
		listItem.id = listItem.className = 'unitForm-update';

		listItem.innerHTML = `
		<ul id="list-unitForm-update" class="list list-unitForm-update">
		<li> <img src="./assets/times-solid-black.svg" alt="close popup" id="icn-hide-update-unitform" class="icn-hide-update-unitform" /> </li>
		${Object.keys(current)
			.map((key, index) =>
				index > 0 && key !== 'Объем (м. куб.)'
					? `<li> <input type="text" placeholder="${key}" class="input-param" </li>`
					: index === 0 && key !== 'Объем (м. куб.)'
					? `<li> <strong> ${key} ${current[key]} </strong> </li>`
					: null
			)
			.join('')}
			<li> <button id="btn-submit-unitform-changes" class="btn btn-sm btn-Submit"> Сохранить изменения </button> </li>
		</ul>
		`;

		list_Mask.appendChild(listItem);
		this.list_unitForm.insertAdjacentElement('afterbegin', list_Mask);
	},

	hideUpdateUnitForm: function (elemId) {
		document.getElementById(elemId).remove();
	},

	showUnitForm: function () {
		if (this.list_unitForm.getAttribute('id') === null) {
			this.list_unitForm.id = 'unitForm';
			this.list_unitForm.className = 'list list-unitForm';
		}

		Array.from(this.list_unitForm.children).forEach((child) => child.remove());

		if (!this.list_unitForm.firstElementChild) {
			const img = document.createElement('img');
			img.src = './assets/minus-solid.svg';
			img.alt = 'Hide form';
			img.id = img.className = 'icn-hide-unit-form';

			img.onload = () => {
				const listItem = document.createElement('li');
				listItem.id = listItem.className = 'listItem-icn-hide-unit-form';
				listItem.insertAdjacentElement('afterbegin', img);
				this.list_unitForm.insertAdjacentElement('afterbegin', listItem);
			};
		}

		this.units.forEach((un, index) => {
			const listItem_outer = document.createElement('li');
			listItem_outer.className = 'listItem-outer';

			Object.keys(un).forEach((key) => {
				const listItem = document.createElement('li');
				listItem.innerHTML = key === 'Место' ? `${key} ${un[key]}` : `${key}: ${un[key]}`;

				listItem_outer.appendChild(listItem);
				key === 'Место' &&
					listItem.insertAdjacentHTML(
						'afterbegin',
						`<img src="./assets/pen-solid.svg" alt="modify" id="icn-edit-unit-${index}" />  <img src="./assets/delete-left-solid.svg" alt="delete" id="icn-delete-unit-${index}" />`
					);

				key === 'Место' && listItem.setAttribute('class', 'listitem-toolkit');
			});

			this.list_unitForm.appendChild(listItem_outer);
		});

		this.parentElem.insertAdjacentElement('afterbegin', this.list_unitForm);

		if (this.list_unitForm.style.transform !== 'translateY(0%)') {
			this.list_unitForm.style.transform = 'translateY(-100%)';

			setTimeout(() => {
				this.list_unitForm.style.transform = 'translateY(0%)';
				this.list_unitForm.style.transition = 'all 0.6s ease-out';
			}, 50);
		}
	},

	hideUnitForm: function () {
		document.getElementById('unitForm').style.transform = 'translateY(-100%)';
		document.getElementById('unitForm').style.transition = 'all 0.6s ease-out';
	},
};
