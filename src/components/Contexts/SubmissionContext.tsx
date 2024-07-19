import React, { FC, createContext, useCallback, useContext, useMemo, useState } from "react";
import { ApolloError, ApolloQueryResult, useQuery } from "@apollo/client";
import { cloneDeep, isEqual } from "lodash";
import { GetSubmissionResp, GET_SUBMISSION, GetSubmissionInput } from "../../graphql";
import { compareNodeStats } from "../../utils";

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
  POLLING = "POLLING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

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
 * A memoized version of the Submission Provider
 *
 * @note This is to prevent unnecessary re-renders when the context value hasn't changed
 */
const MemoedProvider = React.memo<{ value: SubmissionCtxState; children: React.ReactNode }>(
  ({ value, children }) => (
    <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>
  ),
  isEqual
);

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

  const status: SubmissionCtxStatus = useMemo<SubmissionCtxStatus>(() => {
    if (error || (!loading && !data?.getSubmission?._id)) {
      return SubmissionCtxStatus.ERROR;
    }
    if (isPolling) {
      return SubmissionCtxStatus.POLLING;
    }
    if (loading) {
      return SubmissionCtxStatus.LOADING;
    }

    return SubmissionCtxStatus.LOADED;
  }, [loading, error, data, isPolling]);

  const memoedData: GetSubmissionResp = useMemo<GetSubmissionResp>(() => {
    let sortedStats = [];
    if (data?.submissionStats?.stats && data.submissionStats.stats instanceof Array) {
      sortedStats = cloneDeep(data.submissionStats.stats);
      sortedStats.sort(compareNodeStats);
    }

    return {
      getSubmission: data?.getSubmission,
      submissionStats: { stats: sortedStats },
      listBatches: data?.listBatches,
    };
  }, [data]);

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

  const value: SubmissionCtxState = useMemo<SubmissionCtxState>(
    () => ({
      status,
      data: memoedData,
      error,
      startPolling,
      stopPolling,
      refetch,
      updateQuery,
    }),
    [status, memoedData, error, startPolling, stopPolling, refetch, updateQuery]
  );

  return <MemoedProvider value={value}>{children}</MemoedProvider>;
};
