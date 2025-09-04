import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import dayjs from "dayjs";
import PansBanner from "./index";

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(<PansBanner />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render the PANS banner without crashing", () => {
    expect(() => render(<PansBanner />)).not.toThrow();
  });
});

describe("Implementation Requirements", () => {
  it("should contain the OMB Approval Number", () => {
    const { container, getByTestId } = render(<PansBanner />);

    expect(container.textContent).toContain("OMB No.:");
    expect(getByTestId("pans-approval-number")).toHaveTextContent(/0925-7775/);
  });

  it("should contain the Expiration Date", () => {
    const { container, getByTestId } = render(<PansBanner />);

    expect(container.textContent).toContain("Expiration Date:");
    expect(getByTestId("pans-expiration")).toHaveTextContent(/06\/30\/2025/);
  });

  // NOTE: Passive test to ensure the OMB Approval date is not outdated
  it.skip("should not contain an outdated OMB Approval date", () => {
    const { getByTestId } = render(<PansBanner />);

    const expirationDate = dayjs(getByTestId("pans-expiration").textContent, "MM/DD/YYYY");
    expect(expirationDate.isAfter(dayjs())).toBe(true);
  });
});
