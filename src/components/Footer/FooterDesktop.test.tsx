import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import FooterDesktop from "./FooterDesktop";

describe("Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<FooterDesktop />, { wrapper: (p) => <BrowserRouter {...p} /> });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<FooterDesktop />, { wrapper: (p) => <BrowserRouter {...p} /> })
    ).not.toThrow();
  });
});
