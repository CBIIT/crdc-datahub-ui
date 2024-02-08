import { useState } from 'react';
import { createStore, applyMiddleware, combineReducers, Store } from 'redux';
import { ddgraph, moduleReducers as submission, versionInfo, getModelExploreData } from 'data-model-navigator';
import ReduxThunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { baseConfiguration, defaultReadMeTitle, graphViewConfig } from '../config/ModelNavigator';
import { buildAssetUrls, buildBaseFilterContainers, buildFilterOptionsList } from '../utils';

export type Status = "waiting" | "loading" | "error" | "success";

const makeStore = (): Store => {
  const reducers = { ddgraph, versionInfo, submission };
  const loggerMiddleware = createLogger();

  const newStore = createStore(combineReducers(reducers), applyMiddleware(ReduxThunk, loggerMiddleware));

  // @ts-ignore
  newStore.injectReducer = (key, reducer) => {
    reducers[key] = reducer;
    newStore.replaceReducer(combineReducers(reducers));
  };

  return newStore;
};

/**
 * A hook to build and populate the Redux store with DMN data
 *
 * @params {void}
 */
const useBuildReduxStore = (): [{ status: Status, store: Store }, () => void, (assets: DataCommon) => void] => {
  const [status, setStatus] = useState<Status>("waiting");
  const [store, setStore] = useState<Store>(makeStore());

  /**
   * Rebuilds the store from scratch
   *
   * @params {void}
   */
  const resetStore = () => {
    setStatus("loading");
    setStore(makeStore());
  };

  /**
   * Injects the Data Model into the store
   *
   * @param datacommon The Data Model to inject assets from
   */
  const populateStore = async (datacommon: DataCommon) => {
    if (!datacommon?.name || !datacommon?.assets || !datacommon?.assets["current-version"] || !datacommon.configuration?.pdfConfig) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const assets = buildAssetUrls(datacommon);
    const response = await getModelExploreData(assets.model, assets.props)?.catch(() => null);
    if (!response?.data || !response?.version) {
      setStatus("error");
      return;
    }

    store.dispatch({ type: 'RECEIVE_VERSION_INFO', data: response.version });

    store.dispatch({
      type: 'REACT_FLOW_GRAPH_DICTIONARY',
      dictionary: response.data,
      pdfDownloadConfig: datacommon.configuration.pdfConfig,
      graphViewConfig
    });

    store.dispatch({
      type: 'RECEIVE_DICTIONARY',
      payload: {
        data: response.data,
        facetfilterConfig: {
          ...baseConfiguration,
          facetSearchData: datacommon.configuration.facetFilterSearchData,
          facetSectionVariables: datacommon.configuration.facetFilterSectionVariables,
          baseFilters: buildBaseFilterContainers(datacommon),
          filterSections: datacommon.configuration.facetFilterSearchData.map((s) => s?.datafield),
          filterOptions: buildFilterOptionsList(datacommon),
        },
        pageConfig: {
          title: datacommon.configuration.pageTitle,
          iconSrc: datacommon.configuration?.titleIconSrc,
        },
        readMeConfig: {
          readMeUrl: assets.readme,
          readMeTitle: datacommon.configuration?.readMeTitle || defaultReadMeTitle,
          allowDownload: false,
        },
        pdfDownloadConfig: datacommon.configuration.pdfConfig,
        loadingExampleConfig: {
          type: 'static',
          url: assets.loading_file,
        },
        graphViewConfig,
      },
    });

    // MVP-2 M2 NOTE: This resets the search history to prevent the data models
    // from overlapping on searches. A future improvement would be to isolate
    // the localStorage history key to the data model based on a config option.
    store.dispatch({ type: 'SEARCH_CLEAR_HISTORY' });

    setStatus("success");
  };

  return [{ status, store }, resetStore, populateStore];
};

export default useBuildReduxStore;
