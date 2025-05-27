import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import MaintenancePage from "./MaintenancePage";

const mockUsePageTitle = jest.fn();
jest.mock("../../hooks/usePageTitle", () => ({
  __esModule: true,
  default: (...p) => mockUsePageTitle(...p),
}));

const mockUseLocation = jest.fn();
const mockUseBlocker = jest.fn();
jest.mock("react-router-dom", () => ({
  __esModule: true,
  ...jest.requireActual("react-router-dom"),
  unstable_useBlocker: (...p) => mockUseBlocker(...p),
  useLocation: () => mockUseLocation(),
}));

describe("Accessibility", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      state: {},
    });
  });

  it("should not have any accessibility violations", async () => {
    const { container } = render(<MaintenancePage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      state: {},
    });
  });

  it("should render without crashing", () => {
    expect(() => render(<MaintenancePage />)).not.toThrow();
  });

  it("should block navigation when in maintenance mode", () => {
    mockUseLocation.mockReturnValue({
      state: { data: { shouldBlock: true } }, // Simulate maintenance mode
    });

    render(<MaintenancePage />);

    expect(mockUseBlocker).toHaveBeenCalledWith(expect.any(Function));
    expect(mockUseBlocker).toHaveBeenCalledTimes(1);
    expect(mockUseBlocker.mock.calls[0][0]()).toBe(true); // Call the anonymous function, expecting true
  });
});

describe("Implementation Requirements", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      state: {},
    });
  });

  it("should set the page title correctly", () => {
    render(<MaintenancePage />);
    expect(mockUsePageTitle).toHaveBeenCalledWith("Website Maintenance");
  });

  it("should display a user-friendly message", () => {
    const { getByText } = render(<MaintenancePage />);

    expect(getByText("Website Maintenance")).toBeInTheDocument();
    expect(
      getByText(
        "The CRDC Submission Portal site is currently undergoing scheduled maintenance. Please check back soon. We appreciate your patience."
      )
    ).toBeInTheDocument();
  });
});

describe("Snapshots", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      state: {},
    });
  });

  it("should match the snapshot", () => {
    const { container } = render(<MaintenancePage />);

    expect(container).toMatchSnapshot();
  });
});
