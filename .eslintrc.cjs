/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:jsx-a11y/recommended",
    'airbnb',
    'airbnb-typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 11,
    project: "./tsconfig.json",
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint", "jsx-a11y"],
  settings: {
    react: {
      pragma: "React",
      fragment: "Fragment",
      version: "detect"
    }
  },
  root: true,
  ignorePatterns: ["public/injectEnv.js", "public/js/session.js"],
  rules: {
    "indent": "warn",
    "import/prefer-default-export": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "no-empty-function": "warn",
    "max-len": "off",
    "no-console": "warn",
    "no-param-reassign": "off",
    "object-curly-newline": "off",
    "no-underscore-dangle": ["off"],
    "no-use-before-define": "off",
    "arrow-body-style": ["warn"],
    "eol-last": ["warn"],
    "no-unreachable": ["warn"],
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".tsx", ".ts"] }],
    "react/jsx-props-no-spreading": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/jsx-max-props-per-line": [1, { maximum: 1, when: "multiline" }],
    "react/function-component-definition": ["off"],
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/no-use-before-define": ["off"],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-shadow": ["off"],
    "@typescript-eslint/dot-notation": ["off"],
    "@typescript-eslint/quotes": ["off"],
    "@typescript-eslint/naming-convention": ["off"],
    "@typescript-eslint/ban-ts-comment": ["off"],
  }
};
