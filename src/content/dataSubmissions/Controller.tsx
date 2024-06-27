import React from "react";
import { useParams } from "react-router-dom";
import DataSubmission from "./DataSubmission";
import ListView from "./DataSubmissionsListView";

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
export default () => {
  const { submissionId, tab } = useParams();

  if (submissionId) {
    return <DataSubmission submissionId={submissionId} tab={tab} />;
  }

  return <ListView />;
};
