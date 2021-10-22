const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack');

const PATH = {
  src: path.resolve(__dirname, 'src'),
  build: path.resolve(__dirname, 'app'),
  pages: path.resolve(__dirname, 'src/layout/pages'),
  images: path.resolve(__dirname, 'src/images'),
  styles: path.resolve(__dirname, 'src/styles'),
  js: path.resolve(__dirname, 'src/js'),
  layout: path.resolve(__dirname, 'src/layout'),
  fonts: path.resolve(__dirname, 'src/fonts'),
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;

const filename = (ext) => isDevelopment ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const createHtmlPlugins = () => {
  const pages = fs.readdirSync(PATH.pages).filter(fileName => fileName.endsWith('.pug'));

  return pages.map(page => new HTMLWebpackPlugin({
    template: `${PATH.pages}/${page}`,
    filename: `./${page.replace(/\.pug/, '.html')}`
  }))
};

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  };

  if (isProduction) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ];
  }

  return config;
};

const plugins = () => {
  const basePlugins = [
    ...createHtmlPlugins(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`
    })
  ];

  if (isProduction) {
    basePlugins.push(
      new ImageminPlugin({
        bail: false,
        cache: true,
        imageminOptions: {
          plugins: [
            ['gifsicle', {interlaced: true}],
            ['jpegtran', {progressive: true}],
            ['optipng', {optimizationLevel: 5}],
            [
              'svgo',
              {
                plugins: [
                  {
                    removeViewBox: false
                  }
                ]
              }
            ]
          ]
        }
      })
    )
  }

  return basePlugins;
};

module.exports = {
  context: PATH.src,
  mode: 'development',
  entry: {
    index: './js/index.js'
  },
  output: {
    filename: `./js/${filename('js')}`,
    path: PATH.build,
    publicPath: ''
  },
  devServer: {
    historyApiFallback: true,
    contentBase: PATH.build,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
  resolve: {
    alias: {
      "@images": PATH.images,
      "@fonts": PATH.fonts,
      "@js": PATH.js,
      "@styles": PATH.styles,
      "@layout": PATH.layout,
    },
  },
  optimization: optimization(),
  plugins: plugins(),
  devtool: isProduction ? false : 'source-map',
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDevelopment
            },
          },
          'css-loader'
        ],
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + '/';
              },
            }
          },
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(?:|gif|png|jpg|jpeg|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: `./images/${filename('[ext]')}`
          }
        }],
      },
      {
        test: /\.(?:|woff2|woff)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: `./fonts/${filename('[ext]')}`
          }
        }],
      }
    ]
  }
};
