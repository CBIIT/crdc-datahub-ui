describe("Accessibility", () => {
  it.todo("should not have accessibility violations");

  it.todo("should not have accessibility violations (validating)");
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // NOTE: We're testing component behavior here, not the implementation specifics.
  it.todo("should update the status text when the validation state changes");
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.todo("should indicate that validation is ongoing when a validation state is 'Validating'");

  // NOTE: it.each here
  it.todo("should indicate the validation type and target in a friendly format");

  it.todo("should include the start timestamp when validation is ongoing");

  it.todo("should include the start and end timestamps when validation is complete");
});
