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

  it("should render without crashing > empty array", async () => {
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

  it("should render without crashing > null", async () => {
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

  it("should render without crashing > actual data", async () => {
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
});
