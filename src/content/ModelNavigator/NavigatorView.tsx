import { FC } from "react";
import { Box } from "@mui/material";
// eslint-disable-next-line import/no-extraneous-dependencies -- Required to use legacy version from DMN
import { Provider } from "react-redux";
import { ReduxDataDictionary } from "data-model-navigator";
import SuspenseLoader from "../../components/SuspenseLoader";
import { Status, useDataCommonContext } from "../../components/Contexts/DataCommonContext";
import useBuildReduxStore from "../../hooks/useBuildReduxStore";

type ModelNavigatorProps = {
  /**
   * The version of the model to display
   */
  version: string;
};

/**
 * Encapsulates the Data Model Navigator component
 *
 * This component handles the following:
 * - Loading the Data Common assets
 * - Building the Redux store for the Data Model Navigator
 * - Rendering the Data Model Navigator
 *
 * @returns The Model Navigator view
 */
const ModelNavigator: FC<ModelNavigatorProps> = ({ version = "latest" }) => {
  const { status, DataCommon } = useDataCommonContext();
  const [{ status: buildStatus, store }, , populate] = useBuildReduxStore();

  if (status === Status.LOADING || buildStatus === "loading") {
    return <SuspenseLoader />;
  }

  if (status === Status.LOADED && buildStatus === "waiting") {
    populate(DataCommon, version);
    return <SuspenseLoader />;
  }

  if (!DataCommon || status === Status.ERROR || buildStatus === "error") {
    throw new Error("Oops! Unable to show the requested data model or model version.");
  }

  return (
    <Box sx={{ mt: "40px" }}>
      <Provider store={store}>
        <ReduxDataDictionary pdfDownloadConfig={DataCommon.configuration?.pdfConfig} />
      </Provider>
    </Box>
  );
};

export default ModelNavigator;
