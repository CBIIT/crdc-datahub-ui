import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

/**
 * Mocks the enqueueSnackbar function from notistack for testing
 *
 * @note You must RESET all mocks after each test to avoid unexpected behavior
 * @example expect(global.mockEnqueue).toHaveBeenCalledWith('message', { variant: 'error' });
 * @see notistack documentation: https://notistack.com/getting-started
 */
global.mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: global.mockEnqueue })
}));
