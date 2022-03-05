import { data_Selector } from './dataSelector';
import { unitForm } from './unitForm';

export const globeContext = {
	resetDataToDefault: function () {
		data_Selector.weight = 0;
		data_Selector.volume = 0;
		data_Selector.output.innerHTML = '';
		unitForm.unit = null;
		unitForm.units = [];
		unitForm.current = null;
		unitForm.unitIcon.style.visibility = 'hidden';
	},

	resize_events: [],

	windowResize: function (callback) {
		this.resize_events.push(callback);

		this.resize_events.forEach((func) => {
			window.addEventListener('resize', func);
		});
	},

	windowRemoveEventListener: function (type, callback) {
		const index = this.resize_events.findIndex((event) => event === callback);
		window.removeEventListener(type, callback);

		this.resize_events.splice(index, 1);
	},
};
