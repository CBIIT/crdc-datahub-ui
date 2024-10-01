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
    (fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("fetch error")));

    await expect(utils.fetchManifest()).rejects.toThrow("Unable to fetch or parse manifest");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // NOTE: We're asserting that JSON.parse does not throw an error here
  it("should throw a controlled error if fetch returns invalid JSON", async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.reject(new Error("JSON error")) })
    );

    await expect(utils.fetchManifest()).rejects.toThrow("Unable to fetch or parse manifest");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should fall back to prod tier if REACT_APP_DEV_TIER is not defined", async () => {
    const fakeManifest = { key: "value" };

    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(fakeManifest) })
    );

    await utils.fetchManifest();

    expect(fetch).toHaveBeenCalledWith(`${MODEL_FILE_REPO}prod/cache/content.json`);
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
      model: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/model-file`,
      props: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/prop-file`,
      readme: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/readme-file`,
      loading_file: `${MODEL_FILE_REPO}prod/cache/test-name/1.0/loading-file-zip-name`,
    });
  });

  const readMeValues = ["", null, undefined, false];
  it.each(readMeValues)("should not include a README URL if the filename is %s", (readme) => {
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
  });

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

describe("updateEnums", () => {
  const cdeMap = new Map([
    [
      "program.program_name;11444542.1.00",
      [
        {
          CDECode: "11444542",
          CDEVersion: "1.00",
        },
      ],
    ],
  ]);

  const dataList = {
    program: {
      $schema: "http://json-schema.org/draft-06/schema#",
      id: "program",
      title: "program",
      category: "study",
      program: "*",
      project: "*",
      additionalProperties: false,
      submittable: true,
      constraints: null,
      type: "object",
      assignment: "core",
      class: "primary",
      desc: "Program in the Cancer Data Service refer to a broad framework of goals under which related projects or other research activities are grouped. Example - Clinical Proteomic Tumor Analysis Consortium (CPTAC)",
      description:
        "Program in the Cancer Data Service refer to a broad framework of goals under which related projects or other research activities are grouped. Example - Clinical Proteomic Tumor Analysis Consortium (CPTAC)",
      template: "Yes",
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
        },
        program_acronym: {
          category: "program",
          description:
            "The name of the program under which related studies will be grouped, expressed in the form of the acronym by which it will identified within the UI. <br>This property is used as the key via which study records can be associated with the appropriate program during data loading, and to identify the correct records during data updates.",
          type: "string",
          src: "Internally-curated",
          key: true,
          isIncludedInTemplate: true,
          propertyType: "required",
          display: "no",
        },
        program_short_description: {
          category: "program",
          description: "An abbreviated, single sentence description of the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_full_description: {
          category: "program",
          description: "A more detailed, multiple sentence description of the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_external_url: {
          category: "program",
          description:
            "The external url to which users should be directed in order to learn more about the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_sort_order: {
          category: "program",
          description:
            "An arbitrarily-assigned value used to dictate the order in which programs are displayed within the application's UI.",
          type: "integer",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "optional",
          display: "no",
        },
        program_short_name: {
          category: "program",
          description:
            "An acronym or abbreviated form of the title of a broad framework of goals under which related projects or other research activities are grouped. Example - CPTAC",
          type: "String",
          isIncludedInTemplate: true,
          propertyType: "optional",
          display: "no",
        },
        institution: {
          category: "program",
          description: "TBD",
          type: "String",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        crdc_id: {
          category: "program",
          description: "The crdc_id is a unique identifier that is generated by Data Hub",
          type: "string",
          isIncludedInTemplate: false,
          propertyType: "optional",
          display: "no",
        },
      },
      inclusion: {
        required: ["program_name", "program_acronym"],
        optional: ["program_sort_order", "program_short_name", "crdc_id"],
        preferred: [
          "program_short_description",
          "program_full_description",
          "program_external_url",
          "institution",
        ],
      },
      uiDisplay: {
        no: [
          "program_name",
          "program_acronym",
          "program_short_description",
          "program_full_description",
          "program_external_url",
          "program_sort_order",
          "program_short_name",
          "institution",
          "crdc_id",
        ],
      },
      required: ["program_name", "program_acronym"],
      preferred: [
        "program_short_description",
        "program_full_description",
        "program_external_url",
        "institution",
      ],
      optional: ["program_sort_order", "program_short_name", "crdc_id"],
      yes: [],
      no: [
        "program_name",
        "program_acronym",
        "program_short_description",
        "program_full_description",
        "program_external_url",
        "program_sort_order",
        "program_short_name",
        "institution",
        "crdc_id",
      ],
      multiplicity: "Many To One",
      links: [
        {
          Dst: "program",
          Src: "study",
          multiplicity: "many_to_one",
        },
      ],
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

  it("should use fallback message if permissible values are empty", () => {
    const response = [
      {
        ...CDEresponse,
        PermissibleValues: [],
      },
    ];

    const result = utils.updateEnums(cdeMap, dataList, response);

    expect(result.program.properties["program_name"].enum).toEqual([
      "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
    ]);
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
      $schema: "http://json-schema.org/draft-06/schema#",
      id: "program",
      title: "program",
      category: "study",
      program: "*",
      project: "*",
      additionalProperties: false,
      submittable: true,
      constraints: null,
      type: "object",
      assignment: "core",
      class: "primary",
      desc: "Program in the Cancer Data Service refer to a broad framework of goals under which related projects or other research activities are grouped. Example - Clinical Proteomic Tumor Analysis Consortium (CPTAC)",
      description:
        "Program in the Cancer Data Service refer to a broad framework of goals under which related projects or other research activities are grouped. Example - Clinical Proteomic Tumor Analysis Consortium (CPTAC)",
      template: "Yes",
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
          enum: [
            "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
          ],
        },
        program_acronym: {
          category: "program",
          description:
            "The name of the program under which related studies will be grouped, expressed in the form of the acronym by which it will identified within the UI. <br>This property is used as the key via which study records can be associated with the appropriate program during data loading, and to identify the correct records during data updates.",
          type: "string",
          src: "Internally-curated",
          key: true,
          isIncludedInTemplate: true,
          propertyType: "required",
          display: "no",
        },
        program_short_description: {
          category: "program",
          description: "An abbreviated, single sentence description of the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_full_description: {
          category: "program",
          description: "A more detailed, multiple sentence description of the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_external_url: {
          category: "program",
          description:
            "The external url to which users should be directed in order to learn more about the program.",
          type: "string",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        program_sort_order: {
          category: "program",
          description:
            "An arbitrarily-assigned value used to dictate the order in which programs are displayed within the application's UI.",
          type: "integer",
          src: "Internally-curated",
          isIncludedInTemplate: true,
          propertyType: "optional",
          display: "no",
        },
        program_short_name: {
          category: "program",
          description:
            "An acronym or abbreviated form of the title of a broad framework of goals under which related projects or other research activities are grouped. Example - CPTAC",
          type: "String",
          isIncludedInTemplate: true,
          propertyType: "optional",
          display: "no",
          enum: [
            "Permissible values are currently not available. Please contact the Data Hub HelpDesk at NCICRDCHelpDesk@mail.nih.gov",
          ],
        },
        institution: {
          category: "program",
          description: "TBD",
          type: "String",
          isIncludedInTemplate: true,
          propertyType: "preferred",
          display: "no",
        },
        crdc_id: {
          category: "program",
          description: "The crdc_id is a unique identifier that is generated by Data Hub",
          type: "string",
          isIncludedInTemplate: false,
          propertyType: "optional",
          display: "no",
        },
      },
      inclusion: {
        required: ["program_name", "program_acronym"],
        optional: ["program_sort_order", "program_short_name", "crdc_id"],
        preferred: [
          "program_short_description",
          "program_full_description",
          "program_external_url",
          "institution",
        ],
      },
      uiDisplay: {
        no: [
          "program_name",
          "program_acronym",
          "program_short_description",
          "program_full_description",
          "program_external_url",
          "program_sort_order",
          "program_short_name",
          "institution",
          "crdc_id",
        ],
      },
      required: ["program_name", "program_acronym"],
      preferred: [
        "program_short_description",
        "program_full_description",
        "program_external_url",
        "institution",
      ],
      optional: ["program_sort_order", "program_short_name", "crdc_id"],
      yes: [],
      no: [
        "program_name",
        "program_acronym",
        "program_short_description",
        "program_full_description",
        "program_external_url",
        "program_sort_order",
        "program_short_name",
        "institution",
        "crdc_id",
      ],
      multiplicity: "Many To One",
      links: [
        {
          Dst: "program",
          Src: "study",
          multiplicity: "many_to_one",
        },
      ],
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
