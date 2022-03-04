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

	windowResize: function (callback) {
		window.onresize = () => {
			return callback();
		};
	},
};
