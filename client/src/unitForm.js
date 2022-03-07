import { data_Selector } from './dataSelector';
import { setAlert } from './alert';
import { globeContext } from './globeContext';

export const unitForm = {
	body_HTML: document.getElementById('body-index'),
	list_unitForm: document.getElementById('unitForm') === null ? document.createElement('ul') : document.getElementById('unitForm'),
	unitIcon: document.getElementById('icn-units'),
	unit: null,
	units: [],
	current: null,
	entriesValid: {
		entry_weight: true,
		entry_vol: true,
	},

	bindRef: null,

	setbindRef: function () {
		this.bindRef = this.calculateHeight.bind(this, this.body_HTML.scrollHeight, this.list_unitForm.scrollHeight);
	},

	addUnits: function (length, width, height, weight) {
		this.unit = {
			Место: null,
			'Длина (м)': length,
			'Ширина (м)': width,
			'Высота (м)': height,
			'Объем (м. куб.)': length * width * height,
			'Вес (кг)': weight,
		};

		this.validateEntries(this.unit, 'addNew');

		if (Object.values(this.entriesValid).some((value) => value === false)) {
			setAlert('err-fillDetails', 'Макс. допустимый объем - 23 куб. м, вес - 11500 кг', 4000);
		} else {
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
		}
	},

	removeUnits: function (unitName) {
		const temp = this.units.filter((un) => `${Object.keys(un)[0]} ${un['Место']}` !== unitName);
		this.units = temp;

		this.units.forEach((un, index) => {
			un['Место'] = index + 1;
		});

		data_Selector.setWorkingWeight(data_Selector.delMode, this.units);

		this.showUnitForm();

		this.unitIcon.style.visibility = this.units.length > 0 ? 'visible' : 'hidden';
	},

	updateUnits: function (length, width, height, weight) {
		const updated = {
			Место: this.current['Место'],
			'Длина (м)': Number(length),
			'Ширина (м)': Number(width),
			'Высота (м)': Number(height),
			'Объем (м. куб.)': length * width * height,
			'Вес (кг)': Number(weight),
		};

		this.validateEntries(updated, 'updateExisting');

		if (Object.values(this.entriesValid).some((value) => value === false)) {
			setAlert('err-fillDetails', 'Макс. допустимый объем - 23 куб. м, вес - 11500 кг', 4000);
		} else {
			const index = this.units.findIndex(
				(un) => `${Object.keys(un)[0]} ${un['Место']}` === `${Object.keys(this.current)[0]} ${this.current['Место']}`
			);

			this.units.splice(index, 1, updated);
			data_Selector.setWorkingWeight(data_Selector.delMode, this.units);

			this.showUnitForm();
		}
	},

	showUpdateUnitForm: function (unitName) {
		Array.from(this.list_unitForm.children).forEach((child) => child.id === 'list-mask' && child.remove());

		this.current = this.units.find((un) => `${Object.keys(un)[0]} ${un['Место']}` === unitName);
		const temp = Object.keys(this.current)
			.filter((key) => key !== 'Объем (м. куб.)')
			.reduce((acc, curr) => ({ ...acc, [curr]: this.current[curr] }), {});

		const list_Mask = document.createElement('li');
		list_Mask.id = list_Mask.className = 'list-mask';

		const listItem = document.createElement('li');
		listItem.id = listItem.className = 'unitForm-update';

		listItem.innerHTML = `
		<ul id="list-unitForm-update" class="list list-unitForm-update">
		<li> <img src="./assets/times-solid-black.svg" alt="close popup" id="icn-hide-update-unitform" class="icn-hide-update-unitform" /> </li>
		${Object.keys(temp)
			.map((key, index) =>
				index > 0
					? `<li> <input type="text" placeholder="${key}" class="input-param" </li>`
					: `<li> <strong> ${key} ${temp[key]} </strong> </li>`
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
				listItem.innerHTML = key === 'Место' ? `${key} ${un[key]}` : `${key}: ${un[key].toFixed(2)}`;

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

		this.body_HTML.insertAdjacentElement('afterbegin', this.list_unitForm);

		setTimeout(() => {
			this.calculateHeight(this.body_HTML.scrollHeight, this.list_unitForm.scrollHeight);

			this.setbindRef();
			globeContext.windowResize(this.bindRef);
		}, 500);

		if (this.list_unitForm.style.transform !== 'translateY(0%)') {
			this.list_unitForm.style.transform = 'translateY(-100%)';

			setTimeout(() => {
				this.list_unitForm.style.transform = 'translateY(0%)';
				this.list_unitForm.style.transition = 'all 0.6s ease-out';
			}, 50);
		}
	},

	hideUnitForm: function () {
		document.getElementById('unitForm').style.transform = `translateY(-${this.list_unitForm.scrollHeight * 1.05}px)`;
		document.getElementById('unitForm').style.transition = 'all 0.6s ease-out';

		globeContext.windowRemoveEventListener('resize', this.bindRef);
	},

	validateEntries: function (entryObject, initiator) {
		if (this.units.length === 0) {
			this.entriesValid.entry_weight = Number(entryObject['Вес (кг)']) < 11500;
			this.entriesValid.entry_vol = Number(entryObject['Объем (м. куб.)']) < 23;
		} else {
			this.entriesValid.entry_weight =
				initiator === 'addNew'
					? Number(entryObject['Вес (кг)']) + this.units.reduce((acc, curr) => acc + Number(curr['Вес (кг)']), 0) <=
					  11500
					: Number(entryObject['Вес (кг)']) +
							this.units.reduce((acc, curr) => acc + Number(curr['Вес (кг)']), 0) -
							Number(this.current['Вес (кг)']) <=
					  11500;

			this.entriesValid.entry_vol =
				initiator === 'addNew'
					? Number(entryObject['Объем (м. куб.)']) +
							this.units.reduce((acc, curr) => acc + Number(curr['Объем (м. куб.)']), 0) <=
					  23
					: Number(entryObject['Объем (м. куб.)']) +
							this.units.reduce((acc, curr) => acc + Number(curr['Объем (м. куб.)']), 0) -
							Number(this.current['Объем (м. куб.)']) <=
					  23;
		}
	},

	calculateHeight: function (bodyHeight, listHeight) {
		//checking if list in scope of visibility, otherwise no need to perform anything:
		if (this.list_unitForm.style.transform.indexOf('-') === -1) {
			//timeout is needed to let some air to JS engine as calculations and rendering takes tome:
			setTimeout(() => {
				if (listHeight <= bodyHeight) {
					this.list_unitForm.style.height = '100%';
				} else {
					this.list_unitForm.style.height =
						Array.from(this.list_unitForm.children)
							.filter((child) => !child.id.includes('listItem-icn-hide-unit-form'))
							.reduce((acc, curr) => acc + curr.scrollHeight, 0) *
							1.05 +
						'px';
				}
			}, 400);
		}
	},
};
