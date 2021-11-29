export const pricelist_afterBorder = [
	{
		id: 'SVO1',
		name: 'Москва-Карого (SVO1)',
		awbFixRate: 0,
		consigneeNotification: 344.4,
		handlingRate_perKg: 19.48,
		loadingRate_perKG: 3.36,
		toDoorCarriage: [
			{ val: 500, cost: 8000 },
			{ val: 2000, cost: 12000 },
			{ val: 5000, cost: 18000 },
			{ val: Infinity, cost: 25000 },
		],
	},

	{
		id: 'SVO2',
		name: 'Шереметьево-Карого (SVO2)',
		awbFixRate: Number((618.64 * 1.2).toFixed(2)),
		consigneeNotification: Number((237.29 * 1.2).toFixed(2)),
		handlingRate_perKg: Number((18.2 * 1.2).toFixed(2)),
		loadingRate_perKG: Number((2.4 * 1.2).toFixed(2)),
		toDoorCarriage: [
			{ val: 500, cost: 8000 },
			{ val: 2000, cost: 12000 },
			{ val: 5000, cost: 18000 },
			{ val: Infinity, cost: 25000 },
		],
	},

	{
		id: 'DME',
		name: 'Домодедово (DME)',
		awbFixRate: 0,
		consigneeNotification: Number((441.9).toFixed(2)),
		handlingRate_perKg: Number((13.95 * 1.2).toFixed(2)),
		loadingRate_perKG: Number((2.5 * 1.2).toFixed(2)),
		toDoorCarriage: [
			{ val: 500, cost: 8000 },
			{ val: 2000, cost: 12000 },
			{ val: 5000, cost: 18000 },
			{ val: Infinity, cost: 25000 },
		],
	},

	{
		id: 'LED',
		name: 'Пулково (LED)',
		awbFixRate: Number((770 * 1.2).toFixed(2)),
		consigneeNotification: Number((350 * 1.2).toFixed(2)),
		handlingRate_perKg: Number((7.65 * 1.2).toFixed(2)),
		loadingRate_perKG: Number((3 * 1.2).toFixed(2)),
		toDoorCarriage: [
			{ val: 500, cost: 5000 },
			{ val: 2000, cost: 8000 },
			{ val: 5000, cost: 10000 },
			{ val: Infinity, cost: 14000 },
		],
	},
	//terminal charges are included by localCharges already:
	{
		id: 'Ворсино/ Электроугли',
		name: 'Ворсино/ Электроугли',
		awbFixRate: 0,
		consigneeNotification: 0,
		handlingRate_perKg: 0,
		loadingRate_perKG: 0,
		toDoorCarriage: [
			{ val: 1, cost: 12000 },
			{ val: 5, cost: 16000 },
			{ val: 10, cost: 19000 },
			{ val: 20, cost: 26000 },
			{ val: 23, cost: 32000 },
		],
	},
];
