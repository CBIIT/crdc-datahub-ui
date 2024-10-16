import { defaultTo } from "lodash";
import { MODEL_FILE_REPO } from "../config/DataCommons";
import env from "../env";
import { RetrieveCDEsResp } from "../graphql";
import GenericModelLogo from "../assets/modelNavigator/genericLogo.png";

/**
 * Fetch the tracked Data Model content manifest.
 *
 * @returns The parsed content manifest.
 * @throws An error if the manifest cannot be fetched.
 */
export const fetchManifest = async (): Promise<DataModelManifest> => {
  if (sessionStorage.getItem("manifest")) {
    return JSON.parse(sessionStorage.getItem("manifest"));
  }

  const response = await fetch(
    `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/content.json`
  ).catch(() => null);
  const parsed = await response?.json().catch(() => null);
  if (response && parsed) {
    sessionStorage.setItem("manifest", JSON.stringify(parsed));
    return parsed;
  }

  throw new Error("Unable to fetch or parse manifest");
};

/**
 * Builds the asset URLs for the Data Model Navigator to import from
 *
 * @param dc The data common to build the asset URLs for
 * @returns ModelAssetUrls
 */
export const buildAssetUrls = (dc: DataCommon): ModelAssetUrls => ({
  model: `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/${dc?.name}/${dc?.assets?.[
    "current-version"
  ]}/${dc?.assets?.["model-file"]}`,
  props: `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/${dc?.name}/${dc?.assets?.[
    "current-version"
  ]}/${dc?.assets?.["prop-file"]}`,
  readme: dc?.assets?.["readme-file"]
    ? `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/${dc?.name}/${dc?.assets?.[
        "current-version"
      ]}/${dc?.assets?.["readme-file"]}`
    : null,
  loading_file: dc?.assets?.["loading-file"]
    ? `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/${dc?.name}/${dc?.assets?.[
        "current-version"
      ]}/${dc?.assets?.["loading-file"]}`
    : null,
  navigator_icon: dc?.assets?.["model-navigator-logo"]
    ? `${MODEL_FILE_REPO}${env.REACT_APP_DEV_TIER || "prod"}/cache/${dc?.name}/${dc?.assets?.[
        "current-version"
      ]}/${dc?.assets?.["model-navigator-logo"]}`
    : GenericModelLogo,
});

/**
 * Helper function to SAFELY build a set of base filter containers for the Data Model Navigator
 *
 * @example { category: [], uiDisplay: [], ... }
 * @param dc The data common to build the base filters for
 * @returns An array of base filters used by Data Model Navigator
 */
export const buildBaseFilterContainers = (dc: DataCommon): { [key: string]: [] } => {
  if (!dc || !dc?.configuration?.facetFilterSearchData) {
    return {};
  }
  if (
    !Array.isArray(dc.configuration.facetFilterSearchData) ||
    dc.configuration.facetFilterSearchData.length === 0
  ) {
    return {};
  }

  return dc.configuration.facetFilterSearchData.reduce(
    (o, searchData) => ({
      ...o,
      [searchData?.datafield || "base"]: [],
    }),
    {}
  );
};

/**
 * Helper function to build an array of possible filter options for the Data Model Navigator
 *
 * @example [ 'administrative', 'case', ... ]
 * @param dc The data common to build the filter options list for
 * @returns An array of filter options used by Data Model Navigator
 */
export const buildFilterOptionsList = (dc: DataCommon): string[] => {
  if (!dc || !dc?.configuration?.facetFilterSearchData) {
    return [];
  }
  if (
    !Array.isArray(dc.configuration.facetFilterSearchData) ||
    dc.configuration.facetFilterSearchData.length === 0
  ) {
    return [];
  }

  return dc.configuration.facetFilterSearchData.reduce((a, searchData) => {
    if (!Array.isArray(searchData?.checkboxItems) || searchData.checkboxItems.length === 0) {
      return a;
    }

    return [...a, ...searchData.checkboxItems.map((item) => item?.name?.toLowerCase())];
  }, []);
};

/**
 * A function to parse the datalist and reolace enums with those returned from retrieveCde query
 * Commented out until api is ready
 * @params {void}
 */
export const updateEnums = (
  cdeMap: Map<string, CDEInfo[]>,
  dataList,
  response: RetrieveCDEsResp["retrieveCDEs"] = [],
  apiError = false
) => {
  const responseMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0]> = new Map();

  defaultTo(response, []).forEach((item) =>
    responseMap.set(`${item.CDECode}.${item.CDEVersion}`, item)
  );

  const resultMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0]> = new Map();
  const mapKeyPrefixes: Map<string, string> = new Map();
  const mapKeyPrefixesNoValues: Map<string, string> = new Map();

  cdeMap.forEach((_, key) => {
    const [prefix, cdeCodeAndVersion] = key.split(";");
    const item = responseMap.get(cdeCodeAndVersion);

    if (item) {
      resultMap.set(key, item);
      mapKeyPrefixes.set(prefix, key);
    } else {
      mapKeyPrefixesNoValues.set(prefix, key);
    }
  });

  const newObj = JSON.parse(JSON.stringify(dataList));

  traverseAndReplace(newObj, resultMap, mapKeyPrefixes, mapKeyPrefixesNoValues, apiError);

  return newObj;
};

export const traverseAndReplace = (
  node,
  resultMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0]>,
  mapKeyPrefixes: Map<string, string>,
  mapKeyPrefixesNoValues: Map<string, string>,
  apiError: boolean,
  parentKey = ""
) => {
  if (typeof node !== "object" || node === null) return;

  if (node.properties) {
    for (const key in node.properties) {
      if (Object.hasOwn(node.properties, key)) {
        const fullKey = `${parentKey}.${key}`.replace(/^\./, "");
        const prefixMatch = mapKeyPrefixes.get(fullKey);
        const noValuesMatch = mapKeyPrefixesNoValues.get(fullKey);
        const fallbackMessage = [
          "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
        ];

        if (prefixMatch) {
          const resultMapEntry = resultMap.get(prefixMatch);

          if (resultMapEntry?.PermissibleValues?.length && node.properties[key].enum) {
            node.properties[key].enum = resultMapEntry.PermissibleValues;
          } else if (resultMapEntry?.PermissibleValues?.length === 0 && node.properties[key].enum) {
            node.properties[key].enum = fallbackMessage;
          }
        }

        if (noValuesMatch && apiError && node.properties[key].enum) {
          node.properties[key].enum = fallbackMessage;
        }
      }
    }
  }

  for (const subKey in node) {
    if (Object.hasOwn(node, subKey)) {
      traverseAndReplace(
        node[subKey],
        resultMap,
        mapKeyPrefixes,
        mapKeyPrefixesNoValues,
        apiError,
        `${parentKey}.${subKey}`
      );
    }
  }
};
