import { merge } from 'webpack-merge';

import { serverConfig, browserConfig } from './webpack.common';

export default [serverConfig, browserConfig].map((config) => merge(config, {
  mode: 'production',
}));
