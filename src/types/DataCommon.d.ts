type DataCommon = {
  /**
   * The user-friendly name of the Data Common.
   * This is also used to retrieve asset URLs from DataCommonAssets.
   *
   * @example "CDS"
   */
  name: string;
  /**
   * The route of the Data Model Navigator.
   *
   * No leading or trailing slashes.
   *
   * @example "cds-model"
   */
  route: string;
  /**
   * The Data Model Navigator configuration for the Data Common.
   */
  config: DataCommonConfig;
};

/**
 * The strictly-typed configuration for the Data Model Navigator.
 *
 * @TODO The exact requirements of this type are not yet known.
 */
type DataCommonConfig = null;

/**
 * The Data Commons assets file.
 * This is a JSON file that contains asset details for data models.
 * It is maintained in a CRDC Hub repository.
 *
 * @see TODO
 */
type DataCommonAssets = {
  [key in DataCommon["name"]]: DataCommonAsset;
};

/**
 * The type definition for the Data Commons assets file.
 *
 * Imported dynamically from a CRDC Hub maintained repository.
 */
type DataCommonAsset = {
  /**
   * The file name of the Data Model file.
   *
   * @example "cds-model.yaml"
   */
  "model-file": string;
  /**
   * The file name of the Data Model properties file.
   *
   * @example "cds-model-props.yaml"
   */
  "prop-file": string;
  /**
   * The file name of the Data Model README file.
   *
   * @example "cds-model-readme.md"
   * @example "README.md"
   */
  "readme-file": string;
  /**
   * The most-recent version of the Data Model to import
   *
   * @example "1.0"
   */
  "current-version": string | number;
  /**
   * The full list of Data Model versions.
   * Includes the most-recent version as well.
   *
   * @example ["1.0", "1.1", "1.3"]
   */
  "versions": string[] | number[];
};
