const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	module: {
		rules: [{
			test: /\.jsx$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader'
			}
		}, {
			test: /\.html$/,
			use: [{
				loader: 'html-loader'
			}]
		}, {
			test: /\.ttf$/,
			use: [{
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'fonts/'
				}
			}]
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: './index.html'
		})
	],
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, './docs')
	}
};
