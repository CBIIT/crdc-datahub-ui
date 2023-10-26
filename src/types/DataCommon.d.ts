type DataCommon = {
  /**
   * The user-friendly name of the Data Common.
   *
   * @example "CDS"
   */
  name: string;
  /**
   * The relative-URLs of the Data Common's asset locations
   * stored in the production `/build` folder.
   *
   * Examples of relative-URLs: "/models/cds/1.0.0/model.yaml"
   */
  relative_assets: DataCommonAssets;
  /**
   * The public URLs of the Data Common's asset locations
   * stored in their respective GitHub repositories.
   *
   * These are fetched and stored during the production build process.
   *
   * Examples of public-URLs: "https://raw.githubusercontent.com/..."
   */
  source_assets: DataCommonAssets;
};

type DataCommonAssets = {
  /**
   * The URL of the Data Common's model.
   *
   * @example "/models/cds/1.0.0/model.yaml"
   * @example "https://raw.githubusercontent.com/.../model.yaml"
   */
  model: string;
  /**
   * The URL of the Data Common's model props.
   *
   * @example "/models/cds/1.0.0/model-props.yaml"
   * @example "https://raw.githubusercontent.com/.../model-props.yaml"
   */
  props: string;
  /**
   * The URL of the Data Common's model readme.
   *
   * @example "/models/cds/1.0.0/README.md"
   * @example "https://raw.githubusercontent.com/.../README.md"
   */
  readme: string;
};
