const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();

//set static folder:
app.use(express.static('client'));

app.use('/api/currconvkey', require('./routes/currconv_route'));
app.use('/api/gpass', require('./routes/gmail_route'));

app.use(cors());

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
