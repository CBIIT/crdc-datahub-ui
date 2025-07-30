import { Mock } from "vitest";

import { MODEL_FILE_REPO } from "@/config/DataCommons";
import { dataCommonFactory } from "@/factories/data-common/DataCommonFactory";
import { manifestAssetsFactory } from "@/factories/data-common/ManifestAssetsFactory";
import { modelNavigatorConfigFactory } from "@/factories/data-common/ModelNavigatorConfigFactory";
import { modelDefinitionFactory } from "@/factories/mdf/ModelDefinitionFactory";
import { modelDefinitionNodeFactory } from "@/factories/mdf/ModelDefinitionNodeFactory";
import { modelDefinitionNodePropertyFactory } from "@/factories/mdf/ModelDefinitionNodePropertyFactory";
import { modelDefinitionTermFactory } from "@/factories/mdf/ModelDefinitionTermFactory";
import { RetrieveCDEsResp } from "@/graphql";

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

describe("deleteInvalidCDEs tests", () => {
  it("should delete CDEs for non-caDSR origins", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property_invalid_cde: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Origin: "this is invalid",
            }),
          }),
        },
      }),
      node2: modelDefinitionNodeFactory.build({
        properties: {
          property_valid_cde: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(2, (index) => ({
              Code: `valid-code-${index}`,
              Origin: "caDSR",
            })),
          }),
        },
      }),
      node3: modelDefinitionNodeFactory.build({
        properties: {
          propert_valid_cde_CASED: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Origin: "CADSR",
            }),
          }),
        },
      }),
      node4: modelDefinitionNodeFactory.build({
        properties: {
          property_valid_cde_prefixed: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(2, {
              Origin: "somePrefix - CADSR",
            }),
          }),
        },
      }),
    });

    utils.deleteInvalidCDEs(dictionary);

    expect(dictionary.node1.properties.property_invalid_cde.Term).toEqual([]);
    expect(dictionary.node2.properties.property_valid_cde.Term).toEqual([
      ...modelDefinitionTermFactory.build(2, (index) => ({
        Code: `valid-code-${index}`,
        Origin: "caDSR",
      })),
    ]);
    expect(dictionary.node3.properties.propert_valid_cde_CASED.Term).toEqual(
      modelDefinitionTermFactory.build(1, {
        Origin: "CADSR",
      })
    );
    expect(dictionary.node4.properties.property_valid_cde_prefixed.Term).toEqual([
      ...modelDefinitionTermFactory.build(2, {
        Origin: "somePrefix - CADSR",
      }),
    ]);
  });

  it.each<unknown>([null, undefined, {}])("should handle invalid input '%s' safely", (input) => {
    expect(() => utils.deleteInvalidCDEs(input as MDFDictionary)).not.toThrow();
  });

  it("should handle nodes with no properties", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {},
      }),
    });

    expect(() => utils.deleteInvalidCDEs(dictionary)).not.toThrow();

    expect(dictionary.node1.properties).toEqual({});
  });

  it("should clear all invalid CDEs origins", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property_invalid_cde: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Origin: "this is invalid",
            }),
          }),
          property_invalid_cde2: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Origin: "this is",
            }),
          }),
          property_invalid_cde3: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Origin: "this",
            }),
          }),
        },
      }),
    });

    utils.deleteInvalidCDEs(dictionary);

    expect(dictionary.node1.properties.property_invalid_cde.Term).toEqual([]);
  });
});

