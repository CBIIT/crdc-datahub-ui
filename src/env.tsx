// const processEnv = typeof process !== 'undefined' ? process.env : {};
const processEnv = process.env ?? {};
const injectedEnv = (window as { injectedEnv?: any }).injectedEnv || {};

const env = {
  ...injectedEnv,
  ...processEnv,
};

export default env;
