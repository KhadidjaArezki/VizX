const path = require("path")
const webpack = require("webpack")

const config = (env, argv) => {
  // argv is used for accessing the mode that is defined in the npm script
  console.log("argv", argv.mode)

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "main.js",
    },
    devServer: {
      static: path.resolve(__dirname, "build"),
      compress: true,
      port: 3000,
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      // defining global default constants that can be used in the bundled code
      new webpack.DefinePlugin({
        //JSON.stringify your global variables here
      }),
    ],
  }
}

module.exports = config
