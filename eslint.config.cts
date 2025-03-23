import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { globalIgnores } from "eslint/config";
import stylisticPlugin from "@stylistic/eslint-plugin";
import { includeIgnoreFile } from "@eslint/compat";
import reactPlugin from "eslint-plugin-react";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import storybookPlugin from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import { Linter } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = resolve(__dirname, ".gitignore");

const allTestExtensionsArray = ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"];
const allTsExtensionsArray = ["ts", "mts", "cts", "tsx", "mtsx"];
const allJsExtensionsArray = ["js", "mjs", "cjs", "jsx", "mjsx"];
const allTsExtensions = allTsExtensionsArray.join(",");
const allJsExtensions = allJsExtensionsArray.join(",");
const allExtensions = [...allTsExtensionsArray, ...allJsExtensionsArray].join(",");

const stylingRules: Partial<Linter.RulesRecord> = {
  "prettier/prettier": "error",
  "@stylistic/max-len": [
    "warn",
    {
      code: 100,
      ignoreComments: true,
      ignoreTrailingComments: true,
      ignoreStrings: true,
      ignoreUrls: true,
    },
  ],
  "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
  "@stylistic/semi": ["error", "always"],
  "@stylistic/quotes": ["warn", "double", { avoidEscape: true, allowTemplateLiterals: false }],
  "@stylistic/object-curly-spacing": ["warn", "always"],
  "@stylistic/array-element-newline": ["error", "consistent"],
  "@stylistic/jsx-max-props-per-line": [1, { maximum: 1, when: "multiline" }],

  // Should be last to avoid disconnect with prettier
  ...prettierConfig.rules,
};

const javascriptRules: Partial<Linter.RulesRecord> = {
  ...stylisticPlugin.configs["disable-legacy"].rules,
  "max-len": "off",
  "no-param-reassign": "off",
  "object-curly-newline": "off",
  "no-underscore-dangle": "off",
  "no-console": "warn",
  "arrow-body-style": "warn",
  "eol-last": "warn",
  "no-unreachable": "warn",
  "no-template-curly-in-string": "warn",
  "no-nested-ternary": "error",
  "max-classes-per-file": ["error", 1],
};

