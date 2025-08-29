/* eslint-disable max-classes-per-file */
import "@testing-library/jest-dom";
import "jest-axe/extend-expect";
import "jest-canvas-mock";
import failOnConsole from "jest-fail-on-console";
import crypto from "crypto";

/**
 * Makes the global.crypto.getRandomValues function available in Jest
 *
 * @see https://stackoverflow.com/a/63749793
 */
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});

/**
 * Mocks the enqueueSnackbar function from notistack for testing
 *
 * @note You must RESET all mocks after each test to avoid unexpected behavior
 * @example expect(global.mockEnqueue).toHaveBeenCalledWith('message', { variant: 'error' });
 * @see notistack documentation: https://notistack.com/getting-started
 */
global.mockEnqueue = jest.fn();
jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  useSnackbar: () => ({ enqueueSnackbar: global.mockEnqueue }),
}));

/**
 * Mocks the DataTransfer class for testing as it is not available in JSDOM
 *
 * @note This only implements the underlying data structure and `files()` method
 * @see MDN documentation: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
 */
global.DataTransfer = class DataTransfer {
  items = null;

  constructor() {
    this.items = new (class {
      array: unknown[];

      constructor() {
        this.array = [];
      }

      add(file) {
        this.array.push(file);
      }

      get length() {
        return this.array.length;
      }
    })();
  }

  get files() {
    return this.items.array;
  }
} as typeof DataTransfer;

/**
 * Mocks the Recharts ResponsiveContainer component for testing
 *
 * @note This solves the missing ResizeObserver error in Jest
 * @see Recharts documentation: https://recharts.org/en-US/guide
 */
const MockResponsiveContainer = (props) => <div {...props} />;
jest.mock("recharts", () => ({
  ...jest.requireActual("recharts"),
  ResponsiveContainer: MockResponsiveContainer,
}));

/**
 * Mocks the react-markdown package for testing
 * as Jest does not support ESM modules by default
 */
jest.mock("react-markdown", () => ({ children }: { children: string }) => (
  <div data-testid="react-markdown-mock">{children}</div>
));

/**
 * Prevents the console.error and console.warn from silently failing
 * in tests by throwing an error when called
 */
failOnConsole({
  shouldFailOnWarn: true,
  shouldFailOnError: true,
});
