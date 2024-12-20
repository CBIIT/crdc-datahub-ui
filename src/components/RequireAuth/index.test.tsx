import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./index";

const mockUseAuthContext = jest.fn();
jest.mock("../Contexts/AuthContext", () => ({
  ...jest.requireActual("../Contexts/AuthContext"),
  useAuthContext: () => mockUseAuthContext(),
}));

const TestRoutes: React.ReactElement = (
  <MemoryRouter initialEntries={["/protected"]}>
    <Routes>
      <Route
        path="/protected"
        element={
          <RequireAuth
            component={<p>Protected Page</p>}
            redirectPath="/test"
            redirectName="Protected Page"
          />
        }
      />
      <Route path="/" element={<div>Login Page</div>} />
    </Routes>
  </MemoryRouter>
);

describe("Basic Functionality", () => {
  it("should render the protected page when the user is logged in", () => {
    mockUseAuthContext.mockReturnValueOnce({ isLoggedIn: true });

    const { getByText } = render(TestRoutes);

    expect(getByText("Protected Page")).toBeInTheDocument();
  });

  it("should redirect the user home if the user is not logged in", async () => {
    mockUseAuthContext.mockReturnValueOnce({ isLoggedIn: false });

    const { getByText } = render(TestRoutes);

    await waitFor(() => {
      expect(getByText("Login Page")).toBeInTheDocument();
    });
  });
});
