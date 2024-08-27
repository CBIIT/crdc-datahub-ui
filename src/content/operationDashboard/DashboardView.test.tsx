import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import { FC } from "react";
import DashboardView from "./DashboardView";

const MockParent: FC<{ children: React.ReactElement }> = ({ children }) => (
  <MemoryRouter basename="/">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  it("should not have any accessibility violations when loading", async () => {
    const { container } = render(<DashboardView url={null} loading currentType="Submission" />, {
      wrapper: MockParent,
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have any accessibility violations in the default state", async () => {
    const { container } = render(
      <DashboardView url={null} loading={false} currentType="Submission" />,
      {
        wrapper: MockParent,
      }
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
