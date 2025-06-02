import { axe } from "vitest-axe";
import { render } from "@testing-library/react";
import Banner from "./index";

it("should not have any accessibility violations", async () => {
  const { container } = render(<Banner title="Test Title" subTitle="Test Subtitle" />);

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});