const reactRules: Partial<Linter.RulesRecord> = {
  "react/prop-types": "off",
  "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".tsx", ".ts"] }],
  "react/jsx-props-no-spreading": "off",
  "react/react-in-jsx-scope": "off",
  "react/require-default-props": "off",
  "react/no-array-index-key": "error",
  "react/jsx-no-duplicate-props": "error",
  "react/no-unstable-nested-components": "error",
  "react/function-component-definition": [
    "error",
    { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
  ],
  "react/jsx-key": [
    "error",
    {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
      warnOnDuplicates: true,
    },
  ],
  "react/destructuring-assignment": ["error", "always", { destructureInSignature: "always" }],
};

const reactHookRules: Partial<Linter.RulesRecord> = {
  "react-hooks/rules-of-hooks": "off",
  "react-hooks/exhaustive-deps": "off",
};

const overwrittenRules: Partial<Linter.RulesRecord> = {
  "no-use-before-define": "off",
  "no-unused-vars": "off",
  "no-loss-of-precision": "off",
  "no-shadow": "off",
  "no-empty-function": "off",
};

const typescriptRules: Partial<Linter.RulesRecord> = {
  ...overwrittenRules,
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-empty-function": "error",
  "@typescript-eslint/no-use-before-define": ["error", { variables: false }],
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      args: "all",
      argsIgnorePattern: "^_",
      caughtErrors: "all",
      caughtErrorsIgnorePattern: "^_",
      destructuredArrayIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
  "@typescript-eslint/no-loss-of-precision": "error",
  "@typescript-eslint/no-redundant-type-constituents": "error",
  "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
  "@typescript-eslint/no-shadow": "off",
  "@typescript-eslint/dot-notation": "off",
  "@typescript-eslint/naming-convention": [
    "error",
    {
      selector: "variable",
      format: ["camelCase", "PascalCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
    },
  ],
  "@typescript-eslint/ban-ts-comment": "off",
};

const importRules: Partial<Linter.RulesRecord> = {
  "import/prefer-default-export": "off",
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: [
        "**/*.{stories,test}.{ts,tsx}",
        "**/setupTests.{ts,tsx}",
        ".storybook/*.{ts,tsx}",
        "test.{ts,tsx}", // repos with a single test file
        "test-*.{ts,tsx}", // repos with multiple top-level test files
        "**/*{.,_}{test,spec}.{ts,tsx}", // tests where the extension or filename suffix denotes that it is a test
        "**/jest.config.ts", // jest config
        "**/jest.setup.ts", // jest setup],
      ],
      optionalDependencies: false,
    },
  ],
};

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  // eslint.configs.recommended,
  // tseslint.configs.recommended,
  {
    // setup parser for all files
    files: [`**/*.{${allExtensions}}`],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        project: "./tsconfig.json",
        tsconfigRootDir: resolve(__dirname),
      },
      // parserOptions: {
      //   ecmaFeatures: { jsx: true },
      //   ecmaVersion: 2015,
      //   project: "./tsconfig.json",
      //   projectService: true,
      //   tsconfigRootDir: resolve(__dirname),
      //   sourceType: "module",
      // },
    },
    settings: {
      react: {
        pragma: "React",
        fragment: "Fragment",
        version: "detect",
      },
    },
  },
  {
    // all typescript files, except config and test files
    files: [`**/*.{${allTsExtensions}}`, "src/components/Questionnaire/*.tsx"],
    ignores: [`**/*.config.{${allTsExtensions}}`, ...allTestExtensionsArray],
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      storybook: storybookPlugin,
      "@stylistic": stylisticPlugin,
    },
    rules: {
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,
      ...reactHookRules,
      ...importRules,
    },
    settings: {
      react: {
        pragma: "React",
        fragment: "Fragment",
        version: "detect",
      },
    },
  },
  {
    // all javascript files, except config and test files
    files: [`**/*.{${allJsExtensions}}`],
    ignores: [`**/*.config.{${allJsExtensions}}`, ...allTestExtensionsArray],
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      storybook: storybookPlugin,
      "@stylistic": stylisticPlugin,
    },
    settings: {
      react: {
        pragma: "React",
        fragment: "Fragment",
        version: "detect",
      },
    },
    rules: {
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,
      ...reactHookRules,
      ...importRules,

      "@typescript-eslint/naming-convention": "off",
    },
  },
  {
    // config files: typescript
    files: [`**/*.config.{${allTsExtensions}}`],
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      "@stylistic": stylisticPlugin,
    },
    rules: {
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,

      "@typescript-eslint/naming-convention": "off",
    },
  },
  {
    // config files: javascript
    files: [`**/*.config.{${allJsExtensions}}`],
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      "@stylistic": stylisticPlugin,
    },
    rules: {
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,
      "@typescript-eslint/no-unsafe-member-access": ["off"],
      "@typescript-eslint/no-unsafe-assignment": ["off"],
    },
  },
  {
    // all test files
    files: allTestExtensionsArray,
    ...testingLibrary.configs["flat/react"],
    plugins: {
      ...testingLibrary.configs["flat/react"].plugins,
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      "@stylistic": stylisticPlugin,
    },
    rules: {
      ...testingLibrary.configs["flat/react"].rules,
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,
      ...reactHookRules,
      ...importRules,

      "testing-library/prefer-screen-queries": "off",
      "testing-library/no-wait-for-multiple-assertions": "off",
      "testing-library/no-node-access": "off",
      "testing-library/no-container": "off",
      "testing-library/await-async-events": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  {
    // all storybook files
    files: [`**/*.stories.{${allExtensions}}`],
    plugins: {
      react: reactPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      "jsx-a11y": jsxA11yPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      storybook: storybookPlugin,
      "@stylistic": stylisticPlugin,
    },
    rules: {
      ...stylingRules,
      ...javascriptRules,
      ...reactRules,
      ...typescriptRules,
      ...reactHookRules,
      ...importRules,

      "@typescript-eslint/no-empty-function": "off",
    },
  },
  globalIgnores([".prettierrc.cjs"])
);
