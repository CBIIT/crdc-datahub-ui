import React from "react";
import { useParams } from "react-router-dom";
import DataSubmission from "./DataSubmission";
import ListView from "./DataSubmissionsListView";
import { OrganizationProvider } from "../../components/Contexts/OrganizationListContext";

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
const DataSubmissionController = () => {
  const { submissionId, tab } = useParams();

  if (submissionId) {
    return <DataSubmission submissionId={submissionId} tab={tab} />;
  }

  return (
    <OrganizationProvider preload>
      <ListView />
    </OrganizationProvider>
  );
};

export default DataSubmissionController;
