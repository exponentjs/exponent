const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const common = require('./webpack.common.js');
const locations = require('./webpackLocations');

const appEntry = [locations.appMain];

const usePolyfills = false;

if (usePolyfills) {
  appEntry.unshift('babel-polyfill');
}

module.exports = merge(common, {
  mode: 'production',
  entry: {
    vendor: ['react', 'react-native-web'],
    app: appEntry,
  },
  devtool: 'hidden-source-map',
  plugins: [
    new CleanWebpackPlugin([locations.production.folder]),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([
      {
        from: locations.template.manifest,
        to: locations.production.manifest,
      },
      {
        from: locations.template.serveJson,
        to: locations.production.serveJson,
      },
    ]),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash].css',
      chunkFilename: 'static/css/[name].[contenthash].chunk.css',
    }),

    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CompressionPlugin({
      test: /\.(js|css)$/,
      filename: '[path].gz[query]',
      algorithm: 'gzip',
    }),
  ],
  module: {
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash].[ext]',
        },
      },
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      // we specify a custom TerserPlugin here to get source maps in production
      new TerserPlugin({
        cache: true,
        sourceMap: true,
        parallel: true,
        extractComments: 'all',
        terserOptions: {
          warnings: false,
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
          // module: false,
          // toplevel: false,
          // nameCache: null,
          // ie8: false,
          // keep_classnames: undefined,
          // keep_fnames: false,
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      maxAsyncRequests: 5,
      minSize: 0,
      maxSize: 0,
      minChunks: Infinity,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: { 
        vendor: {
          chunks: 'all',
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
          // name of the chunk
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        },
      },
    }
  },
});
