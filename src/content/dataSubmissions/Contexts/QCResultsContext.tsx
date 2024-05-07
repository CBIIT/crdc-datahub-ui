import React from "react";

const QCResultsContext = React.createContext<{
  submission?: Submission;
  hideDeleteOrphanFileButton?: boolean;
  handleDeleteOrphanFile?: (success: boolean) => void;
  handleOpenErrorDialog?: (data: QCResult) => void;
}>({});

export default QCResultsContext;
