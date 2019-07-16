var webpack = require('webpack')
var path = require('path')

module.exports = {
    entry: './src/index.ts',
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },

    output: {
        filename: 'is-text-utils.js',
        library: 'is-text-utils',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    },
    node: {
        module: "empty",
        fs: "empty"
    }
}
