import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import dayjs from "dayjs";
import { GraphQLError } from "graphql";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { RETRIEVE_OMB_DETAILS, RetrieveOMBDetailsResp } from "../../graphql";
import { render, waitFor } from "../../test-utils";

import PansBanner from "./index";

const mockOMBDetails = {
  ombNumber: "1234-5678",
  expirationDate: "06/30/2025",
  content: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  ],
};

const successMock: MockedResponse<RetrieveOMBDetailsResp> = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  result: {
    data: {
      retrieveOMBDetails: mockOMBDetails,
    },
  },
};

const errorMock: MockedResponse<RetrieveOMBDetailsResp> = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  error: new GraphQLError("Failed to fetch OMB details"),
};

const PansBannerWithProvider = ({
  mocks = [successMock],
}: {
  mocks?: MockedResponse<RetrieveOMBDetailsResp>[];
}) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <PansBanner />
  </MockedProvider>
);

describe("Accessibility", () => {
  it("should have no violations when loaded", async () => {
    const { container } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(container.querySelector('[data-testid="pans-approval-number"]')).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations during loading", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<PansBannerWithProvider />);

    expect(await axe(container)).toHaveNoViolations();

    vi.restoreAllMocks();
  });
});

describe("Basic Functionality", () => {
  it("should render the PANS banner without crashing", () => {
    expect(() => render(<PansBannerWithProvider />)).not.toThrow();
  });

  it("should show skeleton components while loading", () => {
    const { getByTestId } = render(<PansBannerWithProvider />);

    expect(getByTestId("pans-approval-number-skeleton")).toBeInTheDocument();
    expect(getByTestId("pans-expiration-skeleton")).toBeInTheDocument();
    expect(getByTestId("pans-content-skeleton")).toBeInTheDocument();
  });

  it("should hide skeleton components after loading", async () => {
    const { queryByTestId, getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(getByTestId("pans-approval-number")).toBeInTheDocument();
    });

    expect(queryByTestId("pans-approval-number-skeleton")).not.toBeInTheDocument();
    expect(queryByTestId("pans-expiration-skeleton")).not.toBeInTheDocument();
    expect(queryByTestId("pans-content-skeleton")).not.toBeInTheDocument();
  });

  it("should display dynamic OMB details from GraphQL", async () => {
    const { getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(getByTestId("pans-approval-number")).toHaveTextContent("OMB No.: 1234-5678");
      expect(getByTestId("pans-expiration")).toHaveTextContent("Expiration Date: 06/30/2025");
    });

    const contentElement = getByTestId("pans-content");
    expect(contentElement).toHaveTextContent(mockOMBDetails.content[0]);
    expect(contentElement).toHaveTextContent(mockOMBDetails.content[1]);
  });

  it("should handle different OMB data", async () => {
    const customMockData = {
      ombNumber: "9999-1111",
      expirationDate: "12/31/2026",
      content: ["Custom lorem ipsum content paragraph."],
    };

    const customMock: MockedResponse<RetrieveOMBDetailsResp> = {
      request: {
        query: RETRIEVE_OMB_DETAILS,
      },
      result: {
        data: {
          retrieveOMBDetails: customMockData,
        },
      },
    };

    const { getByTestId } = render(<PansBannerWithProvider mocks={[customMock]} />);

    await waitFor(() => {
      expect(getByTestId("pans-approval-number")).toHaveTextContent("OMB No.: 9999-1111");
      expect(getByTestId("pans-expiration")).toHaveTextContent("Expiration Date: 12/31/2026");
    });

    const contentElement = getByTestId("pans-content");
    expect(contentElement).toHaveTextContent("Custom lorem ipsum content paragraph.");
  });

  it("should return null when GraphQL query fails", async () => {
    const { container } = render(<PansBannerWithProvider mocks={[errorMock]} />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});

describe("Implementation Requirements", () => {
  it("should contain the OMB Approval Number", async () => {
    const { container, getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(container.textContent).toContain("OMB No.:");
      expect(getByTestId("pans-approval-number")).toHaveTextContent(/1234-5678/);
    });
  });

  it("should contain the Expiration Date", async () => {
    const { container, getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(container.textContent).toContain("Expiration Date:");
      expect(getByTestId("pans-expiration")).toHaveTextContent(/06\/30\/2025/);
    });
  });

  // NOTE: Passive test to ensure the OMB Approval date is not outdated
  it.skip("should not contain an outdated OMB Approval date", async () => {
    const { getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      const expirationText = getByTestId("pans-expiration").textContent;
      const dateMatch = expirationText?.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (dateMatch) {
        const expirationDate = dayjs(dateMatch[1], "MM/DD/YYYY");
        expect(expirationDate.isAfter(dayjs())).toBe(true);
      }
    });
  });
});
