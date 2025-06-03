import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import FooterTablet from "./FooterTablet";

describe("Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<FooterTablet />, { wrapper: (p) => <BrowserRouter {...p} /> });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<FooterTablet />, { wrapper: (p) => <BrowserRouter {...p} /> })
    ).not.toThrow();
  });
});
