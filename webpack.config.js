module.exports = {
  entry: "./src/main",
  output: {
    filename: "./src/app.js"
  },
  module: {
    loaders: [
      {
        test: /.ts$/,
        loader: "ts-loader"

      }
    ]
  },
  resolve: {
    extensions: ["", ".ts", ".js"]
  }
}