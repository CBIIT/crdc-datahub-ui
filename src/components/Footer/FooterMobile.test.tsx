import { render, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import FooterMobile from "./FooterMobile";

describe("Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<FooterMobile />, { wrapper: (p) => <BrowserRouter {...p} /> });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<FooterMobile />, { wrapper: (p) => <BrowserRouter {...p} /> })
    ).not.toThrow();
  });

  it("should toggle the expand of sections on click", () => {
    const { getAllByTestId } = render(<FooterMobile />, {
      wrapper: (p) => <BrowserRouter {...p} />,
    });

    const allGroups = getAllByTestId("dropdown-section-group");

    userEvent.click(within(allGroups[0]).getByRole("button"));

    expect(within(allGroups[0]).getByTestId("dropdown-section-content")).toBeVisible();

    userEvent.click(within(allGroups[0]).getByRole("button"));

    expect(within(allGroups[0]).getByTestId("dropdown-section-content")).not.toBeVisible();
  });
});
