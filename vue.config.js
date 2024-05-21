const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new SWPrecacheWebpackPlugin({
          cacheId: 'hypefury',
          filepath: 'dist/service-worker.js',
          staticFileGlobs: [
            'dist/*',
            'dist/**/*',
          ],
          stripPrefix: 'dist/',
        }),
      );
    }
  },
};
