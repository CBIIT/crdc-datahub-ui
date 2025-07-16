import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import dayjs from "dayjs";
import { GraphQLError } from "graphql";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { RETRIEVE_OMB_DETAILS } from "../../graphql";
import { render, waitFor } from "../../test-utils";

import PansBanner from "./index";

const mockOMBDetails = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content: [
    "Collection of this information is authorized by The Public Health Service Act, Section 411 (42 USC 285a). Rights of participants are protected by The Privacy Act of 1974. Participation is voluntary, and there are no penalties for not participating or withdrawing at any time. Refusal to participate will not affect your benefits in any way. The information collected will be kept private to the extent provided by law. Names and other identifiers will not appear in any report. Information provided will be combined for all participants and reported as summaries. You are being contacted online to complete this form so that NCI can consider your study for submission into the Cancer Research Data Commons.",
    "Public reporting burden for this collection of information is estimated to average 60 minutes per response, including the time for reviewing instructions, searching existing data sources, gathering and maintaining the data needed, and completing and reviewing the collection of information. An agency may not conduct or sponsor, and a person is not required to respond to, a collection of information unless it displays a currently valid OMB control number. Send comments regarding this burden estimate or any other aspect of this collection of information, including suggestions for reducing this burden to: NIH, Project Clearance Branch, 6705 Rockledge Drive, MSC 7974, Bethesda, MD 20892-7974, ATTN: PRA (0925-7775). Do not return the completed form to this address.",
  ],
};

const successMock = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  result: {
    data: {
      retrieveOMBDetails: mockOMBDetails,
    },
  },
};

const errorMock = {
  request: {
    query: RETRIEVE_OMB_DETAILS,
  },
  error: new GraphQLError("Failed to fetch OMB details"),
} as const;

const PansBannerWithProvider = ({ mocks = [successMock] }: { mocks?: MockedResponse[] }) => (
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
});

describe("Loading States", () => {
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
});

describe("Dynamic Content", () => {
  it("should display dynamic OMB details from GraphQL", async () => {
    const { getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(getByTestId("pans-approval-number")).toHaveTextContent("OMB No.: 0925-7775");
      expect(getByTestId("pans-expiration")).toHaveTextContent("Expiration Date: 06/30/2025");
    });

    const contentElement = getByTestId("pans-content");
    expect(contentElement).toHaveTextContent(mockOMBDetails.content[0]);
    expect(contentElement).toHaveTextContent(mockOMBDetails.content[1]);
  });

  it("should handle different OMB data", async () => {
    const customMockData = {
      ombNumber: "1234-5678",
      expirationDate: "12/31/2026",
      content: ["Custom content paragraph."],
    };

    const customMock = {
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
      expect(getByTestId("pans-approval-number")).toHaveTextContent("OMB No.: 1234-5678");
      expect(getByTestId("pans-expiration")).toHaveTextContent("Expiration Date: 12/31/2026");
    });

    const contentElement = getByTestId("pans-content");
    expect(contentElement).toHaveTextContent("Custom content paragraph.");
  });
});

describe("Error Handling", () => {
  it("should display fallback content when GraphQL query fails", async () => {
    const { getByTestId } = render(<PansBannerWithProvider mocks={[errorMock]} />);

    await waitFor(() => {
      expect(getByTestId("pans-approval-number")).toHaveTextContent("OMB No.: 0925-7775");
      expect(getByTestId("pans-expiration")).toHaveTextContent("Expiration Date: 06/30/2025");
    });

    // Should contain the fallback static content
    const { container } = render(<PansBannerWithProvider mocks={[errorMock]} />);
    await waitFor(() => {
      expect(container.textContent).toContain("Collection of this information is authorized");
    });
  });
});

describe("Implementation Requirements", () => {
  it("should contain the OMB Approval Number", async () => {
    const { container, getByTestId } = render(<PansBannerWithProvider />);

    await waitFor(() => {
      expect(container.textContent).toContain("OMB No.:");
      expect(getByTestId("pans-approval-number")).toHaveTextContent(/0925-7775/);
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
      const expirationDate = dayjs(getByTestId("pans-expiration").textContent, "MM/DD/YYYY");
      expect(expirationDate.isAfter(dayjs())).toBe(true);
    });
  });
});
