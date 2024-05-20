import React, { FC } from "react";
import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { Status as FormStatus, FormProvider, useFormContext } from "./FormContext";
import { query as GET_APP } from "../../graphql/getApplication";
import { query as GET_LAST_APP } from "../../graphql/getMyLastApplication";

type Props = {
  appId: string;
  mocks?: MockedResponse[];
  children?: React.ReactNode;
};

const TestChild: FC = () => {
  const { status, data, error } = useFormContext();
  const { _id, questionnaireData } = data ?? {};

  if (status === FormStatus.LOADING) {
    return null;
  }

  return (
    <>
      {/* Generic Context Details  */}
      {status && <div data-testid="status">{status}</div>}
      {error && <div data-testid="error">{error}</div>}

      {/* API Data */}
      {_id && <div data-testid="app-id">{_id}</div>}
      {typeof questionnaireData?.pi?.firstName === "string" && (
        <div data-testid="pi-first-name">{questionnaireData.pi.firstName}</div>
      )}
      {typeof questionnaireData?.pi?.lastName === "string" && (
        <div data-testid="pi-last-name">{questionnaireData.pi.lastName}</div>
      )}
    </>
  );
};

const TestParent: FC<Props> = ({ mocks, appId, children }: Props) => (
  <MockedProvider mocks={mocks}>
    <FormProvider id={appId}>{children ?? <TestChild />}</FormProvider>
  </MockedProvider>
);

describe("FormContext > useFormContext Tests", () => {
  it("should throw an exception when used outside of a FormProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "FormContext cannot be used outside of the FormProvider component"
    );
    jest.spyOn(console, "error").mockRestore();
  });
});

