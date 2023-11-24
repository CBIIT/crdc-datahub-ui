import React from 'react';

const QCResultsContext = React.createContext<{
    handleOpenErrorDialog?:(id: string) => void;
}>({});

export default QCResultsContext;
