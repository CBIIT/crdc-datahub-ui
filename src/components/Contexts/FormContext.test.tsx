import React, { FC } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { Status as FormStatus, FormProvider, useFormContext } from "./FormContext";
import { query as GET_APP } from "../../graphql/getApplication";
import { query as GET_LAST_APP } from "../../graphql/getMyLastApplication";
import {
  APPROVE_APP,
  ApproveAppInput,
  ApproveAppResp,
  GetAppResp,
  INQUIRE_APP,
  InquireAppResp,
  REJECT_APP,
  REOPEN_APP,
  RejectAppResp,
  ReopenAppResp,
} from "../../graphql";

const baseApplication: Omit<Application, "questionnaireData"> = {
  _id: "",
  status: "New",
  createdAt: "",
  updatedAt: "",
  submittedDate: "",
  history: [],
  controlledAccess: false,
  openAccess: false,
  ORCID: "",
  PI: "",
  applicant: {
    applicantID: "",
    applicantName: "",
    applicantEmail: "",
  },
  programName: "",
  studyAbbreviation: "",
  conditional: false,
  pendingConditions: [],
  programAbbreviation: "",
  programDescription: "",
  version: "",
};

const baseQuestionnaireData: QuestionnaireData = {
  sections: [],
  pi: {
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    ORCID: "",
    institution: "",
    address: "",
  },
  piAsPrimaryContact: false,
  primaryContact: {
    position: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
  },
  additionalContacts: [],
  program: {
    _id: "",
    name: "",
    abbreviation: "",
    description: "",
  },
  study: {
    name: "",
    abbreviation: "",
    description: "",
    publications: [],
    plannedPublications: [],
    repositories: [],
    funding: [],
    isDbGapRegistered: false,
    dbGaPPPHSNumber: "",
  },
  accessTypes: [],
  targetedSubmissionDate: "",
  targetedReleaseDate: "",
  timeConstraints: [],
  cancerTypes: [],
  otherCancerTypes: "",
  otherCancerTypesEnabled: false,
  preCancerTypes: "",
  numberOfParticipants: 0,
  species: [],
  otherSpeciesEnabled: false,
  otherSpeciesOfSubjects: "",
  cellLines: false,
  modelSystems: false,
  imagingDataDeIdentified: false,
  dataDeIdentified: false,
  dataTypes: [],
  otherDataTypes: "",
  clinicalData: {
    dataTypes: [],
    otherDataTypes: "",
    futureDataTypes: false,
  },
  files: [],
  submitterComment: "",
};

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
});

