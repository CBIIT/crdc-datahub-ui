import React from "react";
import { useParams } from 'react-router-dom';
import NavigatorView from "./NavigatorView";
import ErrorBoundary from '../../components/ErrorBoundary';
import { DataCommonProvider } from '../../components/Contexts/DataCommonContext';

const ModelNavigatorController: React.FC = () => {
  const { dataCommon } = useParams<{ dataCommon: DataCommon["name"] }>();

  return (
    <DataCommonProvider key={dataCommon} DataCommon={dataCommon}>
      <ErrorBoundary errorMessage="Unable to load the Model Navigator for the requested model">
        <NavigatorView />
      </ErrorBoundary>
    </DataCommonProvider>
  );
};

export default ModelNavigatorController;
