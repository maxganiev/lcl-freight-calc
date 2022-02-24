import { data_Selector } from './dataSelector';

export const freightCalc = {
	localChargesImp: 0,
	exportCharges: 0,
	importCharges: 0,
	totalTransportationCost: 0,
	optionsCostList: [],

	getExportCharges: async function (delMode, depCountry, deliveryTerm, workingWeight, portOfLading) {
		try {
			const data = [{ delMode }, { depCountry }];

			const formData = new FormData();
			data.forEach((d) => formData.append(Object.keys(d)[0], Object.values(d)[0]));

			const req = await fetch('../db/get_exp_prices_from_db.php', {
				method: 'POST',
				Accept: 'application/json',
				body: formData,
			});

			if (req.status === 200) {
				const res = await req.json();

				const prices_per_working_weight =
					delMode === 'railMode'
						? res.filter((data) => Number(data.CBM) >= workingWeight)[0]
						: res.filter((data) => Number(data.KGS) >= workingWeight)[0];

				const prices = Object.entries(prices_per_working_weight)
					.map((entry) => {
						return { [entry[0]]: Number(entry[1]) };
					})
					.filter((obj) => Object.keys(obj)[0] !== 'CBM' && Object.keys(obj)[0] !== 'KGS');

				const { FREIGHT_USD_PER_CBM, FREIGHT_USD_PER_KG_TO_MSC, FREIGHT_USD_PER_KG_TO_LED, EXPORT_CHARGES_TOTAL } =
					prices_per_working_weight;

				switch (deliveryTerm) {
					case 'EXW':
						this.exportCharges =
							delMode === 'railMode'
								? prices.reduce((acc, curr) => acc + Object.values(curr)[0], 0)
								: delMode === 'airMode' && portOfLading !== 'LED'
								? prices
										.filter((obj) => !Object.keys(obj)[0].includes('FREIGHT'))
										.reduce((acc, curr) => acc + Object.values(curr)[0], 0) +
								  prices.filter((obj) => Object.keys(obj)[0].includes('TO_MSC'))[0]
										.FREIGHT_USD_PER_KG_TO_MSC *
										workingWeight
								: prices
										.filter((obj) => !Object.keys(obj)[0].includes('FREIGHT'))
										.reduce((acc, curr) => acc + Object.values(curr)[0], 0) +
								  prices.filter((obj) => Object.keys(obj)[0].includes('TO_LED'))[0]
										.FREIGHT_USD_PER_KG_TO_LED *
										workingWeight;
						break;

					case 'FCA':
						this.exportCharges =
							delMode === 'railMode'
								? Number(FREIGHT_USD_PER_CBM) + Number(EXPORT_CHARGES_TOTAL)
								: delMode === 'airMode' && portOfLading !== 'LED'
								? Number(FREIGHT_USD_PER_KG_TO_MSC) * workingWeight + Number(EXPORT_CHARGES_TOTAL)
								: Number(FREIGHT_USD_PER_KG_TO_LED) * workingWeight + Number(EXPORT_CHARGES_TOTAL);
						break;

					case 'FOB':
						this.exportCharges = Number(FREIGHT_USD_PER_CBM);
						break;
				}
			}
		} catch (error) {
			console.log(error);
		}

		return this.exportCharges;
	},

	getImportCharges: async function (delMode, workingWeight, portOfLading) {
		try {
			const formData = new FormData();
			formData.append('delMode', delMode);

			const req = await fetch('../db/get_imp_prices_from_db.php', {
				method: 'POST',
				Accept: 'application/json',
				body: formData,
			});

			if (req.status === 200) {
				const res = await req.json();
				const portName = toLatinChars(portOfLading);

				if (delMode === 'railMode') {
					const prices = res.filter((data) => Number(data.CBM) >= workingWeight && data.PORT_NAME === portName)[0];
					const { HANDLING_RATE_PER_CBM, LOADING_RATE_PER_CBM, TODOOR_DELIVERY } = prices;

					this.importCharges =
						Number(HANDLING_RATE_PER_CBM) * workingWeight +
						Number(LOADING_RATE_PER_CBM) * workingWeight +
						Number(TODOOR_DELIVERY);
				} else if (delMode === 'airMode') {
					const prices = res.filter((data) => Number(data.KGS) >= workingWeight && data.PORT_NAME === portName)[0];
					const { AWB_RATE, CONSIGNEE_NOTIFICATION, HANDLING_RATE_PER_KG, LOADING_RATE_PER_KG, TODOOR_DELIVERY } =
						prices;

					this.importCharges =
						Number(AWB_RATE) +
						Number(CONSIGNEE_NOTIFICATION) +
						Number(HANDLING_RATE_PER_KG) * workingWeight +
						Number(LOADING_RATE_PER_KG) * workingWeight +
						Number(TODOOR_DELIVERY);
				}
			}
		} catch (error) {
			console.log(error);
		}

		function toLatinChars(word) {
			if (word === 'Ворсино/ Электроугли') {
				return 'VORSINO/ ELECTROUGLI';
			} else {
				return word;
			}
		}

		return this.importCharges;
	},

	getTotalCost: async function (delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax) {
		await this.getExportCharges(delMode, depCountry, deliveryTerm, workingWeight, portOfLading);
		await this.getImportCharges(delMode, workingWeight, portOfLading);

		//waiting for the currency data to be fetched:
		while (data_Selector.currency === null) {
			await data_Selector.setCurrency();
		}

		if (data_Selector.currency !== undefined) {
			const VAT = 1.2;

			//getting total transporation cost including VAT and tax, converted into RUB:
			this.totalTransportationCost =
				(this.exportCharges + this.exportCharges * tax) * VAT * data_Selector.currency + this.importCharges;

			//emptying array at each function call to removing old data before new one will be added with next getTotalTransportationCost() call:
			this.optionsCostList = [];

			//fill calculated data to be accessed by other modules before getting nullified:
			this.optionsCostList.push(
				data_Selector.today,
				data_Selector.currency,
				delMode === 'railMode' ? 'Ж/Д' : 'Авиа',
				depCountry,
				deliveryTerm,
				portOfLading,
				this.exportCharges,
				this.importCharges,
				this.totalTransportationCost
			);

			//nullifying all object props except totalTransportationCost and optionCostList once calculation is done to avoid old data to persist inside state with following miscalculation:
			for (const prop in this) {
				// if prop type is number - we just make it nullish:
				if (typeof this[prop] === 'number' && prop !== 'totalTransportationCost') {
					this[prop] = 0;
				}
			}

			return this.totalTransportationCost;
		}
	},
};
