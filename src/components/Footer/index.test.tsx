import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./index";

describe("Footer", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = render(<Footer />, { wrapper: (p) => <BrowserRouter {...p} /> });
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
