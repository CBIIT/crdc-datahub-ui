describe("Accessibility", () => {
  it.todo("should have no violations for the button");

  it.todo("should have no violations for the button (disabled)");
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.todo("should render without crashing");

  it.todo("should show a snackbar when the change operation fails (GraphQL Error)");

  it.todo("should show a snackbar when the change operation fails (Network Error)");

  it.todo("should show a snackbar when the change operation fails (API Error)");
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.todo("should have a tooltip present on the button");

  it.todo("should not be rendered when the user is missing the required permission");

  it.todo("should not be rendered when the user is not a Data Commons Personnel");

  it.todo("should not be render when the submission is not in a valid state");

  it.todo("should update the local cache state when the model version is changed");
});