describe("FormContext > FormProvider Tests", () => {
  it("should return an error for empty IDs", async () => {
    const { findByTestId, getByTestId } = render(<TestParent appId="" />);

    await findByTestId("error");

    expect(getByTestId("status").textContent).toEqual(FormStatus.ERROR);
    expect(getByTestId("error").textContent).toEqual("Invalid application ID provided");
  });

  it("should return an error for graphql-based failures", async () => {
    const mocks = [
      {
        request: {
          query: GET_APP,
          variables: {
            id: "556ac14a-f247-42e8-8878-8468060fb49a",
          },
        },
        result: {
          errors: [new GraphQLError("Test GraphQL error")],
        },
      },
    ];
    const { findByTestId, getByTestId } = render(
      <TestParent mocks={mocks} appId="556ac14a-f247-42e8-8878-8468060fb49a" />
    );

    await findByTestId("error");

    expect(getByTestId("status").textContent).toEqual(FormStatus.ERROR);
    expect(getByTestId("error").textContent).toEqual("An unknown API or GraphQL error occurred");
  });

  it("should return an error for network-based failures", async () => {
    const mocks = [
      {
        request: {
          query: GET_APP,
          variables: {
            id: "556ac14a-f247-42e8-8878-8468060fb49a",
          },
        },
        error: new Error("Test network error"),
      },
    ];
    const { findByTestId, getByTestId } = render(
      <TestParent mocks={mocks} appId="556ac14a-f247-42e8-8878-8468060fb49a" />
    );

    await findByTestId("error");

    expect(getByTestId("status").textContent).toEqual(FormStatus.ERROR);
    expect(getByTestId("error").textContent).toEqual("An unknown API or GraphQL error occurred");
  });

  it("should return data for nominal requests", async () => {
    const mocks = [
      {
        request: {
          query: GET_APP,
          variables: {
            id: "556ac14a-f247-42e8-8878-8468060fb49a",
          },
        },
        result: {
          data: {
            getApplication: {
              _id: "556ac14a-f247-42e8-8878-8468060fb49a",
              questionnaireData: JSON.stringify({
                sections: [{ name: "A", status: "In Progress" }],
                pi: {
                  firstName: "Successfully",
                  lastName: "Fetched",
                },
              }),
            },
          },
        },
      },
    ];
    const { findByTestId, getByTestId } = render(
      <TestParent mocks={mocks} appId="556ac14a-f247-42e8-8878-8468060fb49a" />
    );

    await findByTestId("status");

    expect(getByTestId("status").textContent).toEqual(FormStatus.LOADED);
    expect(getByTestId("app-id").textContent).toEqual("556ac14a-f247-42e8-8878-8468060fb49a");
    expect(getByTestId("pi-first-name").textContent).toEqual("Successfully");
    expect(getByTestId("pi-last-name").textContent).toEqual("Fetched");
  });

  it("should autofill the user's last application for new submissions", async () => {
    const mocks = [
      {
        request: {
          query: GET_LAST_APP,
        },
        result: {
          data: {
            getMyLastApplication: {
              _id: "ABC-LAST-ID-123",
              questionnaireData: JSON.stringify({
                pi: {
                  firstName: "Test",
                  lastName: "User",
                },
              }),
            },
          },
        },
      },
    ];
    const { findByTestId, getByTestId } = render(<TestParent mocks={mocks} appId="new" />);

    await findByTestId("status");

    expect(getByTestId("status").textContent).toEqual(FormStatus.LOADED);
    expect(getByTestId("app-id").textContent).toEqual("new");
    expect(getByTestId("pi-first-name").textContent).toEqual("Test");
    expect(getByTestId("pi-last-name").textContent).toEqual("User");
  });

  it("should default to an empty string when no autofill information is returned", async () => {
    const mocks = [
      {
        request: {
          query: GET_LAST_APP,
        },
        result: {
          data: {
            getMyLastApplication: null,
          },
        },
        errors: [new GraphQLError("The user has no previous applications")],
      },
    ];
    const { findByTestId, getByTestId } = render(<TestParent mocks={mocks} appId="new" />);

    await findByTestId("status");

    expect(getByTestId("status").textContent).toEqual(FormStatus.LOADED);
    expect(getByTestId("app-id").textContent).toEqual("new");
    expect(getByTestId("pi-first-name").textContent).toEqual("");
    expect(getByTestId("pi-last-name").textContent).toEqual("");
  });

  it("should autofill PI details if Section A is not started", async () => {
    const mocks = [
      {
        request: {
          query: GET_LAST_APP,
        },
        result: {
          data: {
            getMyLastApplication: {
              _id: "ABC-LAST-ID-123",
              questionnaireData: JSON.stringify({
                pi: {
                  firstName: "Test",
                  lastName: "User",
                },
              }),
            },
          },
        },
      },
      {
        request: {
          query: GET_APP,
          variables: {
            id: "AAA-BBB-EXISTING-APP",
          },
        },
        result: {
          data: {
            getApplication: {
              _id: "AAA-BBB-EXISTING-APP",
              questionnaireData: JSON.stringify({}),
            },
          },
        },
      },
    ];
    const { findByTestId, getByTestId } = render(
      <TestParent mocks={mocks} appId="AAA-BBB-EXISTING-APP" />
    );

    await findByTestId("status");

    expect(getByTestId("status").textContent).toEqual(FormStatus.LOADED);
    expect(getByTestId("pi-first-name").textContent).toEqual("Test");
    expect(getByTestId("pi-last-name").textContent).toEqual("User");
  });

  it("should not execute getMyLastApplication if Section A is started", async () => {
    const mocks = [
      {
        request: {
          query: GET_LAST_APP,
        },
        result: {
          data: {
            getMyLastApplication: {
              _id: "ABC-LAST-ID-123",
              questionnaireData: JSON.stringify({
                pi: {
                  firstName: "Should not be",
                  lastName: "Used or called",
                },
              }),
            },
          },
        },
      },
      {
        request: {
          query: GET_APP,
          variables: {
            id: "AAA-BBB-EXISTING-APP",
          },
        },
        result: {
          data: {
            getApplication: {
              _id: "AAA-BBB-EXISTING-APP",
              questionnaireData: JSON.stringify({
                sections: [{ name: "A", status: "In Progress" }],
              }),
            },
          },
        },
      },
    ];
    const { findByTestId, getByTestId } = render(
      <TestParent mocks={mocks} appId="AAA-BBB-EXISTING-APP" />
    );

    await findByTestId("status");

    expect(getByTestId("status").textContent).toEqual(FormStatus.LOADED);
    expect(getByTestId("pi-first-name").textContent).toEqual("");
    expect(getByTestId("pi-last-name").textContent).toEqual("");
  });

  // it("should execute saveApplication when setData is called", async () => {
  //   fail("Not implemented");
  // });

  // it("should create and return the appId for new submissions", async () => {
  //   fail("Not implemented");
  // });
});
