import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { axe } from "jest-axe";
import dayjs from "dayjs";
import PansBanner from "./index";
import { GET_OMB_BANNER } from "../../graphql";

const mockOmbData = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content: "Test OMB content for unit testing.",
};

const successMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  result: {
    data: {
      getOmbBanner: mockOmbData,
    },
  },
};

const errorMock = {
  request: {
    query: GET_OMB_BANNER,
  },
  error: new Error("Failed to fetch OMB data"),
};

const renderWithMocks = (mocks: Array<{ request: any; result?: any; error?: any }>) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PansBanner />
    </MockedProvider>
  );

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = renderWithMocks([successMock]);

    // Wait for loading to complete
    await screen.findByTestId("pans-approval-number");

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render the PANS banner without crashing", async () => {
    expect(() => renderWithMocks([successMock])).not.toThrow();
  });

  it("should show loading skeleton initially", () => {
    renderWithMocks([successMock]);

    // Check for skeleton elements (they should be present during loading)
    expect(document.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});

describe("Dynamic Content Loading", () => {
  it("should display dynamic OMB data when loaded successfully", async () => {
    renderWithMocks([successMock]);

    // Wait for data to load
    const approvalNumber = await screen.findByTestId("pans-approval-number");
    const expirationDate = await screen.findByTestId("pans-expiration");

    expect(approvalNumber).toHaveTextContent(`OMB No.: ${mockOmbData.ombNumber}`);
    expect(expirationDate).toHaveTextContent(`Expiration Date: ${mockOmbData.expirationDate}`);
    expect(screen.getByText(mockOmbData.content)).toBeInTheDocument();
  });

  it("should fallback to default content on API error", async () => {
    renderWithMocks([errorMock]);

    // Wait for error state and fallback to default content
    const approvalNumber = await screen.findByTestId("pans-approval-number");
    const expirationDate = await screen.findByTestId("pans-expiration");

    expect(approvalNumber).toHaveTextContent("OMB No.: 0925-7775");
    expect(expirationDate).toHaveTextContent("Expiration Date: 06/30/2025");
    expect(screen.getByText(/Collection of this information is authorized/)).toBeInTheDocument();
  });
});

describe("Implementation Requirements", () => {
  it("should contain the OMB Approval Number", async () => {
    renderWithMocks([successMock]);

    const approvalNumber = await screen.findByTestId("pans-approval-number");
    expect(approvalNumber).toHaveTextContent(/OMB No.:/);
    expect(approvalNumber).toHaveTextContent(/0925-7775/);
  });

  it("should contain the Expiration Date", async () => {
    renderWithMocks([successMock]);

    const expirationDate = await screen.findByTestId("pans-expiration");
    expect(expirationDate).toHaveTextContent(/Expiration Date:/);
    expect(expirationDate).toHaveTextContent(/06\/30\/2025/);
  });

  // NOTE: Passive test to ensure the OMB Approval date is not outdated
  it.skip("should not contain an outdated OMB Approval date", async () => {
    renderWithMocks([successMock]);

    const expirationDate = await screen.findByTestId("pans-expiration");
    const dateText = expirationDate.textContent?.replace("Expiration Date: ", "");
    const parsedDate = dayjs(dateText, "MM/DD/YYYY");
    expect(parsedDate.isAfter(dayjs())).toBe(true);
  });
});
