import * as path from 'path';
import {Configuration, BannerPlugin} from 'webpack';

const config: Configuration = {
    mode: "development",
    entry: './src/index.ts',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new BannerPlugin({
            banner: "#!/usr/bin/env node",
            raw: true
        })
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
};

export default config;