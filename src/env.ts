declare global {
  interface Window {
    injectedEnv: AppEnv;
  }
}

const processEnv = process.env ?? {};
const { injectedEnv } = window ?? {};

const env: AppEnv = {
  ...injectedEnv,
  ...processEnv,
};

export default env;
