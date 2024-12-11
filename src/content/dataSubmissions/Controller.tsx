import React, { memo } from "react";
import { useParams } from "react-router-dom";
import DataSubmission from "./DataSubmission";
import ListView from "./DataSubmissionsListView";
import { SubmissionProvider } from "../../components/Contexts/SubmissionContext";

/**
 * A memoized version of SubmissionProvider
 *
 * @see SubmissionProvider
 */
const MemorizedProvider = memo(SubmissionProvider);

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
const DataSubmissionController = () => {
  const { submissionId, tab } = useParams();

  if (submissionId) {
    return (
      <MemorizedProvider _id={submissionId}>
        <DataSubmission submissionId={submissionId} tab={tab} />
      </MemorizedProvider>
    );
  }

  return <ListView />;
};

export default DataSubmissionController;
