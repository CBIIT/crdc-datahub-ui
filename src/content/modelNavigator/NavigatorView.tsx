import React, { FC, useEffect } from 'react';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import { ReduxDataDictionary } from 'data-model-navigator';
import SuspenseLoader from '../../components/SuspenseLoader';
import { pdfDownloadConfig } from '../../config/ModelNavigator';
import { Status, useDataCommonContext } from '../../components/Contexts/DataCommonContext';
import useBuildReduxStore from './utils/useBuildReduxStore';

/**
 * Encapsulates the Data Model Navigator component
 *
 * @returns {JSX.Element}
 */
const ModelNavigator: FC = () => {
  const { status, DataCommon } = useDataCommonContext();
  const [{ status: buildStatus, store },, populate] = useBuildReduxStore();

  useEffect(() => {
    if (status !== Status.LOADED) {
      return;
    }

    populate(DataCommon);
  }, [DataCommon, status]);

  if (status === Status.LOADING || buildStatus === "loading") {
    return <SuspenseLoader />;
  }

  if (status === Status.ERROR || buildStatus === "error") {
    throw new Error("Data model navigator is not configured");
  }

  return (
    <Box sx={{ mt: "40px", }}>
      <Provider store={store}>
        <ReduxDataDictionary pdfDownloadConfig={pdfDownloadConfig} />
      </Provider>
    </Box>
  );
};

export default ModelNavigator;
