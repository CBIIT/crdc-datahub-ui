import { useState } from "react";
import { createStore, applyMiddleware, combineReducers, Store } from "redux";
import {
  ddgraph,
  moduleReducers as submission,
  versionInfo,
  getModelExploreData,
} from "data-model-navigator";
import ReduxThunk from "redux-thunk";
import { createLogger } from "redux-logger";
import { useLazyQuery } from "@apollo/client";
import { defaultTo } from "lodash";
import { baseConfiguration, defaultReadMeTitle, graphViewConfig } from "../config/ModelNavigator";
import {
  buildAssetUrls,
  buildBaseFilterContainers,
  buildFilterOptionsList,
  updateEnums,
  Logger,
} from "../utils";
import { RETRIEVE_CDEs, RetrieveCDEsInput, RetrieveCDEsResp } from "../graphql";

export type Status = "waiting" | "loading" | "error" | "success";

const makeStore = (): Store => {
  const reducers = { ddgraph, versionInfo, submission };
  const loggerMiddleware = createLogger();

  const newStore = createStore(
    combineReducers(reducers),
    applyMiddleware(ReduxThunk, loggerMiddleware)
  );

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
const useBuildReduxStore = (): [
  { status: Status; store: Store },
  () => void,
  (assets: DataCommon) => void,
] => {
  const [status, setStatus] = useState<Status>("waiting");
  const [store, setStore] = useState<Store>(makeStore());

  const [retrieveCDEs, { error: retrieveCDEsError }] = useLazyQuery<
    RetrieveCDEsResp,
    RetrieveCDEsInput
  >(RETRIEVE_CDEs, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

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
    if (
      !datacommon?.name ||
      !datacommon?.assets ||
      !datacommon?.assets["current-version"] ||
      !datacommon.configuration?.pdfConfig
    ) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    const assets = buildAssetUrls(datacommon);

    // TODO: This is a very temporary work-around until DMN supports N != 2 files
    const modelFile = assets.model_files[0];
    const propFile = assets.model_files.length > 1 ? assets.model_files[1] : assets.model_files[0];

    const response = await getModelExploreData(modelFile, propFile)?.catch((e) => {
      Logger.error(e);
      return null;
    });
    if (!response?.data || !response?.version) {
      setStatus("error");
      return;
    }

    let dictionary;
    const { cdeMap, data: dataList } = response;

    if (cdeMap) {
      const cdeInfo: CDEInfo[] = Array.from(response.cdeMap.values());
      try {
        const CDEs = await retrieveCDEs({
          variables: {
            cdeInfo,
          },
        });

        if (retrieveCDEsError) {
          dictionary = updateEnums(cdeMap, dataList, [], true);
        } else {
          const retrievedCDEs = defaultTo(CDEs.data.retrieveCDEs, []);
          dictionary = updateEnums(cdeMap, dataList, retrievedCDEs);
        }
      } catch (error) {
        dictionary = updateEnums(cdeMap, dataList, [], true);
      }
    } else {
      dictionary = dataList;
    }

    store.dispatch({ type: "RECEIVE_VERSION_INFO", data: response.version });

    store.dispatch({
      type: "REACT_FLOW_GRAPH_DICTIONARY",
      dictionary,
      pdfDownloadConfig: datacommon.configuration.pdfConfig,
      graphViewConfig,
    });

    store.dispatch({
      type: "RECEIVE_DICTIONARY",
      payload: {
        data: dictionary,
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
          iconSrc: assets.navigator_icon,
        },
        readMeConfig: {
          readMeUrl: assets.readme,
          readMeTitle: datacommon.configuration?.readMeTitle || defaultReadMeTitle,
          allowDownload: false,
        },
        pdfDownloadConfig: datacommon.configuration.pdfConfig,
        loadingExampleConfig: {
          type: "static",
          url: assets.loading_file,
        },
        graphViewConfig,
      },
    });

    // MVP-2 M2 NOTE: This resets the search history to prevent the data models
    // from overlapping on searches. A future improvement would be to isolate
    // the localStorage history key to the data model based on a config option.
    store.dispatch({ type: "SEARCH_CLEAR_HISTORY" });

    setStatus("success");
  };

  return [{ status, store }, resetStore, populateStore];
};

export default useBuildReduxStore;
