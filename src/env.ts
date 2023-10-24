const processEnv = process.env ?? {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const injectedEnv = (window as { injectedEnv?: any }).injectedEnv || {};

const env = {
  ...injectedEnv,
  ...processEnv,
};

export default env;
