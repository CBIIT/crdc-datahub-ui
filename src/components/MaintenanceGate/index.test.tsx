import { MockedResponse, MockedProvider } from "@apollo/client/testing";
import { FC } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { GraphQLError } from "graphql";
import { GET_MAINTENANCE_MODE, GetMaintenanceModeResponse } from "../../graphql/getMaintenanceMode";
import MaintenanceGate from "./index";

type MockParentProps = {
  mocks?: MockedResponse[];
  initialEntries?: string[];
};

const MockParent: FC<MockParentProps> = ({ mocks, initialEntries = ["/"] }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/maintenance" element={<p>Maintenance Mode On</p>} />
        <Route element={<MaintenanceGate />}>
          <Route path="/" element={<p>Home Page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const MaintModeOnMock: MockedResponse<GetMaintenanceModeResponse> = {
  request: {
    query: GET_MAINTENANCE_MODE,
  },
  result: {
    data: {
      maintenanceMode: true,
    },
  },
};

const MaintModeOffMock: MockedResponse<GetMaintenanceModeResponse> = {
  request: {
    query: GET_MAINTENANCE_MODE,
  },
  result: {
    data: {
      maintenanceMode: false,
    },
  },
};

describe("Basic Functionality", () => {
  it("should render without crashing (maintenance mode off)", () => {
    expect(() => render(<MockParent mocks={[MaintModeOffMock]} />)).not.toThrow();
  });

  it("should render without crashing (maintenance mode on)", () => {
    expect(() =>
      render(<MockParent mocks={[MaintModeOnMock]} initialEntries={["/"]} />)
    ).not.toThrow();
  });

  it("should render children when not in maintenance mode", () => {
    const { getByText } = render(<MockParent mocks={[MaintModeOffMock]} initialEntries={["/"]} />);

    expect(getByText("Home Page")).toBeInTheDocument();
  });

  it("should redirect to maintenance page when in maintenance mode", async () => {
    const { getByText } = render(<MockParent mocks={[MaintModeOnMock]} initialEntries={["/"]} />);

    await waitFor(() => {
      expect(getByText("Maintenance Mode On")).toBeInTheDocument();
    });
  });

  it("should handle error when fetching maintenance mode (Network)", () => {
    const errorMock: MockedResponse<GetMaintenanceModeResponse> = {
      request: {
        query: GET_MAINTENANCE_MODE,
      },
      error: new Error("Network error"),
    };

    const { getByText } = render(<MockParent mocks={[errorMock]} initialEntries={["/"]} />);

    // Assume maintenance is DISABLED
    expect(getByText("Home Page")).toBeInTheDocument();
  });

  it("should handle error when fetching maintenance mode (GraphQL)", () => {
    const errorMock: MockedResponse<GetMaintenanceModeResponse> = {
      request: {
        query: GET_MAINTENANCE_MODE,
      },
      result: {
        errors: [new GraphQLError("mock error")],
      },
    };

    const { getByText } = render(<MockParent mocks={[errorMock]} initialEntries={["/"]} />);

    // Assume maintenance is DISABLED
    expect(getByText("Home Page")).toBeInTheDocument();
  });

  it("should handle error when fetching maintenance mode (API)", () => {
    const errorMock: MockedResponse<GetMaintenanceModeResponse> = {
      request: {
        query: GET_MAINTENANCE_MODE,
      },
      result: {
        data: {
          maintenanceMode: null,
        },
      },
    };

    const { getByText } = render(<MockParent mocks={[errorMock]} initialEntries={["/"]} />);

    // Assume maintenance is DISABLED
    expect(getByText("Home Page")).toBeInTheDocument();
  });

  it.todo("should handle loading state when fetching maintenance mode");
});
