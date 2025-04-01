import { FC } from "react";
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import Controller from "./Controller";

const mockUsePageTitle = jest.fn();
jest.mock("../../hooks/usePageTitle", () => ({
  ...jest.requireActual("../../hooks/usePageTitle"),
  __esModule: true,
  default: (p: string) => mockUsePageTitle(p),
}));

jest.mock("./NavigatorView", () => ({
  __esModule: true,
  default: ({ version }: { version?: string }) => <div>MOCK NAVIGATOR VIEW {version}</div>,
}));

type ParentProps = {
  initialEntry?: string;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ initialEntry = "/", children }: ParentProps) => (
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes>
      <Route path="/model-navigator/:model/:version?" element={children} />
      <Route path="/" element={<div>MOCK HOME PAGE</div>} />
    </Routes>
  </MemoryRouter>
);

describe("Basic Functionality", () => {
  it("should set the page title", async () => {
    render(<Controller />, {
      wrapper: ({ children }) => (
        <TestParent initialEntry="/model-navigator/fake-model/1.0.0">{children}</TestParent>
      ),
    });

    await waitFor(() => {
      expect(mockUsePageTitle).toHaveBeenCalledWith("Model Navigator");
    });
  });

  it("should render the page without crashing", async () => {
    expect(() =>
      render(<Controller />, {
        wrapper: ({ children }) => (
          <TestParent initialEntry="/model-navigator/fake-model/1.0.0">{children}</TestParent>
        ),
      })
    ).not.toThrow();
  });

  it("should redirect to the latest version if no version is provided", async () => {
    const history = createMemoryRouter(
      [
        {
          path: "/model-navigator/:model/:version?",
          element: <Controller />,
        },
      ],
      { initialEntries: ["/model-navigator/fake-model"] }
    );

    expect(history.state.location.pathname).toBe("/model-navigator/fake-model"); // Assert the "user" is at the starting location

    render(<RouterProvider router={history} />); // Render the router, and subsequently, the Controller with redirect

    await waitFor(() => {
      expect(history.state.location.pathname).toBe("/model-navigator/fake-model/latest"); // Assert the "user" is redirected to the latest version
    });
  });

  it.each<string>(["3.2.0", "latest"])(
    "should pass the version '%s' to the NavigatorView",
    async (version) => {
      render(<Controller />, {
        wrapper: ({ children }) => (
          <TestParent initialEntry={`/model-navigator/fake-model/${version}`}>
            {children}
          </TestParent>
        ),
      });

      await waitFor(() => {
        expect(document.body).toHaveTextContent(`MOCK NAVIGATOR VIEW ${version}`);
      });
    }
  );
});