describe("approveForm Tests", () => {
  const getAppMock: MockedResponse<GetAppResp> = {
    request: {
      query: GET_APP,
    },
    variableMatcher: () => true,
    result: {
      data: {
        getApplication: {
          ...baseApplication,
          questionnaireData: JSON.stringify({
            ...baseQuestionnaireData,
            sections: [{ name: "A", status: "In Progress" }], // To prevent fetching lastApp
          }),
        },
      },
    },
  };

  it("should send an approve request to the API", async () => {
    const appId = "556ac14a-f247-42e8-8878-8468060fb49a";

    const mockVariableMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<ApproveAppResp, ApproveAppInput> = {
      request: {
        query: APPROVE_APP,
      },
      variableMatcher: mockVariableMatcher,
      result: {
        data: {
          approveApplication: {
            _id: appId,
          },
        },
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId={appId}>
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const approveResp = await result.current.approveForm("mock approval comment", true);
      expect(approveResp).toEqual({
        status: "success",
        id: appId,
      });
      expect(mockVariableMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: "mock approval comment",
          wholeProgram: true,
        })
      );
    });
  });

  it("should send all institution names when approving an application", async () => {
    const appId = "556ac14a-f247-42e8-8878-8468060fb49a";

    const getAppMock: MockedResponse<GetAppResp> = {
      request: {
        query: GET_APP,
      },
      variableMatcher: () => true,
      result: {
        data: {
          getApplication: {
            ...baseApplication,
            questionnaireData: JSON.stringify({
              ...baseQuestionnaireData,
              sections: [{ name: "A", status: "In Progress" }], // To prevent fetching lastApp
              pi: {
                ...baseQuestionnaireData.pi,
                institution: "PI-INST-NAME",
              },
              primaryContact: {
                ...baseQuestionnaireData.primaryContact,
                institution: "PC-INST-NAME",
              },
              additionalContacts: [
                {
                  ...baseQuestionnaireData.primaryContact,
                  institution: "AC-INST-NAME-0",
                },
                {
                  ...baseQuestionnaireData.primaryContact,
                  institution: "AC-INST-NAME-1",
                },
                {
                  ...baseQuestionnaireData.primaryContact,
                  institution: "AC-INST-NAME-2",
                },
              ],
            }),
          },
        },
      },
    };

    const mockVariableMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<ApproveAppResp, ApproveAppInput> = {
      request: {
        query: APPROVE_APP,
      },
      variableMatcher: mockVariableMatcher,
      result: {
        data: {
          approveApplication: {
            _id: appId,
          },
        },
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId={appId}>
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const approveResp = await result.current.approveForm("", true);
      expect(approveResp).toEqual({
        status: "success",
        id: appId,
      });
      expect(mockVariableMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          institutions: [
            "PI-INST-NAME",
            "PC-INST-NAME",
            "AC-INST-NAME-0",
            "AC-INST-NAME-1",
            "AC-INST-NAME-2",
          ],
        })
      );
    });
  });

  it("should gracefully handle API GraphQL errors", async () => {
    const appId = "556ac14a-f247-42e8-8878-8468060fb49a";
    const mock: MockedResponse<ApproveAppResp, ApproveAppInput> = {
      request: {
        query: APPROVE_APP,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Test GraphQL error")],
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId={appId}>
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const approveResp = await result.current.approveForm("", true);
      expect(approveResp).toEqual({
        status: "failed",
        errorMessage: "Test GraphQL error",
      });
    });
  });

  it("should gracefully handle API network errors", async () => {
    const appId = "556ac14a-f247-42e8-8878-8468060fb49a";
    const mock: MockedResponse<ApproveAppResp, ApproveAppInput> = {
      request: {
        query: APPROVE_APP,
      },
      variableMatcher: () => true,
      error: new Error("Test network error"),
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId={appId}>
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const approveResp = await result.current.approveForm("", true);
      expect(approveResp).toEqual({
        status: "failed",
        errorMessage: "Test network error",
      });
    });
  });
});

describe("inquireForm Tests", () => {
  const getAppMock: MockedResponse<GetAppResp> = {
    request: {
      query: GET_APP,
    },
    variableMatcher: () => true,
    result: {
      data: {
        getApplication: {
          ...baseApplication,
          questionnaireData: JSON.stringify({
            ...baseQuestionnaireData,
            sections: [{ name: "A", status: "In Progress" }], // To prevent fetching lastApp
          }),
        },
      },
    },
  };

  it("should send an inquire request to the API", async () => {
    const mockVariableMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<InquireAppResp> = {
      request: {
        query: INQUIRE_APP,
      },
      variableMatcher: mockVariableMatcher,
      result: {
        data: {
          inquireApplication: {
            _id: "mock-inquire-id",
          },
        },
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-inquire-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const inquireResp = await result.current.inquireForm("mock comment here");
      expect(inquireResp).toEqual("mock-inquire-id");
      expect(mockVariableMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: "mock comment here",
        })
      );
    });
  });

  it("should gracefully handle API GraphQL errors", async () => {
    const mock: MockedResponse<InquireAppResp> = {
      request: {
        query: INQUIRE_APP,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Test Inquire GraphQL error")],
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const inquireResp = await result.current.inquireForm("");
      expect(inquireResp).toEqual(false);
    });
  });

  it("should gracefully handle API network errors", async () => {
    const mock: MockedResponse<InquireAppResp> = {
      request: {
        query: INQUIRE_APP,
      },
      variableMatcher: () => true,
      error: new Error("Test Inquire network error"),
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const approveResp = await result.current.inquireForm("");
      expect(approveResp).toEqual(false);
    });
  });
});

