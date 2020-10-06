const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js'
	},
	resolve: {
		extensions: [".js", ".ts", ".wasm"]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html'
		})
	],
	devServer: {
		contentBase: './dist',
		https: true,
		host: '192.168.1.102'
	},
	module: {
		rules: [
			{ test: /\.ts?$/, loader: "ts-loader" },
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /zcv\.wasm$/,
				type: "javascript/auto",
				loader: "file-loader"
			},
		]
	}
};