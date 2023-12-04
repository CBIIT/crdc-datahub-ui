import React from 'react';

const BatchTableContext = React.createContext<{
    handleOpenErrorDialog?:(id: string) => void;
}>({});

export default BatchTableContext;
