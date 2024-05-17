import React, { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { InstitutionProvider, useInstitutionList } from "./InstitutionListContext";
import { LIST_ORGS, ListOrgsResp } from "../../graphql";

type Props = {
  mocks?: MockedResponse[];
  children?: React.ReactNode;
};

const TestChild: FC = () => {
  const { status } = useInstitutionList();

  return <div data-testid="ctx-status">{status}</div>;
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
    const mocks: MockedResponse<ListOrgsResp>[] = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          data: {
            listOrganizations: [],
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
  });

  it("should render without crashing > null", async () => {
    const mocks: MockedResponse<ListOrgsResp>[] = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          data: {
            listOrganizations: null,
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
  });

  it("should handle API network errors gracefully", async () => {
    const mocks: MockedResponse<ListOrgsResp>[] = [
      {
        request: {
          query: LIST_ORGS,
        },
        error: new Error("Mock network error"),
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
  });

  it("should handle API network errors gracefully", async () => {
    const mocks: MockedResponse<ListOrgsResp>[] = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          errors: [new GraphQLError("Mock GraphQL error")],
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
  });
});
