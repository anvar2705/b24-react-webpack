const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd
const isServe = process.env.SERVE

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`)

const babelOptions = () => {
  const presets = [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ]
  const plugins = []
  if (isServe) {
    plugins.push('react-refresh/babel')
  }

  return {
    presets,
    plugins,
  }
}

const cssLoaders = (modules, extra) => {
  const loaders = [
    MiniCssExtractPlugin.loader,
    { loader: 'css-modules-typescript-loader' },
    {
      loader: 'css-loader',
      options: modules
        ? {
            modules: { localIdentName: '[local]__[sha1:hash:hex:7]' },
            importLoaders: extra ? 2 : 1,
          }
        : {},
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env'],
        },
      },
    },
  ]
  if (extra) loaders.push(extra)
  return loaders
}

const optimization = () => {
  const config = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial',
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true,
        },
      },
    },
  }
  if (isProd) config.minimizer = [new CssMinimizerWebpackPlugin(), new TerserWebpackPlugin()]
  return config
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: isDev ? 'development' : 'production',
  target: isDev ? 'web' : 'browserslist',
  entry: {
    main: './index.tsx',
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      assets: path.resolve(__dirname, 'src/assets'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 3001,
    open: true,
  },
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(true),
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: cssLoaders(false),
        exclude: /\.module\.css$/,
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders(true, 'sass-loader'),
        include: /\.module\.s[ac]ss$/,
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders(false, 'sass-loader'),
        exclude: /\.module\.s[ac]ss$/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        // for loading images as base64 in js bundle
        // type: 'asset',
        // parser: {
        //     dataUrlCondition: {
        //         maxSize: 10 * 1024,
        //     },
        // },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptions(),
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
    new HTMLWebpackPlugin({
      template: './index.html',
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    isServe && new ESLintPlugin({ extensions: ['.tsx', '.ts', '.jsx', '.js'] }),
    isServe && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
}
