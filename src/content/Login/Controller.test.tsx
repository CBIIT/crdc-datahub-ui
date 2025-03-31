import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import LoginController from "./Controller";

vi.mock("../../env", () => ({
  ...process.env,
  VITE_NIH_AUTHORIZE_URL: "https://mock-sso-url",
  VITE_NIH_CLIENT_ID: "mock-client-id",
  VITE_NIH_REDIRECT_URL: "mock-redirect-url",
}));

const mockUsePageTitle = vi.fn();
vi.mock("../../hooks/usePageTitle", () => ({
  ...vi.importActual("../../hooks/usePageTitle"),
  __esModule: true,
  default: (p) => mockUsePageTitle(p),
}));

describe("LoginController", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/",
      },
      writable: true,
    });
  });

  it("should set the page title to 'Login'", () => {
    render(<LoginController />, { wrapper: MemoryRouter });

    expect(mockUsePageTitle).toHaveBeenCalledWith("Login");
  });

  it("should render a loader while redirecting to the NIH SSO login page", () => {
    const { getByTestId } = render(<LoginController />, { wrapper: MemoryRouter });

    expect(getByTestId("login-flow-loader")).toBeVisible();
  });

  it("should redirect to the SSO login page with the correct params", () => {
    render(<LoginController />, { wrapper: MemoryRouter });

    expect(window.location.href).toContain("https://mock-sso-url");
    expect(window.location.href).toContain("client_id=mock-client-id");
    expect(window.location.href).toContain("redirect_uri=mock-redirect-url");
    expect(window.location.href).toContain("response_type=code");
    expect(window.location.href).toContain("scope=openid+email+profile");
    expect(window.location.href).toContain("prompt=login");
    expect(window.location.href).not.toContain("state");
  });

  it.each<string>(["/data-submissions", "/users/uuid-1234", "mock-redirect-state"])(
    "should append the redirect state to the redirect URL if it exists as a valid string (%s)",
    (redirectState) => {
      render(<LoginController />, {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/login", { state: { redirectState } }]}>
            {children}
          </MemoryRouter>
        ),
      });

      const serializedRedirectState = encodeURIComponent(redirectState);

      expect(window.location.href).toContain(`state=${serializedRedirectState}`);
    }
  );

  it.each([null, undefined, 1234, {}, [], ""])(
    "should not append the redirect state to the redirect URL if it is not a valid string (%s)",
    (redirectState) => {
      render(<LoginController />, {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={["/login", { state: { redirectState } }]}>
            {children}
          </MemoryRouter>
        ),
      });

      expect(window.location.href).not.toContain("state");
    }
  );
});
