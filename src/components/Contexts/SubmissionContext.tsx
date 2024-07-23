import React, { FC, createContext, useCallback, useContext, useEffect, useState } from "react";
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
   * Whether the query is currently polling
   */
  isPolling: boolean;
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
  isPolling: false,
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
 * @note This provider will automatically start polling if:
 *  - The file, metadata, or cross submission status is "Validating"
 *  - Any batch status is "Uploading"
 * @see {@link useSubmissionContext} The context hook
 * @returns React Context Provider
 */
export const SubmissionProvider: FC<ProviderProps> = ({ _id, children }: ProviderProps) => {
  const [state, setState] = useState<SubmissionCtxState>(initialState);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const {
    data,
    error,
    loading,
    startPolling: startApolloPolling,
    stopPolling: stopApolloPolling,
    refetch,
    updateQuery,
  } = useQuery<GetSubmissionResp, GetSubmissionInput>(GET_SUBMISSION, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (d) => {
      const isValidating =
        d?.getSubmission?.fileValidationStatus === "Validating" ||
        d?.getSubmission?.metadataValidationStatus === "Validating" ||
        d?.getSubmission?.crossSubmissionStatus === "Validating";
      const isDeleting = d?.getSubmission?.deletingData === true;
      const hasUploadingBatches = d?.listBatches?.batches?.some((b) => b.status === "Uploading");

      if (!isValidating && !hasUploadingBatches && !isDeleting) {
        stopApolloPolling();
        setIsPolling(false);
      } else {
        startApolloPolling(1000);
        setIsPolling(true);
      }
    },
    variables: { id: _id },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  /**
   * Wrapper function to start polling for the submission
   */
  const startPolling = useCallback(
    (interval: number) => {
      startApolloPolling(interval);
      setIsPolling(true);
    },
    [startApolloPolling]
  );

  /**
   * Wrapper function to stop polling for the submission
   */
  const stopPolling = useCallback(() => {
    stopApolloPolling();
    setIsPolling(false);
  }, [stopApolloPolling]);

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
      isPolling,
      startPolling,
      stopPolling,
      refetch,
      updateQuery,
    });
  }, [loading, error, data, isPolling, startPolling, stopPolling, refetch, updateQuery]);

  return <SubmissionContext.Provider value={state}>{children}</SubmissionContext.Provider>;
};
