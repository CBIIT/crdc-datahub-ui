import React, { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { InstitutionProvider, useInstitutionList } from "./InstitutionListContext";
import { LIST_INSTITUTIONS, ListInstitutionsResp } from "../../graphql";

type Props = {
  mocks?: MockedResponse[];
  children?: React.ReactNode;
};

const TestChild: FC = () => {
  const { status, data } = useInstitutionList();

  return (
    <>
      <div data-testid="ctx-status">{status}</div>
      <div data-testid="ctx-data-length">{data?.length}</div>
      <div data-testid="ctx-data-json">{data ? JSON.stringify(data) : null}</div>
    </>
  );
};

const TestParent: FC<Props> = ({ mocks = [], children }: Props) => (
  <MockedProvider mocks={mocks}>
    <InstitutionProvider>{children ?? <TestChild />}</InstitutionProvider>
  </MockedProvider>
);

describe("useInstitutionList", () => {
  it("should throw an exception when used outside of a InstitutionProvider", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "useInstitutionList cannot be used outside of the InstitutionProvider component"
    );
    jest.spyOn(console, "error").mockRestore();
  });

  it("should render without crashing (no data)", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          data: {
            listInstitutions: [],
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should render without crashing (null data)", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          data: {
            listInstitutions: null,
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should render without crashing (actual data)", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          data: {
            listInstitutions: ["inst 1", "inst 2", "inst 3"],
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("3");
  });

  it("should handle API network errors gracefully", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        error: new Error("Mock network error"),
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          errors: [new GraphQLError("Mock GraphQL error")],
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should sort the names alphabetically in descending order", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          data: {
            listInstitutions: ["zebra", "1 potato", "1 alphabet", "NIH", "CDS"],
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));

    const dataset = JSON.parse(getByTestId("ctx-data-json").textContent);
    expect(dataset[0]).toBe("1 alphabet");
    expect(dataset[1]).toBe("1 potato");
    expect(dataset[2]).toBe("CDS");
    expect(dataset[3]).toBe("NIH");
    expect(dataset[4]).toBe("zebra");
  });

  it("should filter unexpected data types from the results", async () => {
    const mocks: MockedResponse<ListInstitutionsResp>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        result: {
          data: {
            listInstitutions: ["real data", { thisIsAObject: true }, 456, null] as string[],
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("1");
  });
});
