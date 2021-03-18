import * as path from "path";
import { merge } from "webpack-merge";
import { Configuration, EnvironmentPlugin } from "webpack";

const config: Configuration = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    library: "analytics-plugin-tapfiliate",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  externals: ["analytics", "analytics-utils"],
};

export const serverConfig = merge(config, {
  target: "node",
  output: {
    filename: "lib.node.js",
  },
  plugins: [
    new EnvironmentPlugin({
      BROWSER: false,
    }),
  ],
});

export const browserConfig = merge(config, {
  target: "web",
  output: {
    filename: "lib.browser.js",
  },
  plugins: [
    new EnvironmentPlugin({
      BROWSER: true,
    }),
  ],
});
