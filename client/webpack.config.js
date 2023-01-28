const path = require ("path");
const webpack = require ("webpack");

module.exports={
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "metrics-webpack.bundle.js"
    },
    module: {
        loaders: [{
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }]
    }
};