describe("populateCDEData tests", () => {
  const mockData: RetrieveCDEsResp["retrieveCDEs"] = [
    {
      CDEFullName: "CDE Full Name 1",
      CDECode: "CDECode1",
      CDEVersion: "1.0",
      PermissibleValues: ["Value1", "Value2"],
    },
    {
      CDEFullName: "CDE Full Name 2",
      CDECode: "CDECode2",
      CDEVersion: "2.0",
      PermissibleValues: ["Value3", "Value4"],
    },
  ];

  it.each<unknown>([null, undefined, {}])("should handle invalid input '%s' safely", (input) => {
    expect(() => utils.populateCDEData(input as MDFDictionary, mockData)).not.toThrow();
  });

  it("should update the CDE Value (CDE Full Name) with API data", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "CDECode1",
              Version: "1.0",
            }),
          }),
          property2: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "CDECode2",
              Version: "2.0",
            }),
          }),
        },
      }),
    });

    utils.populateCDEData(dictionary, mockData);

    expect(dictionary.node1.properties.property1.Term[0].Value).toBe("CDE Full Name 1");
    expect(dictionary.node1.properties.property2.Term[0].Value).toBe("CDE Full Name 2");
  });

  it("should replace the enum with Permissible Values from API data", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "CDECode1",
              Version: "1.0",
            }),
            enum: ["OldValue1", "OldValue2"],
          }),
          property2: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "CDECode2",
              Version: "2.0",
            }),
            enum: ["OldValue3", "OldValue4"],
          }),
        },
      }),
    });

    utils.populateCDEData(dictionary, mockData);

    expect(dictionary.node1.properties.property1.enum).toEqual(["Value1", "Value2"]);
    expect(dictionary.node1.properties.property2.enum).toEqual(["Value3", "Value4"]);
  });

  it("should change the type of the property to 'string' if the API returns an empty Permissible Values array", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          previously_enum: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "some-cde-code",
              Version: "2.00",
            }),
            type: "enum",
            enum: ["Some value 1", "another value 2"],
          }),
          was_not_enum: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "another-cde-code",
              Version: "3.00",
            }),
            enum: undefined, // NOTE: explicitly not an enum
            type: "list", // NOTE: explicitly a list
          }),
        },
      }),
    });

    const emptyData: RetrieveCDEsResp["retrieveCDEs"] = [
      {
        CDEFullName: "mock-value",
        CDECode: "some-cde-code",
        CDEVersion: "2.00",
        PermissibleValues: [],
      },
      {
        CDEFullName: "mock-value",
        CDECode: "another-cde-code",
        CDEVersion: "3.00",
        PermissibleValues: [],
      },
    ];

    utils.populateCDEData(dictionary, emptyData);

    // This was modified to be a string type
    expect(dictionary.node1.properties.previously_enum.enum).not.toBeDefined();
    expect(dictionary.node1.properties.previously_enum.type).toBe("string");

    // This was not an enum, so it should remain unchanged
    expect(dictionary.node1.properties.was_not_enum.enum).not.toBeDefined();
    expect(dictionary.node1.properties.was_not_enum.type).toBe("list");
  });

  it("should remove the enum if the API does not return CDE info for a property", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "this-exists",
              Version: "1.0",
            }),
            enum: ["value existing"],
          }),
          property2: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "NonExistentCode",
              Version: "0.0",
            }),
            enum: ["OldValue3", "OldValue4"],
          }),
          property3: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "BadVersionCode",
              Version: "9.0.0",
            }),
            enum: ["another value"],
          }),
        },
      }),
    });

    const missingData: RetrieveCDEsResp["retrieveCDEs"] = [
      {
        CDEFullName: "mock name",
        CDECode: "this-exists",
        CDEVersion: "1.0",
        PermissibleValues: ["valid value"],
      },
      {
        CDEFullName: "we returned data but the code does not match",
        CDECode: "BadVersionCode",
        CDEVersion: "2.00", // NOTE: We need 9.0.0
        PermissibleValues: ["another value"],
      },
    ];

    utils.populateCDEData(dictionary, missingData);

    // property1 should have its enum updated
    expect(dictionary.node1.properties.property1.enum).toEqual(["valid value"]);
    expect(dictionary.node1.properties.property1.Term[0].Value).toBe("mock name");

    // property2 should have its enum updated to the fallback value
    // CDECode does not match, so enum should be removed
    expect(dictionary.node1.properties.property2.enum).toEqual([
      "Permissible values are currently not available. Please contact the CRDC Submission Portal HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);

    // property3 should have its enum updated to the fallback value
    // CDEVersion does not match, so enum should be removed
    expect(dictionary.node1.properties.property3.enum).toEqual([
      "Permissible values are currently not available. Please contact the CRDC Submission Portal HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);
  });

  it("should not remove the enum if the API does not return CDE info but the property does not have an enum", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(1, {
              Code: "BadCodeWithNoEnum",
              Version: "1.0",
            }),
            enum: undefined, // NOTE: explicitly not an enum
            type: "something",
          }),
        },
      }),
    });

    const missingData: RetrieveCDEsResp["retrieveCDEs"] = [];

    utils.populateCDEData(dictionary, missingData);

    // property1 should be untouched since it does not have an enum
    expect(dictionary.node1.properties.property1).toEqual({
      ...modelDefinitionNodePropertyFactory.build({
        Term: modelDefinitionTermFactory.build(1, {
          Code: "BadCodeWithNoEnum",
          Version: "1.0",
        }),
        enum: undefined, // NOTE: explicitly not an enum
        type: "something",
      }),
    });
  });
});

