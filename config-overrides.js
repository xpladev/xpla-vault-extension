module.exports = function override(config, env) {
  return {
    ...config,
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        maxSize: 3072000,
      },
    },
  };
};
