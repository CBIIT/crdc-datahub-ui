import React, { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedProviderProps, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { InstitutionProvider, useInstitutionList } from "./InstitutionListContext";
import { LIST_INSTITUTIONS, ListInstitutionsInput, ListInstitutionsResp } from "../../graphql";

type Props = {
  mocks?: MockedResponse[];
  mockProps?: MockedProviderProps;
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

const TestParent: FC<Props> = ({ mocks = [], mockProps = {}, children }: Props) => (
  <MockedProvider mocks={mocks} {...mockProps}>
    <InstitutionProvider filterInactive>{children ?? <TestChild />}</InstitutionProvider>
  </MockedProvider>
);

describe("useInstitutionList", () => {
  it("should throw an exception when used outside of a InstitutionProvider", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "useInstitutionList cannot be used outside of the InstitutionProvider component"
    );
    vi.spyOn(console, "error").mockRestore();
  });

  it("should render without crashing (no data)", async () => {
    const mocks: MockedResponse<ListInstitutionsResp, ListInstitutionsInput>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listInstitutions: {
              total: 0,
              institutions: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should render without crashing (null data)", async () => {
    const mocks: MockedResponse<ListInstitutionsResp, ListInstitutionsInput>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        variableMatcher: () => true,
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
    const mocks: MockedResponse<ListInstitutionsResp, ListInstitutionsInput>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listInstitutions: {
              total: 3,
              institutions: [
                {
                  _id: "inst 1",
                  name: "inst 1",
                  status: "Active",
                  submitterCount: 0,
                },
                {
                  _id: "inst 2",
                  name: "inst 2",
                  status: "Active",
                  submitterCount: 0,
                },
                {
                  _id: "inst 3",
                  name: "inst 3",
                  status: "Active",
                  submitterCount: 0,
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("3");
  });

  it("should handle API network errors gracefully", async () => {
    const mocks: MockedResponse<ListInstitutionsResp, ListInstitutionsInput>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        variableMatcher: () => true,
        error: new Error("Mock network error"),
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const mocks: MockedResponse<ListInstitutionsResp, ListInstitutionsInput>[] = [
      {
        request: {
          query: LIST_INSTITUTIONS,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Mock GraphQL error")],
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
    expect(getByTestId("ctx-data-length")).toHaveTextContent("0");
  });
});
