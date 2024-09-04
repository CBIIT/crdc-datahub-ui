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
// import { useLazyQuery } from "@apollo/client";
import { baseConfiguration, defaultReadMeTitle, graphViewConfig } from "../config/ModelNavigator";
import { buildAssetUrls, buildBaseFilterContainers, buildFilterOptionsList } from "../utils";
// import { LIST_INSTITUTIONS, ListInstitutionsResp } from "../graphql";

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
 * A function to parse the datalist and reolace enums with those returned from retrieveCde query
 * Commented out until api is ready
 * @params {void}
 */
/* const updateEnums = (cdeMap, dataList, response = []) => {
  // const values = Array.from(cdeMap.values());

  const responseMap = new Map();

  defaultTo(response, []).forEach((item) =>
    responseMap.set(`${item.CDECode}.${item.CDEVersion}`, item)
  );

  const resultMap = new Map();

  cdeMap.forEach((_, key) => {
    const [, cdeCodeAndVersion] = key.split(";");
    const item = responseMap.get(cdeCodeAndVersion);

    if (item) {
      resultMap.set(key, item);
    }
  });

  const newObj = JSON.parse(JSON.stringify(dataList));

  const mapKeyPrefixes = new Map();
  for (const mapKey of resultMap.keys()) {
    const prefix = mapKey.split(";")[0];
    mapKeyPrefixes.set(prefix, mapKey);
  }

  function traverseAndReplace(node, parentKey = "") {
    if (typeof node !== "object" || node === null) {
      return;
    }

    if (node.properties) {
      for (const key in node.properties) {
        if (Object.hasOwn(node.properties, key)) {
          const fullKey = `${parentKey}.${key}`.replace(/^\./, "");
          if (mapKeyPrefixes.has(fullKey)) {
            const mapFullKey = mapKeyPrefixes.get(fullKey);
            const mapData = resultMap.get(mapFullKey);

            if (mapData && mapData.permissibleValues && mapData.permissibleValues.length > 0) {
              node.properties[key].enum = mapData.permissibleValues;
            } else {
              node.properties[key].enum = [
                "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
              ];
            }
          } else if (
            !Object.hasOwn(node.properties[key], "enum") ||
            node.properties[key].enum.length === 0
          ) {
            node.properties[key].enum = [
              "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
            ];
          }
        }
      }
    }

    for (const subKey in node) {
      if (Object.hasOwn(node, subKey)) {
        traverseAndReplace(node[subKey], `${parentKey}.${subKey}`);
      }
    }
  }

  traverseAndReplace(newObj);

  return newObj;
}; */

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

  // will call retrieveCDEs here
  /* const [getInstituitions, { data, loading, error }] = useLazyQuery<ListInstitutionsResp>(
    LIST_INSTITUTIONS,
    {
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  ); */

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
    const response = await getModelExploreData(assets.model, assets.props)?.catch((e) => {
      console.error(e);
      return null;
    });
    if (!response?.data || !response?.version) {
      setStatus("error");
      return;
    }

    // let dictionary;
    /* if (response.cdeMap) {
      const deets = await getInstituitions();]]
      if (deets?.data) {
        dictionary = updateEnums(response?.cdeMap, response.data, []);
      }
    } else {
      dictionary = response.data;
    } */
    const dictionary = response.data;

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
          iconSrc: datacommon.configuration?.titleIconSrc,
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
