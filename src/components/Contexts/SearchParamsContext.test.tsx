import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SearchParamsProvider, useSearchParamsContext } from "./SearchParamsContext";

const TestChild = () => {
  const [searchParams, setSearchParams] = useSearchParamsContext();

  return (
    <>
      <div data-testid="current-query">{searchParams.toString()}</div>
      <button
        type="button"
        onClick={() => setSearchParams(new URLSearchParams({ page: "2" }), { replace: true })}
      >
        Set Page
      </button>
      <button type="button" onClick={() => setSearchParams(new URLSearchParams({ other: "foo" }))}>
        Set Other
      </button>
      <button
        type="button"
        onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
      >
        Clear Params
      </button>
    </>
  );
};

const TestParent = ({ children }) => (
  <MemoryRouter initialEntries={["/test?initial=true"]}>
    <SearchParamsProvider>
      <Routes>
        <Route path="/test" element={children} />
      </Routes>
    </SearchParamsProvider>
  </MemoryRouter>
);

describe("SearchParamsContext", () => {
  it("initializes with provided search parameters", () => {
    render(<TestChild />, { wrapper: TestParent });
    expect(screen.getByTestId("current-query").textContent).toBe("initial=true");
  });

  it("updates search parameters correctly", async () => {
    render(<TestChild />, { wrapper: TestParent });

    userEvent.click(screen.getByText("Set Page"));

    await waitFor(() => {
      expect(screen.getByTestId("current-query").textContent).toBe("page=2");
    });

    userEvent.click(screen.getByText("Set Other"));

    await waitFor(() => {
      expect(screen.getByTestId("current-query").textContent).toContain("other=foo");
    });
  });

  it("clears search parameters correctly", async () => {
    render(<TestChild />, { wrapper: TestParent });

    userEvent.click(screen.getByText("Clear Params"));

    await waitFor(() => {
      expect(screen.getByTestId("current-query").textContent).toBe("");
    });
  });

  it("throws an error when used outside of provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "useSearchParamsContext cannot be used outside of the SearchParamsProvider component"
    );
    consoleSpy.mockRestore();
  });
});
