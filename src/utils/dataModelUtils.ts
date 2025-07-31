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
    `${MODEL_FILE_REPO}${env.VITE_DEV_TIER || "prod"}/cache/content.json`
  ).catch(() => null);
  const parsed = await response?.json().catch(() => null);
  if (response && parsed) {
    sessionStorage.setItem("manifest", JSON.stringify(parsed));
    return parsed;
  }

  throw new Error("Unable to fetch or parse manifest");
};

/**
 * List the available Data Model versions for a given Data Model
 *
 * @param model The Data Model (DataCommon) to list versions for (e.g. "CDS")
 * @returns An array of version strings or empty if none are found
 */
export const listAvailableModelVersions = async (model: string): Promise<string[]> => {
  try {
    const manifest = await fetchManifest();
    if (!manifest || !manifest[model]) {
      throw new Error(`Unable to find manifest for ${model}`);
    }

    const { versions } = manifest[model];
    if (!Array.isArray(versions) || versions.length === 0) {
      throw new Error(`No versions found for ${model}`);
    }

    return versions;
  } catch (e) {
    Logger.error("listDataModelVersions: An exception was thrown", e);
  }

  return [];
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
  const tier = env.VITE_DEV_TIER || "prod";

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
 * @param config The Data Model Navigator configuration to build the base filters from
 * @returns An array of base filters used by Data Model Navigator
 */
export const buildBaseFilterContainers = (config: ModelNavigatorConfig): { [key: string]: [] } => {
  if (!config || !config?.facetFilterSearchData) {
    return {};
  }
  if (!Array.isArray(config.facetFilterSearchData) || config.facetFilterSearchData.length === 0) {
    return {};
  }

  return config.facetFilterSearchData.reduce(
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
 * @param config The data common to build the filter options list for
 * @returns An array of filter options used by Data Model Navigator
 */
export const buildFilterOptionsList = (config: ModelNavigatorConfig): string[] => {
  if (!config || !config?.facetFilterSearchData) {
    return [];
  }
  if (!Array.isArray(config.facetFilterSearchData) || config.facetFilterSearchData.length === 0) {
    return [];
  }

  return config.facetFilterSearchData.reduce((a, searchData) => {
    if (!Array.isArray(searchData?.checkboxItems) || searchData.checkboxItems.length === 0) {
      return a;
    }

    return [...a, ...searchData.checkboxItems.map((item) => item?.name?.toLowerCase())];
  }, []);
};

/**
 * A utility to mutate the dictionary by removing invalid CDEs.
 * It will traverse the node's properties and remove any invalid CDEs (`Term`).
 *
 * @param dictionary the MDF dictionary to mutate
 * @returns Nothing, the dictionary is mutated in place
 */
export const deleteInvalidCDEs = (dictionary: MDFDictionary): void => {
  if (!dictionary || Object.keys(dictionary).length === 0) {
    return;
  }

  for (const node in dictionary) {
    if (Object.hasOwn(dictionary, node) && dictionary[node].properties) {
      for (const property in dictionary[node].properties) {
        if (Object.hasOwn(dictionary[node].properties, property)) {
          const terms = dictionary[node].properties[property].Term;
          terms?.forEach((term, index) => {
            if (term?.Origin?.toLowerCase()?.indexOf("cadsr") === -1) {
              terms.splice(index, 1);
            }
          });
        }
      }
    }
  }
};

/**
 * A utility to populate CDE data into the dictionary.
 *
 * Key details on handling:
 * 1. Updates the Value field (CDE Name)
 * 2. Updates the property enum
 * 3. Updates the property type
 *
 * @param dictionary the MDF dictionary to populate with data
 * @param data the API response data
 */
export const populateCDEData = (
  dictionary: MDFDictionary,
  data: RetrieveCDEsResp["retrieveCDEs"]
): void => {
  if (!dictionary || Object.keys(dictionary).length === 0) {
    return;
  }

  for (const node in dictionary) {
    if (Object.hasOwn(dictionary, node) && dictionary[node].properties) {
      for (const property in dictionary[node].properties) {
        if (Object.hasOwn(dictionary[node].properties, property)) {
          const prop = dictionary[node].properties[property];
          prop.Term?.forEach((term) => {
            const apiData = data.find(
              (c) => c.CDECode === term.Code && c.CDEVersion === term.Version
            );
            if (apiData) {
              // Update CDE Name
              term.Value = apiData.CDEFullName;

              // Populate Permissible Values if available from API
              if (
                Array.isArray(apiData.PermissibleValues) &&
                apiData.PermissibleValues.length > 0
              ) {
                dictionary[node].properties[property].enum = apiData.PermissibleValues;
                // Permissible Values from API are empty, convert property to "string" type
              } else if (
                Array.isArray(apiData.PermissibleValues) &&
                apiData.PermissibleValues.length === 0 &&
                dictionary[node].properties[property].enum
              ) {
                delete dictionary[node].properties[property].enum;
                dictionary[node].properties[property].type = "string";
              }
            } else if (!apiData && prop.enum) {
              Logger.error("dataModelUtils: Unable to match CDE for property", property, term);
              prop.enum = [
                "Permissible values are currently not available. Please contact the CRDC Submission Portal HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
              ];
            }
          });
        }
      }
    }
  }
};

/**
 * A utility to extract all unique CDEs from the MDF dictionary.
 *
 * @param dictionary the MDF dictionary to extract CDEs from
 * @return An array of objects containing the CDE Code/Version/Origin
 */
export const extractAllCDEs = (dictionary: MDFDictionary): CDEInfo[] => {
  if (!dictionary || Object.keys(dictionary).length === 0) {
    return [];
  }

  const result = new Set<string>();
  for (const node in dictionary) {
    if (Object.hasOwn(dictionary, node) && dictionary[node].properties) {
      for (const property in dictionary[node].properties) {
        if (Object.hasOwn(dictionary[node].properties, property)) {
          dictionary[node].properties[property].Term?.forEach((term) => {
            result.add(`${term.Code};${term.Version};${term.Origin}`);
          });
        }
      }
    }
  }

  return Array.from(result)
    .map((c) => c.split(";"))
    .map(([CDECode, CDEVersion, CDEOrigin]) => ({ CDECode, CDEVersion, CDEOrigin }));
};
