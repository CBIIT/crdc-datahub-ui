import React from "react";

const QCResultsContext = React.createContext<{
  handleOpenErrorDialog?: (data: QCResult) => void;
}>({});

export default QCResultsContext;
