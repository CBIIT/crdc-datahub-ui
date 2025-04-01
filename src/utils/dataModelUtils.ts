import { defaultTo } from "lodash";
import { MODEL_FILE_REPO } from "../config/DataCommons";
import env from "../env";
import { RetrieveCDEsResp } from "../graphql";
import { Logger } from "./logger";

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
 * @param model The Data Model (DataCommon) to build asset URLs for
 * @param modelVersion The version of the Data Model to build asset URLs for
 * @returns ModelAssetUrls
 */
export const buildAssetUrls = (model: DataCommon, modelVersion: string): ModelAssetUrls => {
  const { name, assets } = model || {};
  const version = modelVersion === "latest" ? assets?.["current-version"] : modelVersion;
  const tier = env.REACT_APP_DEV_TIER || "prod";

  return {
    model_files:
      assets?.["model-files"]?.map(
        (file) => `${MODEL_FILE_REPO}${tier}/cache/${name}/${version}/${file}`
      ) || [],
    readme: assets?.["readme-file"]
      ? `${MODEL_FILE_REPO}${tier}/cache/${name}/${version}/${assets?.["readme-file"]}`
      : null,
    loading_file: assets?.["loading-file"]
      ? `${MODEL_FILE_REPO}${tier}/cache/${name}/${version}/${assets?.["loading-file"]}`
      : null,
    navigator_icon: assets?.["model-navigator-logo"]
      ? `${MODEL_FILE_REPO}${tier}/cache/${name}/${version}/${assets?.["model-navigator-logo"]}`
      : "",
    changelog: assets?.["release-notes"]
      ? `${MODEL_FILE_REPO}${tier}/cache/${name}/${version}/${assets?.["release-notes"]}`
      : null,
  };
};

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
  cdeMap: Map<string, CDEInfo>,
  dataList,
  response: RetrieveCDEsResp["retrieveCDEs"] = [],
  apiError = false
) => {
  const responseMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0]> = new Map();

  defaultTo(response, []).forEach((item) =>
    responseMap.set(`${item.CDECode}.${item.CDEVersion}`, item)
  );

  const resultMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0] & { CDEOrigin: string }> =
    new Map();
  const mapKeyPrefixes: Map<string, string> = new Map();
  const mapKeyPrefixesNoValues: Map<string, string> = new Map();

  cdeMap.forEach((val, key) => {
    const [prefix, cdeCodeAndVersion] = key.split(";");
    const item = responseMap.get(cdeCodeAndVersion);

    if (item) {
      resultMap.set(key, { ...item, CDEOrigin: val?.CDEOrigin || "" });
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
  resultMap: Map<string, RetrieveCDEsResp["retrieveCDEs"][0] & { CDEOrigin: string }>,
  mapKeyPrefixes: Map<string, string>,
  mapKeyPrefixesNoValues: Map<string, string>,
  apiError: boolean,
  parentKey = ""
) => {
  const getCDEPublicID = (cdeCode, cdeVersion) =>
    `https://cadsr.cancer.gov/onedata/dmdirect/NIH/NCI/CO/CDEDD?filter=CDEDD.ITEM_ID=${cdeCode}%20and%20ver_nr=${cdeVersion}`;

  if (typeof node !== "object" || node === null) return;

  if (node.properties) {
    for (const key in node.properties) {
      if (Object.hasOwn(node.properties, key)) {
        const fullKey = `${parentKey}.${key}`.replace(/^\./, "");
        const prefixMatch = mapKeyPrefixes.get(fullKey);
        const noValuesMatch = mapKeyPrefixesNoValues.get(fullKey);
        const property = node.properties[key];
        const fallbackMessage = [
          "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
        ];

        if (prefixMatch) {
          const { CDECode, CDEFullName, CDEVersion, CDEOrigin, PermissibleValues } =
            resultMap.get(prefixMatch);

          // Populate CDE details
          property.CDEFullName = CDEFullName;
          property.CDECode = CDECode;
          property.CDEPublicID = getCDEPublicID(CDECode, CDEVersion);
          property.CDEVersion = CDEVersion;
          property.CDEOrigin = CDEOrigin;

          // Populate Permissible Values if available from API
          if (Array.isArray(PermissibleValues) && PermissibleValues.length > 0) {
            property.enum = PermissibleValues;
            // Permissible Values from API are empty, convert property to "string" type
          } else if (
            Array.isArray(PermissibleValues) &&
            PermissibleValues.length === 0 &&
            property.enum
          ) {
            delete property.enum;
            property.type = "string";
          }
        }

        // API did not return any Permissible Values, populate with fallback message
        if (noValuesMatch && property.enum) {
          Logger.error("Unable to match CDE for property", node?.properties?.[key]);
          property.enum = fallbackMessage;
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
