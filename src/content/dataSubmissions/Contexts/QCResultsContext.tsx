import React from "react";

const QCResultsContext = React.createContext<{
  handleOpenErrorDialog?: (data: QCResult) => void;
  handleExpandClick?: (issue: Issue) => void;
}>({});

export default QCResultsContext;
