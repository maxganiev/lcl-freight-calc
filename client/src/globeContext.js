import { data_Selector } from './dataSelector';
import { unitForm } from './unitForm';

export const globeContext = {
	resetDataToDefault: function () {
		data_Selector.weight = 0;
		data_Selector.volume = 0;
		data_Selector.output.innerHTML = '';
		data_Selector.workingWeight = 0;
		unitForm.units = [];
	},
};
