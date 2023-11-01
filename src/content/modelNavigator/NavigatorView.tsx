import React, { FC } from 'react';
import { Box } from '@mui/material';
import { ReduxDataDictionary } from 'data-model-navigator';
import SuspenseLoader from '../../components/SuspenseLoader';
import { pdfDownloadConfig } from '../../config/ModelNavigator';
import usePopulateModelData from "./utils/usePopulateModelData";

/**
 * Encapsulates the Data Model Navigator component
 *
 * @returns {JSX.Element}
 */
const ModelNavigator: FC = () => {
  const [status] = usePopulateModelData();

  if (status === 'loading') {
    return <SuspenseLoader />;
  }

  if (status === 'error') {
    throw new Error("Data model navigator is not configured");
  }

  return (
    <Box sx={{ mt: "40px", }}>
      <ReduxDataDictionary pdfDownloadConfig={pdfDownloadConfig} />
    </Box>
  );
};

export default ModelNavigator;
