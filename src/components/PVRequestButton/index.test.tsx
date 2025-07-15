import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "vitest-axe";

import { render } from "@/test-utils";

import Button from "./index";

type TestParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: React.FC<TestParentProps> = ({ mocks = [], children }) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

describe("Accessibility", () => {
  it("should have no violations for the button", async () => {
    const { container, getByTestId } = render(<Button />, {
      wrapper: TestParent,
    });

    expect(getByTestId("request-pv-button")).toBeEnabled(); // Sanity check for enabled button
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the button (disabled)", async () => {
    const { container, getByTestId } = render(<Button disabled />, {
      wrapper: TestParent,
    });

    expect(getByTestId("request-pv-button")).toBeDisabled(); // Sanity check for disabled
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render without crashing", async () => {
    expect(() => render(<Button />, { wrapper: TestParent })).not.toThrow();
  });

  it.todo("should show a snackbar when the PV request operation fails (GraphQL Error)");

  it.todo("should show a snackbar when the PV request operation fails (Network Error)");

  it.todo("should show a snackbar when the PV request operation fails (API Error)");

  it.todo("should call the onSubmit callback when the operation is successful");

  it.todo("should not call the onSubmit callback when the PV request operation fails");
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it.todo("should be labeled with 'Request New PV'");

  it.todo("should have a tooltip only when the button is disabled");

  it.todo("should display a success message when the request is successful");
});
