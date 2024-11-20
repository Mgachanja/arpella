const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // Set to 'production' for production builds
  entry: './src/index.js', // Entry point for your app
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'bundle.js', // Output file name
   
  },
  devtool: 'source-map', // Enable source maps for debugging
  devServer: {
    static: './dist', // Serve files from the dist folder
    port: 3000, // Port for the dev server
    open: true, // Automatically open the browser
    hot: true, // Enable hot module replacement
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Match .js and .jsx files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Transpile modern JS and React
          },
        },
      },
      {
        test: /\.css$/, // Match .css files
        use: ['style-loader', 'css-loader'], // Process CSS
      },
      {
        test: /\.scss$/, // Match .scss files
        use: ['style-loader', 'css-loader', 'sass-loader'], // Process SCSS
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i, // Match image files
        type: 'asset/resource', // Handle images
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], 
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', 
    }),
  ],
};
