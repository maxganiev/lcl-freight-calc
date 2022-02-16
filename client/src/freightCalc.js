import { pricelist_beforeBorder } from './pricelist_beforeBorder';
import { pricelist_afterBorder } from './pricelist_afterBorder';
import { data_Selector } from './dataSelector';

export const freightCalc = {
	pickupCost: { pricePerUnit: 0, total: null },
	freightCost: { pricePerUnit: 0, total: null },
	localChargesExp: 0,
	exportDeclarationCost: 0,
	localChargesImp: 0,
	totalTransportationCost: 0,
	optionsCostList: [],

	getPickupCost: function (delMode, deliveryTerm, workingWeight) {
		switch (delMode) {
			case 'railMode':
				this.pickupCost.total = deliveryTerm !== 'EXW' ? 0 : this.pickupCost.pricePerUnit;
				break;

			case 'airMode':
				this.pickupCost.total = deliveryTerm !== 'EXW' ? 0 : workingWeight * 0.1;
				break;
		}
		return this.pickupCost.total;
	},

	getLocalChargesExp: function (delMode, deliveryTerm, depCountry) {
		this.exportDeclarationCost = deliveryTerm !== 'EXW' ? 0 : 50;
		switch (delMode) {
			case 'railMode':
				//average local charges including local charges in China and deconsolidation in Vorsino
				this.localChargesExp = deliveryTerm === 'FOB' ? 0 : 300 + this.exportDeclarationCost;
				break;

			case 'airMode':
				this.localChargesExp = depCountry === 'CN' ? 90 + this.exportDeclarationCost : 30 + this.exportDeclarationCost;
				break;
		}
		return this.localChargesExp;
	},

	getFreightCost: function (delMode, workingWeight, portOfLading) {
		switch (delMode) {
			case 'railMode':
				this.freightCost.total = this.freightCost.pricePerUnit;
				break;

			case 'airMode':
				//air freight charges for LED are normally 15 - 25% higher
				this.freightCost.total =
					portOfLading !== 'LED'
						? this.freightCost.pricePerUnit * workingWeight
						: this.freightCost.pricePerUnit * workingWeight * 1.25;
				break;
		}
		return this.freightCost.total;
	},

	calcPricePerUnit: function (depCountry, workingWeight, portOfLading) {
		//calculating expenses in a country of departure:
		pricelist_beforeBorder.forEach((country) => {
			const { id, prices } = country;

			if (depCountry === id) {
				prices.forEach((current, j) => {
					for (let i = 0; i < country.prices[j].list.length; i++) {
						if (workingWeight <= country.prices[j].list[i].val) {
							this.pickupCost.pricePerUnit =
								current.typeofService === 'pickup'
									? country.prices[j].list[i].cost
									: this.pickupCost.pricePerUnit;

							this.freightCost.pricePerUnit =
								current.typeofService === 'freight'
									? country.prices[j].list[i].cost
									: this.freightCost.pricePerUnit;

							break;
						}
					}
				});
			}
		});

		//calculating expenses in a country of destination:
		let toDoorCarriageCost = 0;
		pricelist_afterBorder.forEach((port) => {
			const { id, awbFixRate, consigneeNotification, handlingRate_perKg, loadingRate_perKG, toDoorCarriage } = port;

			if (portOfLading === id) {
				for (let i = 0; i < toDoorCarriage.length; i++) {
					if (workingWeight <= toDoorCarriage[i].val) {
						toDoorCarriageCost = toDoorCarriage[i].cost;
						break;
					}
				}

				this.localChargesImp =
					awbFixRate +
					consigneeNotification +
					handlingRate_perKg * workingWeight +
					loadingRate_perKG * workingWeight +
					toDoorCarriageCost;
			}
		});
	},

	getTotalTransportationCost: async function (delMode, depCountry, deliveryTerm, workingWeight, portOfLading, tax) {
		//waiting for the currency data to be fetched:
		while (data_Selector.currency === null) {
			await data_Selector.setCurrency();
		}

		if (data_Selector.currency !== undefined) {
			//calling multiple methods to calculate cost per each service:
			this.calcPricePerUnit(depCountry, workingWeight, portOfLading);
			this.getPickupCost(delMode, deliveryTerm, workingWeight);
			this.getFreightCost(delMode, workingWeight, portOfLading);
			this.getLocalChargesExp(delMode, deliveryTerm, depCountry);

			const VAT = 1.2;
			const expensesBeforeBorder = this.pickupCost.total + this.freightCost.total + this.localChargesExp;

			//getting total transporation cost including VAT and tax, converted into RUB:
			this.totalTransportationCost =
				(expensesBeforeBorder + expensesBeforeBorder * tax) * VAT * data_Selector.currency + this.localChargesImp;

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
				this.pickupCost.total,
				this.freightCost.total,
				this.localChargesExp,
				this.localChargesImp,
				this.totalTransportationCost
			);


			//nullifying all object props except totalTransportationCost and optionCostList once calculation is done to avoid old data to persist inside state with following miscalculation:
			for (const prop in this) {
				if (typeof this[prop] === 'object' && !Array.isArray(this[prop])) {
					//if prop type is object - we need to access its props too:
					for (const pr in this[prop]) {
						this[prop][pr] = 0;
					}
				}

				// if prop type is number - we just make it nullish:
				if (typeof this[prop] === 'number' && prop !== 'totalTransportationCost') {
					this[prop] = 0;
				}
			}

			return this.totalTransportationCost;
		}
	},
};
