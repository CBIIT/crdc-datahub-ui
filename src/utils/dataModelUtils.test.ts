import { Mock } from "vitest";
import { MODEL_FILE_REPO } from "../config/DataCommons";
import * as utils from "./dataModelUtils";

global.fetch = vi.fn();

vi.mock("../env", () => ({
  ...process.env,
  VITE_DEV_TIER: undefined,
}));

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
      CDS: {
        versions: ["XXX", "1.0", "2.0", "3.0"],
      } as ManifestAssets,
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
      CDS: {
        versions: ["mock-version"],
      } as ManifestAssets,
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("this-model-does-not-exist");

    expect(versions).toEqual([]);
  });

  it("should return an empty array if no versions are found (empty)", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        versions: [],
      } as ManifestAssets,
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual([]);
  });

  it("should return an empty array if no versions are found (non-array)", async () => {
    const fakeManifest: DataModelManifest = {
      CDS: {
        versions: null,
      } as ManifestAssets,
    };
    sessionStorage.setItem("manifest", JSON.stringify(fakeManifest));

    const versions = await utils.listAvailableModelVersions("CDS");

    expect(versions).toEqual([]);
  });
});

describe("buildAssetUrls cases", () => {
  it("should build asset URLs using prod tier when VITE_DEV_TIER is not defined", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "release-notes": "release-notes.md",
      } as ManifestAssets,
    } as DataCommon;

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
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file", "other-file", "fourth-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.model_files).toEqual([
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/other-file`,
      `${MODEL_FILE_REPO}prod/cache/test-name/1.0/fourth-file`,
    ]);
  });

  it("should handle empty model-files array", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": [],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.model_files).toEqual([]);
  });

  const readMeValues = ["", null, undefined, false];
  it.each(readMeValues)("should not include a README URL if the filename is %s", (readme) => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": readme,
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.readme).toEqual(null);
  });

  it("should use an empty string if model-navigator-logo is not defined", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        // "model-navigator-logo" - not defined, aka no logo
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.navigator_icon).toEqual("");
  });

  it("should use an empty string if the model-navigator-logo is an empty string", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "model-navigator-logo": "", // empty string - aka no logo
      } as ManifestAssets,
    } as DataCommon;

    const result = utils.buildAssetUrls(dc, "latest");

    expect(result.navigator_icon).toEqual("");
  });

  it("should use model-navigator-logo if provided in the content manifest", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
        "model-navigator-logo": "custom-logo.png", // defined - must exist
      } as ManifestAssets,
    } as DataCommon;

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
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      } as ManifestAssets,
    } as DataCommon;

    expect(() => utils.buildAssetUrls(dc, "latest")).not.toThrow();
    expect(utils.buildAssetUrls(dc, "latest")).toEqual(
      expect.objectContaining({ model_files: [] })
    );
  });

  it("should use the provided modelVersion if it is not 'latest'", () => {
    const dc: DataCommon = {
      name: "test-name",
      assets: {
        "current-version": "1.0",
        "model-files": ["model-file", "prop-file"],
        "readme-file": "readme-file",
        "loading-file": "loading-file-zip-name",
      } as ManifestAssets,
    } as DataCommon;

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
    const dc: ModelNavigatorConfig = {
      facetFilterSearchData: null,
    } as ModelNavigatorConfig;

    const result = utils.buildBaseFilterContainers(dc);
    expect(result).toEqual({});

    const dc2: ModelNavigatorConfig = {
      facetFilterSearchData: [],
    } as ModelNavigatorConfig;

    const result2 = utils.buildBaseFilterContainers(dc2);
    expect(result2).toEqual({});
  });

  it("should build filter containers correctly", () => {
    const dc: ModelNavigatorConfig = {
      facetFilterSearchData: [
        { datafield: "field1" },
        { datafield: "field2" },
        { datafield: null },
      ] as FacetSearchData[],
    } as ModelNavigatorConfig;

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
    const dc: ModelNavigatorConfig = {
      facetFilterSearchData: null,
    } as ModelNavigatorConfig;

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual([]);

    const dc2: ModelNavigatorConfig = {
      facetFilterSearchData: [],
    } as ModelNavigatorConfig;

    const result2 = utils.buildFilterOptionsList(dc2);
    expect(result2).toEqual([]);
  });

  it("should build filter options list correctly", () => {
    const dc: ModelNavigatorConfig = {
      facetFilterSearchData: [
        { checkboxItems: [{ name: "Item 1" }, { name: "Item 2" }] },
        { checkboxItems: [{ name: "Item 3" }, { name: "Item 4" }] },
        { checkboxItems: null },
      ] as FacetSearchData[],
    } as ModelNavigatorConfig;

    const result = utils.buildFilterOptionsList(dc);
    expect(result).toEqual(["item 1", "item 2", "item 3", "item 4"]);
  });
});

describe("updateEnums", () => {
  const cdeMap = new Map([
    [
      "program.program_name;11444542.1.00",
      {
        CDECode: "11444542",
        CDEVersion: "1.00",
        CDEOrigin: "caDSR",
      },
    ],
  ]);

  const dataList = {
    program: {
      properties: {
        program_name: {
          category: "program",
          description:
            "The name of the program under which related studies will be grouped, in full text and unabbreviated form, exactly as it will be displayed within the UI.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "required",
          display: "no",
          enum: ["enum one", "enum two"],
        },
      },
    },
  };

  const CDEresponse = {
    _id: "967c20fd-8980-44ec-aa3e-e9647e4f6b26",
    CDEFullName: "Subject Legal Adult Or Pediatric Participant Type",
    CDECode: "11444542",
    CDEVersion: "1.00",
    PermissibleValues: ["Pediatric", "Adult - legal age"],
    createdAt: "2024-09-24T11:45:42.313Z",
    updatedAt: "2024-09-24T11:45:42.313Z",
  };

  it("should update dataList with permissible values from the response", () => {
    const response = [CDEresponse];

    const result = utils.updateEnums(cdeMap, dataList, response);

    expect(result.program.properties["program_name"].enum).toEqual([
      "Pediatric",
      "Adult - legal age",
    ]);
  });

  it("should convert the property to a string if the permissible values is an empty array", () => {
    const response = [
      {
        ...CDEresponse,
        PermissibleValues: [],
      },
    ];

    const result = utils.updateEnums(cdeMap, dataList, response);

    expect(result.program.properties["program_name"].enum).not.toBeDefined();
    expect(result.program.properties["program_name"].type).toEqual("string");
  });

  it("should return the enum from mdf or undefined if none when permissable values is null", () => {
    const response = [
      {
        ...CDEresponse,
        PermissibleValues: null,
      },
    ];

    const result = utils.updateEnums(cdeMap, dataList, response);

    expect(result.program.properties["program_name"].enum).toEqual(["enum one", "enum two"]);
  });

  it("should populate the CDE details in the property regardless of the permissible values", () => {
    const emptyPvResult = utils.updateEnums(cdeMap, dataList, [CDEresponse]);

    expect(emptyPvResult.program.properties["program_name"].CDEFullName).toEqual(
      "Subject Legal Adult Or Pediatric Participant Type"
    );
    expect(emptyPvResult.program.properties["program_name"].CDECode).toEqual("11444542");
    expect(emptyPvResult.program.properties["program_name"].CDEVersion).toEqual("1.00");
    expect(emptyPvResult.program.properties["program_name"].CDEOrigin).toEqual("caDSR");

    const nullPvResult = utils.updateEnums(cdeMap, dataList, [
      {
        ...CDEresponse,
        PermissibleValues: null,
      },
    ]);

    expect(nullPvResult.program.properties["program_name"].CDEFullName).toEqual(
      "Subject Legal Adult Or Pediatric Participant Type"
    );
    expect(nullPvResult.program.properties["program_name"].CDECode).toEqual("11444542");
    expect(nullPvResult.program.properties["program_name"].CDEVersion).toEqual("1.00");
    expect(nullPvResult.program.properties["program_name"].CDEOrigin).toEqual("caDSR");
  });

  // NOTE: this is a temporary solution until 3.2.0 supports alternate CDE origins
  it("should populate the CDE Origin from the CDEMap provided by Model Navigator", () => {
    const testMap = new Map([
      [
        "program.program_name;11444542.1.00",
        {
          CDECode: "11444542",
          CDEVersion: "1.00",
          CDEOrigin: "fake origin that is not caDSR",
        },
      ],
    ]);

    const result = utils.updateEnums(testMap, dataList, [CDEresponse]);

    expect(result.program.properties["program_name"].CDEOrigin).toEqual(
      "fake origin that is not caDSR"
    );
  });

  it("should apply fallback message when response is empty and apiError is true", () => {
    const result = utils.updateEnums(cdeMap, dataList, [], true);

    expect(result.program.properties["program_name"].enum).toEqual([
      "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);
  });
});

describe("traverseAndReplace", () => {
  const node = {
    program: {
      properties: {
        program_name: {
          category: "program",
          description:
            "The name of the program under which related studies will be grouped, in full text and unabbreviated form, exactly as it will be displayed within the UI.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "required",
          display: "no",
          enum: ["enum one", "enum two"],
        },
      },
    },
  };

  const resultMap = new Map([
    [
      "program.program_name;11524549.1.00",
      {
        _id: "967c20fd-8980-44ec-aa3e-e9647e4f6b26",
        CDEFullName: "Subject Legal Adult Or Pediatric Participant Type",
        CDECode: "11524549",
        CDEVersion: "1.00",
        CDEOrigin: "caDSR",
        PermissibleValues: ["Pediatric", "Adult - legal age"],
        createdAt: "2024-09-24T11:45:42.313Z",
        updatedAt: "2024-09-24T11:45:42.313Z",
      },
    ],
  ]);

  const mapKeyPrefixes = new Map([["program.program_name", "program.program_name;11524549.1.00"]]);

  it("should replace permissible values using mapKeyPrefixes", () => {
    const mapKeyPrefixesNoValues = new Map();
    const apiError = false;

    utils.traverseAndReplace(node, resultMap, mapKeyPrefixes, mapKeyPrefixesNoValues, apiError);

    expect(node["program"].properties["program_name"].enum).toEqual([
      "Pediatric",
      "Adult - legal age",
    ]);
  });

  it("should return the enum from mdf or undefined if there is no enum in the MDF", () => {
    const resultMap = new Map();
    const mapKeyPrefixes = new Map();
    const mapKeyPrefixesNoValues = new Map([
      ["program.program_name", "program.program_name;11524549.1.00"],
    ]);
    const thisNode = {
      program: {
        ...node.program,
        properties: {
          ...node.program.properties,
          program_name: {
            ...node.program.properties.program_name,
            enum: undefined,
          },
        },
      },
    };
    const apiError = true;

    utils.traverseAndReplace(thisNode, resultMap, mapKeyPrefixes, mapKeyPrefixesNoValues, apiError);

    expect(thisNode["program"].properties["program_name"].enum).toEqual(undefined);
  });

  it("should use fallback message when permissible values are empty and apiError is true", () => {
    const resultMap = new Map();
    const mapKeyPrefixes = new Map();
    const mapKeyPrefixesNoValues = new Map([
      ["program.program_name", "program.program_name;11524549.1.00"],
    ]);
    const apiError = true;

    utils.traverseAndReplace(node, resultMap, mapKeyPrefixes, mapKeyPrefixesNoValues, apiError);

    expect(node["program"].properties["program_name"].enum).toEqual([
      "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);
  });

  it("should use fallback message if resultMap has no matching entry", () => {
    const resultMap = new Map();
    const mapKeyPrefixes = new Map();
    const mapKeyPrefixesNoValues = new Map([
      ["program.program_name", "program.program_name;11524549.1.00"],
    ]);
    const apiError = false;

    utils.traverseAndReplace(node, resultMap, mapKeyPrefixes, mapKeyPrefixesNoValues, apiError);

    expect(node["program"].properties["program_name"].enum).toEqual([
      "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);
  });
});
