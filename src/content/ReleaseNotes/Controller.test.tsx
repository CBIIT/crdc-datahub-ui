const mockFetchReleaseNotes = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  fetchReleaseNotes: (...p) => mockFetchReleaseNotes(...p),
}));

// Note: We're mocking the NotesView because Jest doesn't support the `react-markdown` package.
// This is a workaround to prevent the test suite from failing.
jest.mock("./NotesView", () => jest.fn(() => <p>Notes</p>));

describe("Controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.todo("should render the loader when fetching release notes");

  it.todo("should render the notes when release notes are fetched");

  it.todo("should render an error message when release notes fail to fetch");

  it.todo("should navigate to the home page when release notes fail to fetch");

  it.todo("should fetch release notes on mount");

  it.todo("should not fetch release notes if they are already loaded (double render)");
});
