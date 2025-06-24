import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

import { render } from "../../test-utils";

import NavigationBreadcrumbs, { BreadcrumbEntry } from "./index";

describe("Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const entries: BreadcrumbEntry[] = [
      { label: "link item", to: "/link-item" },
      { label: "non-link" },
    ];

    const { container } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<NavigationBreadcrumbs entries={[]} />, {
        wrapper: MemoryRouter,
      })
    ).not.toThrow();
  });

  it("should render the correct number of breadcrumbs", () => {
    const entries: BreadcrumbEntry[] = [
      { label: "Home", to: "/" },
      { label: "Data Explorer", to: "/data-explorer" },
      { label: "Study View", to: "/data-explorer/study-view" },
      { label: "Metadata Details", to: "/data-explorer/study-view/metadata-details" },
    ];

    const { getAllByTestId } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(getAllByTestId(/breadcrumb-entry/i)).toHaveLength(4);
  });

  it("should support entries that are not links", async () => {
    const entries: BreadcrumbEntry[] = [
      { label: "Home" },
      { label: "Products" },
      { label: "Electronics" },
    ];

    const { queryAllByRole } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(queryAllByRole("link")).toHaveLength(0);
  });

  it("should style links correctly", () => {
    const entries: BreadcrumbEntry[] = [{ label: "Some Page", to: "/some-page" }];

    const { getByTestId } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(getByTestId("breadcrumb-entry-0")).toHaveStyle("color: #005EA2");
  });

  it("should style non-link items correctly", () => {
    const entries: BreadcrumbEntry[] = [{ label: "Non-Link Item" }];

    const { getByTestId } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(getByTestId("breadcrumb-entry-0")).toHaveStyle("color: #1B1B1B");
  });

  it("should support rerendering with different entries", () => {
    const initialEntries: BreadcrumbEntry[] = [{ label: "Initial" }];
    const newEntries: BreadcrumbEntry[] = [{ label: "Updated" }];

    const { rerender, getByTestId } = render(<NavigationBreadcrumbs entries={initialEntries} />, {
      wrapper: MemoryRouter,
    });

    expect(getByTestId("breadcrumb-entry-0")).toHaveTextContent("Initial");

    rerender(<NavigationBreadcrumbs entries={newEntries} />);

    expect(getByTestId("breadcrumb-entry-0")).toHaveTextContent("Updated");
  });
});

describe("Snapshots", () => {
  it("should match the snapshot", () => {
    const entries: BreadcrumbEntry[] = [
      { label: "Home", to: "/" },
      { label: "Data Explorer", to: "/data-explorer" },
      { label: "Study View", to: "/data-explorer/study-view" },
      { label: "Metadata Details", to: "/data-explorer/study-view/metadata-details" },
    ];

    const { container } = render(<NavigationBreadcrumbs entries={entries} />, {
      wrapper: MemoryRouter,
    });

    expect(container).toMatchSnapshot();
  });
});
