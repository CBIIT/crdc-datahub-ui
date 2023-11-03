import React, { FC, useEffect } from 'react';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import { ReduxDataDictionary } from 'data-model-navigator';
import SuspenseLoader from '../../components/SuspenseLoader';
import { Status, useDataCommonContext } from '../../components/Contexts/DataCommonContext';
import useBuildReduxStore from './utils/useBuildReduxStore';

/**
 * Encapsulates the Data Model Navigator component
 *
 * This component handles the following:
 * - Loading the Data Common assets
 * - Building the Redux store for the Data Model Navigator
 * - Rendering the Data Model Navigator
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
    throw new Error("Unable to build Model Navigator for the selected Data Common");
  }

  return (
    <Box sx={{ mt: "40px", }}>
      <Provider store={store}>
        <ReduxDataDictionary pdfDownloadConfig={DataCommon.configuration.pdfConfig} />
      </Provider>
    </Box>
  );
};

export default ModelNavigator;
