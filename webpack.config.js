const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATH = {
    dev: path.resolve(__dirname, 'dev'),
    dist: path.resolve(__dirname, 'dist'),
    pages: path.resolve(__dirname, 'dev/layout/pages'),
}

const PAGES = fs.readdirSync(PATH.pages).filter(fileName => fileName.endsWith('.pug'));

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const createHtmlPlugins = (pages) => pages.map(page => new HtmlWebpackPlugin({
    template: `${PATH.pages}/${page}`,
    filename: `./${page.replace(/\.pug/, '.html')}`
}))

const htmlPluginsArr = createHtmlPlugins(PAGES);

const filename = (ext) => isDevelopment ? `[name].${ext}` : `[name].[contenthash].${ext}`;

module.exports = {
    mode: 'development',
    context: PATH.dev,
    entry: {
        index: './js/index.js'
    },
    output: {
        filename: `./js/${filename('js')}`,
        path: PATH.dist
    },
    plugins: [
        ...htmlPluginsArr
    ],
    module: {
        rules: [
            // {
            //     test: /\.s[ac]ss$/i,
            //     use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            // },
            {
                test: /\.pug$/,
                use: [
                    {
                        loader: "pug-loader",
                    },
                ],
            },
        ],
    },
}
