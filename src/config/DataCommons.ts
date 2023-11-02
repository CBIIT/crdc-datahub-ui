/**
 * The URL of the Data Commons Model Repo
 *
 * Model Data:
 * - `[dev_tier]/[model_name]/[model_version]/`
 *
 * Content Manifest:
 * - `[dev_tier]/content.json`
 */
export const MODEL_FILE_REPO = "https://raw.githubusercontent.com/CBIIT/crdc-datahub-models/";

/**
 * A collection of site-wide supported Data Commons.
 */
export const DataCommons: DataCommon[] = [
  {
    name: "CDS",
    assets: null,
  },
  {
    name: "CCDI",
    assets: null,
  },
];
