import React from "react";
import { useParams } from "react-router-dom";
import DataSubmission from "./DataSubmission";
import ListView from "./DataSubmissionsListView";
import { SubmissionProvider } from "../../components/Contexts/SubmissionContext";

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
      <SubmissionProvider _id={submissionId}>
        <DataSubmission submissionId={submissionId} tab={tab} />
      </SubmissionProvider>
    );
  }

  return <ListView />;
};

export default DataSubmissionController;