describe("extractAllCDEs tests", () => {
  it.each<unknown>([null, undefined, {}])("should handle invalid input '%s' safely", (input) => {
    expect(() => utils.extractAllCDEs(input as MDFDictionary)).not.toThrow();
  });

  it("should extract all CDEs from a valid dictionary", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(5, (index) => ({
              Code: `CDECode-${index}`,
              Version: `1.0.${index}`,
              Origin: "caDSR",
            })),
          }),
        },
      }),
      node2: modelDefinitionNodeFactory.build({
        properties: {
          prop_abc: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(2, (index) => ({
              Code: `CDECode-${index}`,
              Version: `1.0.${index}`,
              Origin: "Non-CaDSR-Supported",
            })),
          }),
        },
      }),
    });

    const result = utils.extractAllCDEs(dictionary);
    expect(result).toEqual([
      { CDECode: "CDECode-0", CDEVersion: "1.0.0", CDEOrigin: "caDSR" },
      { CDECode: "CDECode-1", CDEVersion: "1.0.1", CDEOrigin: "caDSR" },
      { CDECode: "CDECode-2", CDEVersion: "1.0.2", CDEOrigin: "caDSR" },
      { CDECode: "CDECode-3", CDEVersion: "1.0.3", CDEOrigin: "caDSR" },
      { CDECode: "CDECode-4", CDEVersion: "1.0.4", CDEOrigin: "caDSR" },
      { CDECode: "CDECode-0", CDEVersion: "1.0.0", CDEOrigin: "Non-CaDSR-Supported" },
      { CDECode: "CDECode-1", CDEVersion: "1.0.1", CDEOrigin: "Non-CaDSR-Supported" },
    ]);
    expect(result.length).toBe(7); // 5 from node1, 2 from node2
  });

  it("should deduplicate CDEs based on Code, Version, and Origin", () => {
    const dictionary = modelDefinitionFactory.build({
      node1: modelDefinitionNodeFactory.build({
        properties: {
          property1: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(3, (index) => ({
              Code: `CDECode-${index}`,
              Version: `1.0.${index}`,
              Origin: "caDSR",
            })),
          }),
        },
      }),
      node2: modelDefinitionNodeFactory.build({
        properties: {
          property2: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(3, (index) => ({
              Code: `CDECode-${index}`,
              Version: `1.0.${index}`,
              Origin: "caDSR",
            })),
          }),
        },
      }),
      node3: modelDefinitionNodeFactory.build({
        properties: {
          property3: modelDefinitionNodePropertyFactory.build({
            Term: modelDefinitionTermFactory.build(2, (index) => ({
              Code: `CDECode-${index}`,
              Version: `1.0.${index}`,
              Origin: `unique-origin-${index}`,
            })),
          }),
        },
      }),
    });

    const result = utils.extractAllCDEs(dictionary);
    expect(result.length).toBe(5); // 3 from node1, 2 from node2, 2 from node3  });
  });
});
