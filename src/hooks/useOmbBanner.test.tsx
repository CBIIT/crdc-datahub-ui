import { renderHook, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { ReactNode } from "react";
import { useOmbBanner } from "./useOmbBanner";
import { GET_OMB_BANNER } from "../graphql";

const mockOmbData = {
  ombNumber: "0925-7775",
  expirationDate: "06/30/2025",
  content: "Test OMB content",
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

const createWrapper =
  (mocks: Array<{ request: any; result?: any; error?: any }>) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );

describe("useOmbBanner", () => {
  it("should return loading state initially", () => {
    const { result } = renderHook(() => useOmbBanner(), {
      wrapper: createWrapper([successMock]),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.ombBanner).toBeUndefined();
  });

  it("should return OMB banner data on successful fetch", async () => {
    const { result } = renderHook(() => useOmbBanner(), {
      wrapper: createWrapper([successMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.ombBanner).toEqual(mockOmbData);
  });

  it("should return error state on failed fetch", async () => {
    const { result } = renderHook(() => useOmbBanner(), {
      wrapper: createWrapper([errorMock]),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.ombBanner).toBeUndefined();
  });
});
