import { axe } from "jest-axe";
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import Banner from "./index";

it("should not have any accessibility violations", async () => {
  const { container } = render(<Banner title="Test Title" subTitle="Test Subtitle" />, {
    wrapper: HelmetProvider,
  });

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
