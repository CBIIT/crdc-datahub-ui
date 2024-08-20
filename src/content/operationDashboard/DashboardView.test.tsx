import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import { FC } from "react";
import DashboardView from "./DashboardView";

const MockParent: FC<{ children: React.ReactElement }> = ({ children }) => (
  <MemoryRouter basename="/">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(
      <DashboardView url="http://example.com" loading={false} currentType="Submission" />,
      { wrapper: MockParent }
    );

    expect(await axe(container)).toHaveNoViolations();
  });

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

describe("Basic Functionality", () => {
  it.todo("should update the URL when the select value changes");

  it.todo("should render the iframe when the URL prop is provided");

  it.todo("should render the loading spinner when the loading prop is true");
});

describe("Implementation Requirements", () => {
  it.todo("should have a dropdown labeled 'Metrics'");

  it.todo("should have a dropdown with the option 'Data Submissions Metrics'");
});
