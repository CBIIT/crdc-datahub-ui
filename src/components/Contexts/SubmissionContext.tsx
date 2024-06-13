import React, { FC, createContext, useContext, useEffect, useState } from "react";
import { ApolloError, ApolloQueryResult, useQuery } from "@apollo/client";
import { GetSubmissionResp, GET_SUBMISSION, GetSubmissionInput } from "../../graphql";

export type SubmissionCtxState = {
  /**
   * The current state of the context
   */
  status: SubmissionCtxStatus;
  /**
   * The data returned by the query
   */
  data: GetSubmissionResp | null;
  /**
   * The error returned by the query
   */
  error: ApolloError | null;
  /**
   * Initiates polling for the query at the specified interval
   */
  startPolling?: (pollInterval: number) => void;
  /**
   * Stops polling for the query
   */
  stopPolling?: () => void;
  /**
   * Force refetch the query
   */
  refetch?: () => Promise<ApolloQueryResult<GetSubmissionResp>>;
  /**
   * Update the cached query data without a network request
   *
   * @param callback The function to update the query data
   */
  updateQuery?: (callback: (prev: GetSubmissionResp) => GetSubmissionResp) => void;
};

export enum SubmissionCtxStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const initialState: SubmissionCtxState = {
  status: SubmissionCtxStatus.LOADING,
  data: null,
  error: null,
  startPolling: null,
  stopPolling: null,
  refetch: null,
  updateQuery: null,
};

/**
 * Data Submission Context
 *
 * @note Do NOT use this context directly. This is exported for testing purposes only.
 * @see {@link SubmissionCtxState}
 * @see {@link useSubmissionContext}
 */
export const SubmissionContext = createContext<SubmissionCtxState>(null);
SubmissionContext.displayName = "DataSubmissionContext";

/**
 * Hook to use the Data Submission Context
 *
 * @see {@link SubmissionProvider} Must be wrapped in the provider component
 * @see {@link SubmissionCtxState} Context state returned by the hook
 */
export const useSubmissionContext = (): SubmissionCtxState => {
  const context = useContext<SubmissionCtxState>(SubmissionContext);

  if (!context) {
    throw new Error(
      "useSubmissionContext cannot be used outside of the SubmissionProvider component"
    );
  }

  return context;
};

type ProviderProps = {
  /**
   * The Data Submission `_id` to populate the context for
   */
  _id: Submission["_id"];
  children: React.ReactNode;
};

/**
 * Data Submission Provider component
 *
 * @note This component handles Data Submission level business logic
 *  and will automatically start polling for the submission status if
 *  the submission is in a validating state.
 * @see {@link useSubmissionContext} The context hook
 * @returns React Context Provider
 */
export const SubmissionProvider: FC<ProviderProps> = ({ _id, children }: ProviderProps) => {
  const [state, setState] = useState<SubmissionCtxState>(initialState);

  const { data, error, loading, startPolling, stopPolling, refetch, updateQuery } = useQuery<
    GetSubmissionResp,
    GetSubmissionInput
  >(GET_SUBMISSION, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (d) => {
      if (
        d?.getSubmission?.fileValidationStatus !== "Validating" &&
        d?.getSubmission?.metadataValidationStatus !== "Validating" &&
        d?.getSubmission?.crossSubmissionStatus !== "Validating"
      ) {
        stopPolling();
      } else {
        startPolling(1000);
      }
    },
    variables: { id: _id },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (loading) {
      setState({
        ...state,
        status: SubmissionCtxStatus.LOADING,
      });
      return;
    }
    if (error || !data?.getSubmission?._id) {
      setState({
        ...state,
        status: SubmissionCtxStatus.ERROR,
        error,
      });
      return;
    }

    setState({
      status: SubmissionCtxStatus.LOADED,
      data,
      error,
      startPolling,
      stopPolling,
      refetch,
      updateQuery,
    });
  }, [loading, error, data, startPolling, stopPolling, refetch, updateQuery]);

  return <SubmissionContext.Provider value={state}>{children}</SubmissionContext.Provider>;
};
