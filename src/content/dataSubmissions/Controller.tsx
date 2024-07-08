import React, { memo } from "react";
import { useParams } from "react-router-dom";
import DataSubmission from "./DataSubmission";
import ListView from "./DataSubmissionsListView";
import { OrganizationProvider } from "../../components/Contexts/OrganizationListContext";
import { SubmissionProvider } from "../../components/Contexts/SubmissionContext";

/**
 * A memoized version of OrganizationProvider
 *
 * @see OrganizationProvider
 */
const MemorizedProvider = memo(OrganizationProvider);

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

  return (
    <MemorizedProvider preload>
      <ListView />
    </MemorizedProvider>
  );
};

export default DataSubmissionController;
