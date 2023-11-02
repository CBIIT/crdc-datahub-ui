type DataCommon = {
  /**
   * The user-friendly name of the Data Common.
   *
   * Note:
   * - This should appear in `DataModelManifest` as the key.
   * - If this does not exist there, an error will be thrown.
   *
   * @example "CDS"
   */
  name: string;
  /**
   * The Data Common assets.
   *
   * NOTE:
   * - This is loaded dynamically from a CRDC Hub maintained repository
   *   when it's needed.
   */
  assets: ManifestAssets;
};

/**
 * The strictly-typed configuration for the Data Model Navigator.
 * This is used to configure the Data Model Navigator for a specific Data Common.
 *
 * @TODO The exact requirements of this type are not yet known.
 */
type DataCommonConfig = null;

/**
 * The Data Commons assets file.
 * This is a JSON file that contains asset details for data models.
 * It is maintained in a CRDC Hub repository.
 */
type DataModelManifest = {
  /**
   * Mapped by Data Common name.
   *
   * @example "CDS": { ... }
   */
  [key: string]: ManifestAssets;
};

/**
 * The type definition for the Data Commons assets file.
 *
 * Imported dynamically from a CRDC Hub maintained repository.
 */
type ManifestAssets = {
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
   * The pre-zipped example loading file.
   *
   * @example "cds-model-loading.zip"
   */
  "loading-file": string;
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
