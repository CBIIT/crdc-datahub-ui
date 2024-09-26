import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { FC } from "react";
import Controller from "./Controller";

const mockFetchReleaseNotes = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  fetchReleaseNotes: async (...p) => mockFetchReleaseNotes(...p),
}));

const mockUsePageTitle = jest.fn();
jest.mock("../../hooks/usePageTitle", () => ({
  ...jest.requireActual("../../hooks/usePageTitle"),
  __esModule: true,
  default: (...p) => mockUsePageTitle(...p),
}));

type ParentProps = {
  initialEntry?: string;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  initialEntry = "/release-notes",
  children,
}: ParentProps) => (
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes>
      <Route path="/release-notes" element={children} />
      <Route path="/" element={<div>Root Page</div>} />
    </Routes>
  </MemoryRouter>
);

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllTimers();
  });

  it("should set the page title 'Release Notes'", async () => {
    render(<Controller />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(mockUsePageTitle).toHaveBeenCalledWith("Release Notes");
    });
  });

  it("should render the loader when fetching release notes", async () => {
    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("# Mock Markdown Data");
          }, 20000); // This never really needs to resolve for the test
        })
    );

    const { getByLabelText } = render(<Controller />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(getByLabelText("Content Loader")).toBeInTheDocument();
    });
  });

  it("should fetch release notes on mount", async () => {
    render(<Controller />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1);
    });
  });

  it("should render the notes when release notes are fetched", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("# Mock Markdown Data");
          }, 500);
        })
    );

    const { getByText, queryByText } = render(<Controller />, {
      wrapper: TestParent,
    });

    expect(queryByText(/Mock Markdown Data/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(500); // Trigger promise resolution
    });

    await waitFor(() => {
      expect(getByText(/Mock Markdown Data/)).toBeInTheDocument();
    });
  });

  it("should show an error message banner when release notes fail to fetch", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Some error from a utility function"));
          }, 500);
        })
    );

    const { queryByText } = render(<Controller />, {
      wrapper: TestParent,
    });

    expect(queryByText(/Mock Error/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(500); // Trigger promise rejection
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to load release notes.", {
        variant: "error",
      });
    });
  });

  it("should navigate to the home page when release notes fail to fetch", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Mock fetch error"));
          }, 500);
        })
    );

    const { getByText } = render(<Controller />, {
      wrapper: TestParent,
    });

    act(() => {
      jest.advanceTimersByTime(500); // Trigger promise rejection
    });

    await waitFor(() => {
      expect(getByText(/Root Page/)).toBeInTheDocument();
    });
  });

  it("should not fetch release notes if they are already loaded (double render)", async () => {
    const { rerender } = render(<Controller />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1);
    });

    rerender(<Controller />);

    expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1); // One initial fetch only
  });

  it("should not fetch release notes if they are currently being fetched", async () => {
    jest.useFakeTimers();

    mockFetchReleaseNotes.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("# Mock Markdown Data");
          }, 500);
        })
    );

    const { rerender } = render(<Controller />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1);
    });

    act(() => {
      jest.advanceTimersByTime(250); // Halfway through the fetch
    });

    rerender(<Controller />);

    expect(mockFetchReleaseNotes).toHaveBeenCalledTimes(1); // Still only one fetch
  });
});
