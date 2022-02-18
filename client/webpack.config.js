const path = require('path');

module.exports = {
	entry: {
		app: ['@babel/polyfill', './src/index.js'],
		auth: ['@babel/polyfill', './src/auth/auth.js'],
		fileuploader: ['@babel/polyfill', './src/fileuploader/fileupload.js'],
	},

	mode: process.env.NODE_ENV === 'production' || process.env.NODE_ENV ? 'production' : 'development',

	watch: true,

	output: {
		path: path.resolve(__dirname, './'),
		filename: '[name].bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['@babel/preset-env'],
				},
			},
		],
	},
};
