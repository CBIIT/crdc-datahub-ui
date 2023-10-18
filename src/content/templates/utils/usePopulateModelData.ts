import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getModelExploreData } from 'data-model-navigator';
import {
  DATA_MODEL, DATA_MODEL_PROPS, DATA_MODEL_README,
  filterConfig, graphViewConfig, pdfDownloadConfig, readMeConfig,
} from '../../../config/ModelNavigator';

export type Status = "loading" | "error" | "success";

/**
 * A hook to populate the Redux store with DMN data
 *
 * @params {void}
 * @returns {Status} - the status of the hook
 */
const usePopulateModelData = (): [Status] => {
  const [status, setStatus] = useState<Status>("loading");
  const dispatch = useDispatch();

  useEffect(() => {
    if (!DATA_MODEL || !DATA_MODEL_PROPS || !DATA_MODEL_README) {
      setStatus("error");
    }

    (async () => {
      const response = await getModelExploreData(DATA_MODEL, DATA_MODEL_PROPS);

      if (!response?.data || !response?.version) {
        setStatus("error");
        return;
      }

      dispatch({
        type: 'REACT_FLOW_GRAPH_DICTIONARY',
        dictionary: response.data,
        pdfDownloadConfig,
        graphViewConfig,
      });

      dispatch({
        type: 'RECEIVE_DICTIONARY',
        payload: {
          data: response.data,
          facetfilterConfig: filterConfig,
          readMeConfig,
          pdfDownloadConfig,
          graphViewConfig,
        },
      });

      dispatch({ type: 'RECEIVE_VERSION_INFO', data: response.version });

      setStatus("success");
    })();
  }, []);

  return [status];
};

export default usePopulateModelData;
