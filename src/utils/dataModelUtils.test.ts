import { MODEL_FILE_REPO } from "../config/DataCommons";
import * as utils from "./dataModelUtils";

global.fetch = jest.fn();

jest.mock("../env", () => ({
  ...jest.requireActual("../env"),
  REACT_APP_DEV_TIER: undefined,
}));

describe("fetchManifest cases", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  it("should return manifest from sessionStorage if it exists", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        "model-file": "cds-model.yaml",
        "prop-file": "cds-model-props.yaml",
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        versions: [],
      },
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const manifest = await utils.fetchManifest();

    expect(manifest).toEqual(fakeManifest);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("should fetch manifest from server if it does not exist in sessionStorage", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        "model-file": "cds-model.yaml",
        "prop-file": "cds-model-props.yaml",
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        versions: [],
      },
    };

    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    const manifest = await utils.fetchManifest();

    expect(manifest).toEqual(fakeManifest);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should cache manifest in sessionStorage after fetching", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        "model-file": "cds-model.yaml",
        "prop-file": "cds-model-props.yaml",
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        versions: [],
      },
    };

    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    expect(sessionStorage.getItem("manifest")).toBeNull();

    await utils.fetchManifest();

    const cachedManifest = JSON.parse(sessionStorage.getItem("manifest"));
    expect(cachedManifest).toEqual(fakeManifest);
  });

  it("should throw an error if fetch fails", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("fetch error"))
    );

    await expect(utils.fetchManifest()).rejects.toThrow(
      "Unable to fetch or parse manifest"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // NOTE: We're asserting that JSON.parse does not throw an error here
  it("should throw a controlled error if fetch returns invalid JSON", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.reject(new Error("JSON error")) })
    );

    await expect(utils.fetchManifest()).rejects.toThrow(
      "Unable to fetch or parse manifest"
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should fall back to prod tier if REACT_APP_DEV_TIER is not defined", async () => {
    const fakeManifest = { key: "value" };

    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    await utils.fetchManifest();

    expect(fetch).toHaveBeenCalledWith(`${MODEL_FILE_REPO}prod/content.json`);
  });
});

describe("buildAssetUrls cases", () => {
  it("should build asset URLs using prod tier when REACT_APP_DEV_TIER is not defined", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-file": "model-file",
        "prop-file": "prop-file",
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc);

    expect(result).toEqual({
      model: `${MODEL_FILE_REPO}prod/test-name/1.0/model-file`,
      props: `${MODEL_FILE_REPO}prod/test-name/1.0/prop-file`,
      readme: `${MODEL_FILE_REPO}prod/test-name/1.0/readme-file`,
      loading_file: `${MODEL_FILE_REPO}prod/test-name/1.0/loading-file-zip-name`,
    });
  });

  const readMeValues = ["", null, undefined, false];
  it.each(readMeValues)(
    "should not include a README URL if the filename is %s",
    (readme) => {
      const dc: DataCommon = {
        name: "test-name",
        assets: {
          "current-version": "1.0",
          "model-file": "model-file",
          "prop-file": "prop-file",
          "readme-file": readme,
        } as ManifestAssets,
      } as DataCommon;

      const result = utils.buildAssetUrls(dc);

      expect(result.readme).toEqual(null);
    }
  );

  it("should not throw an exception if dealing with invalid data", () => {
    expect(() => utils.buildAssetUrls(null)).not.toThrow();
    expect(() => utils.buildAssetUrls({} as DataCommon)).not.toThrow();
    expect(() => utils.buildAssetUrls(undefined)).not.toThrow();
  });
});

describe("buildBaseFilterContainers tests", () => {
  it("should return an empty object if dc is null or undefined", () => {
    const result = utils.buildBaseFilterContainers(null);
    expect(result).toEqual({});

    const result2 = utils.buildBaseFilterContainers(undefined);
    expect(result2).toEqual({});
  });

  it("should return an empty object if facetFilterSearchData is not an array or is an empty array", () => {
    const dc: DataCommon = {
      configuration: {
        facetFilterSearchData: null,
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result = utils.buildBaseFilterContainers(dc);
    expect(result).toEqual({});

    const dc2: DataCommon = {
      configuration: {
        facetFilterSearchData: [],
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result2 = utils.buildBaseFilterContainers(dc2);
    expect(result2).toEqual({});
  });

  it("should build filter containers correctly", () => {
    const dc: DataCommon = {
      configuration: {
        facetFilterSearchData: [
          { datafield: "field1" },
          { datafield: "field2" },
          { datafield: null },
        ] as FacetSearchData[],
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result = utils.buildBaseFilterContainers(dc);
    expect(result).toEqual({
      field1: [],
      field2: [],
      base: [],
    });
  });
});

describe("buildFilterOptionsList tests", () => {
  it("should return an empty array if dc is null or undefined", () => {
    const result = utils.buildFilterOptionsList(null);
    expect(result).toEqual([]);

    const result2 = utils.buildFilterOptionsList(undefined);
    expect(result2).toEqual([]);
  });

  it("should return an empty array if facetFilterSearchData is not an array or is an empty array", () => {
    const dc: DataCommon = {
      configuration: {
        facetFilterSearchData: null,
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual([]);

    const dc2: DataCommon = {
      configuration: {
        facetFilterSearchData: [],
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result2 = utils.buildFilterOptionsList(dc2);
    expect(result2).toEqual([]);
  });

  it("should build filter options list correctly", () => {
    const dc: DataCommon = {
      configuration: {
        facetFilterSearchData: [
          { checkboxItems: [{ name: "Item 1" }, { name: "Item 2" }] },
          { checkboxItems: [{ name: "Item 3" }, { name: "Item 4" }] },
          { checkboxItems: null },
        ] as FacetSearchData[],
      } as ModelNavigatorConfig,
    } as DataCommon;

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual(["item 1", "item 2", "item 3", "item 4"]);
  });
});