describe("rejectForm Tests", () => {
  const getAppMock: MockedResponse<GetAppResp> = {
    request: {
      query: GET_APP,
    },
    variableMatcher: () => true,
    result: {
      data: {
        getApplication: {
          ...baseApplication,
          questionnaireData: JSON.stringify({
            ...baseQuestionnaireData,
            sections: [{ name: "A", status: "In Progress" }], // To prevent fetching lastApp
          }),
        },
      },
    },
  };

  it("should send an reject request to the API", async () => {
    const mockVariableMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<RejectAppResp> = {
      request: {
        query: REJECT_APP,
      },
      variableMatcher: mockVariableMatcher,
      result: {
        data: {
          rejectApplication: {
            _id: "mock-reject-id",
          },
        },
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-reject-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const rejectResp = await result.current.rejectForm("mock reject comment");
      expect(rejectResp).toEqual("mock-reject-id");
      expect(mockVariableMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: "mock reject comment",
        })
      );
    });
  });

  it("should gracefully handle API GraphQL errors", async () => {
    const mock: MockedResponse<RejectAppResp> = {
      request: {
        query: REJECT_APP,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Test Reject GraphQL error")],
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const rejectResp = await result.current.rejectForm("");
      expect(rejectResp).toEqual(false);
    });
  });

  it("should gracefully handle API network errors", async () => {
    const mock: MockedResponse<RejectAppResp> = {
      request: {
        query: REJECT_APP,
      },
      variableMatcher: () => true,
      error: new Error("Test Reject network error"),
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const rejectResp = await result.current.rejectForm("");
      expect(rejectResp).toEqual(false);
    });
  });
});

describe("reopenForm Tests", () => {
  const getAppMock: MockedResponse<GetAppResp> = {
    request: {
      query: GET_APP,
    },
    variableMatcher: () => true,
    result: {
      data: {
        getApplication: {
          ...baseApplication,
          questionnaireData: JSON.stringify({
            ...baseQuestionnaireData,
            sections: [{ name: "A", status: "In Progress" }], // To prevent fetching lastApp
          }),
        },
      },
    },
  };

  it("should send a reopen request to the API", async () => {
    const mockVariableMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<ReopenAppResp> = {
      request: {
        query: REOPEN_APP,
      },
      variableMatcher: mockVariableMatcher,
      result: {
        data: {
          reopenApplication: {
            _id: "mock-reopen-id",
            status: "In Progress",
          } as ReopenAppResp["reopenApplication"],
        },
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-reopen-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const reviewResp = await result.current.reopenForm();
      expect(reviewResp).toEqual("mock-reopen-id");
      expect(mockVariableMatcher).toHaveBeenCalled();
    });
  });

  it("should gracefully handle API GraphQL errors", async () => {
    const mock: MockedResponse<ReopenAppResp> = {
      request: {
        query: REOPEN_APP,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Test Reopen GraphQL error")],
      },
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const reviewResp = await result.current.reopenForm();
      expect(reviewResp).toEqual(false);
    });
  });

  it("should gracefully handle API network errors", async () => {
    const mock: MockedResponse<ReopenAppResp> = {
      request: {
        query: REOPEN_APP,
      },
      variableMatcher: () => true,
      error: new Error("Test Reopen network error"),
    };

    const { result } = renderHook(() => useFormContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[getAppMock, mock]} appId="mock-app-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(FormStatus.LOADED);
    });

    await act(async () => {
      const reviewResp = await result.current.reopenForm();
      expect(reviewResp).toEqual(false);
    });
  });
});
