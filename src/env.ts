let processEnv = {};
try {
  processEnv = process.env;
} catch (e) {
  processEnv = {};
}

const { injectedEnv } = window ?? {};

const env: AppEnv = {
  ...injectedEnv,
  ...processEnv,
};

export default env;
