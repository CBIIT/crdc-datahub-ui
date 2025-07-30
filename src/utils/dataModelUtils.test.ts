import { Mock } from "vitest";

import { dataCommonFactory } from "@/factories/data-common/DataCommonFactory";
import { manifestAssetsFactory } from "@/factories/data-common/ManifestAssetsFactory";
import { modelNavigatorConfigFactory } from "@/factories/data-common/ModelNavigatorConfigFactory";

import { MODEL_FILE_REPO } from "../config/DataCommons";

import * as utils from "./dataModelUtils";

global.fetch = vi.fn();

vi.mock(import("../env"), async (importOriginal) => {
  const mod = await importOriginal();

  return {
    default: {
      ...mod.default,
      VITE_DEV_TIER: undefined,
    },
  };
});

describe("fetchManifest cases", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  it("should return manifest from sessionStorage if it exists", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        "model-files": ["cds-model.yaml", "cds-model-props.yaml"],
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        "release-notes": "release-notes.md",
        "model-navigator-config": null,
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
        "model-files": ["cds-model.yaml", "cds-model-props.yaml"],
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        "release-notes": "release-notes.md",
        "model-navigator-config": null,
        versions: [],
      },
    };

    (fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    const manifest = await utils.fetchManifest();

    expect(manifest).toEqual(fakeManifest);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should cache manifest in sessionStorage after fetching", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        "model-files": ["cds-model.yaml", "cds-model-props.yaml"],
        "readme-file": "cds-model-readme.md",
        "loading-file": "cds-loading.zip",
        "current-version": "1.0",
        "release-notes": "release-notes.md",
        "model-navigator-config": null,
        versions: [],
      },
    };

    (fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    expect(sessionStorage.getItem("manifest")).toBeNull();

    await utils.fetchManifest();

    const cachedManifest = JSON.parse(sessionStorage.getItem("manifest"));
    expect(cachedManifest).toEqual(fakeManifest);
  });

  it("should throw an error if fetch fails", async () => {
    (fetch as Mock).mockImplementationOnce(() => Promise.reject(new Error("fetch error")));

    await expect(utils.fetchManifest()).rejects.toThrow("Unable to fetch or parse manifest");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // NOTE: We're asserting that JSON.parse does not throw an error here
  it("should throw a controlled error if fetch returns invalid JSON", async () => {
    (fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.reject(new Error("JSON error")) })
    );

    await expect(utils.fetchManifest()).rejects.toThrow("Unable to fetch or parse manifest");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should fall back to prod tier if VITE_DEV_TIER is not defined", async () => {
    const fakeManifest = { key: "value" };

    (fetch as Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    await utils.fetchManifest();

    expect(fetch).toHaveBeenCalledWith(`${MODEL_FILE_REPO}prod/cache/content.json`);
  });
});

describe("listAvailableModelVersions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  it("should return available model versions", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: manifestAssetsFactory.build({
        versions: ["XXX", "1.0", "2.0", "3.0"],
      }),
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual(["XXX", "1.0", "2.0", "3.0"]);
  });

  it("should catch fetchManifest exception and return empty array", async () => {
    (fetch as Mock).mockImplementationOnce(() => Promise.reject(new Error("fetch error")));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return an empty array if the model is not found in the manifest", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: manifestAssetsFactory.build({
        versions: ["mock-version"],
      }),
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("this-model-does-not-exist");

    expect(versions).toEqual([]);
  });

  it("should return an empty array if no versions are found (empty)", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: manifestAssetsFactory.build({
        versions: [],
      }),
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual([]);
  });

  it("should return an empty array if no versions are found (non-array)", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: manifestAssetsFactory.build({
        versions: null,
      }),
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual([]);
  });
});

describe("buildAssetUrls cases", () => {
  it("should build asset URLs using prod tier when VITE_DEV_TIER is not defined", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "release-notes": "release-notes.md",
      }),
      displayName: null,
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result).toEqual({
      model_files: [
        `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
        `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
      ],
      readme: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/readme-file`,
      loading_file: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/loading-file-zip-name`,
      navigator_icon: expect.any(String),
      changelog: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/release-notes.md`,
    });
  });

  it("should include every model file in the model_files array", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file", "other-file", "fourth-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.model_files).toEqual([
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/other-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/fourth-file`,
    ]);
  });

  it("should handle empty model-files array", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": [],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.model_files).toEqual([]);
  });

  const readMeValues = ["", null, undefined, false];
  it.each(readMeValues)("should not include a README URL if the filename is %s", (readme) => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": readme as unknown as string,
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.readme).toEqual(null);
  });

  it("should use an empty string if model-navigator-logo is not defined", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        // "model-navigator-logo" - not defined, aka no logo
        "model-navigator-logo": undefined,
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.navigator_icon).toEqual("");
  });

  it("should use an empty string if the model-navigator-logo is an empty string", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "model-navigator-logo": "", // empty string - aka no logo
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.navigator_icon).toEqual("");
  });

  it("should use model-navigator-logo if provided in the content manifest", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "model-navigator-logo": "custom-logo.png", // defined - must exist
      }),
    });

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.navigator_icon).toEqual(
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/custom-logo.png`
    );
  });

  it("should not throw an exception if dealing with invalid data", () => {
    expect(() => utils.buildAssetUrls(null, "latest")).not.toThrow();
    expect(() => utils.buildAssetUrls({} as DataCommon, "latest")).not.toThrow();
    expect(() => utils.buildAssetUrls(undefined, "latest")).not.toThrow();
  });

  it("should not throw an exception if `model_files` is not defined", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      }),
    });

    expect(() => utils.buildAssetUrls(dc, "latest")).not.toThrow();
    expect(utils.buildAssetUrls(dc, "latest")).toEqual(
      expect.objectContaining({ model_files: [] })
    );
  });

  it("should use the provided modelVersion if it is not 'latest'", () => {
    const dc: DataCommon = dataCommonFactory.build({
      name: "test-name",
      assets: manifestAssetsFactory.build({
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      }),
    });

    const result = utils.buildAssetUrls(dc, "2.1");
    expect(result.model_files).toEqual([
      `${MODEL_FILE_REPO}prod/cache/test-name/2.1/model-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/2.1/prop-file`,
    ]);

    const result2 = utils.buildAssetUrls(dc, "1.0");
    expect(result2.model_files).toEqual([
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
    ]);

    const result3 = utils.buildAssetUrls(dc, "latest");
    expect(result3.model_files).toEqual([
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
    ]);
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
    const dc: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: null,
    });

    const result = utils.buildBaseFilterContainers(dc);
    expect(result).toEqual({});

    const dc2: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: [],
    });

    const result2 = utils.buildBaseFilterContainers(dc2);
    expect(result2).toEqual({});
  });

  it("should build filter containers correctly", () => {
    const dc: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: [
        { datafield: "field1" },
        { datafield: "field2" },
        { datafield: null },
      ] as FacetSearchData[],
    });

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
    const dc: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: null,
    });

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual([]);

    const dc2: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: [],
    });

    const result2 = utils.buildFilterOptionsList(dc2);
    expect(result2).toEqual([]);
  });

  it("should build filter options list correctly", () => {
    const dc: ModelNavigatorConfig = modelNavigatorConfigFactory.build({
      facetFilterSearchData: [
        { checkboxItems: [{ name: "Item 1" }, { name: "Item 2" }] },
        { checkboxItems: [{ name: "Item 3" }, { name: "Item 4" }] },
        { checkboxItems: null },
      ] as FacetSearchData[],
    });

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual(["item 1", "item 2", "item 3", "item 4"]);
  });
});
