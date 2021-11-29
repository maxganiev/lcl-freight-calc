const express = require('express');
const currconv_router = express.Router();
const needle = require('needle');
const dayjs = require('dayjs');
const apicache = require('apicache');

const CURRCONV_API_KEY = process.env.CURRCONV_API_KEY;

//init caching for 5 mins:
let cache = apicache.middleware;

currconv_router.get('/', cache('2 minutes'), async (req, res) => {
	try {
		const currconv_req = await needle(
			'get',
			`https://free.currconv.com/api/v7/convert?q=USD_RUB,EUR_RUB&compact=ultra&date=${dayjs(new Date()).format(
				'YYYY-MM-DD'
			)}&apiKey=${CURRCONV_API_KEY}`
		);

		const currconv_res = currconv_req.body;

		res.status(200).json(currconv_res);
	} catch (error) {
		res.status(500).json({ error });
	}
});

module.exports = currconv_router;
