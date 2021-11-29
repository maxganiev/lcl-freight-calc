const express = require('express');
const gmail_router = express.Router();

const GMAIL_AUTH_KEY = process.env.GMAIL_AUTH_KEY;

gmail_router.get('/', (req, res) => {
	res.json({ gpass: GMAIL_AUTH_KEY });
});

module.exports = gmail_router;
