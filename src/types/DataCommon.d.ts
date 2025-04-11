type DataCommon = {
  /**
   * The unique identifier for the Data Common.
   *
   * @note This value should be appear in the models repository as the key for the
   * configuration in the manifest file.
   *
   * If not present, an error will be thrown when trying to load Model Navigator.
   *
   * @todo Rename this to `_id` in the future to align with other identifiers in the system.
   * @see {@link DataCommon.displayName} for the human-readable name.
   */
  name: string;
  /**
   * The display name for the Data Common. This must be used visually in the UI.
   */
  displayName: string;
  /**
   * The Data Common assets.
   *
   * NOTE:
   * - This is loaded dynamically from a CRDC Hub maintained repository
   *   when it's needed.
   */
  assets: ManifestAssets;
  /**
   * The Data Model Navigator configuration. This is used to fine-tune
   * the navigator for a specific Data Common.
   */
  configuration: ModelNavigatorConfig;
};

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
   * An array of strings with an arbitrary length containing the
   * Data Model file names.
   *
   * @example ["cds-model.yaml", "cds-model-props.yaml"]
   * @since 3.1.0
   */
  "model-files": string[];
  /**
   * The file name of the Data Model README file.
   *
   * @example "cds-model-readme.md"
   * @example "README.md"
   */
  "readme-file": string;
  /**
   * The file name of the Data Model release notes file.
   *
   * @example "release-notes.md"
   */
  "release-notes": string;
  /**
   * The relative URL for the Model Navigator logo.
   *
   * @example "model-navigator-logo.png"
   * @since 3.1.0
   */
  "model-navigator-logo"?: string | null;
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
  versions: string[];
};
