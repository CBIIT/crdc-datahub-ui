import z from "zod";

import {
  fundingSchema,
  plannedPublicationSchema,
  programInputSchema,
  publicationSchema,
  repositorySchema,
  studySchema,
} from "@/schemas/Application";

import { ColumnDef } from "../SectionBase";

export const SCHEMA = z
  .object({
    program: programInputSchema,
    study: z
      .object({
        name: studySchema.shape.name,
        abbreviation: studySchema.shape.abbreviation,
        description: studySchema.shape.description,
        funding: z.array(
          fundingSchema.pick({ agency: true, grantNumbers: true, nciProgramOfficer: true })
        ),
        publications: z.array(publicationSchema.pick({ title: true, pubmedID: true, DOI: true })),
        plannedPublications: z.array(
          plannedPublicationSchema.pick({ title: true, expectedDate: true })
        ),
        repositories: z.array(
          repositorySchema.pick({
            name: true,
            studyID: true,
            dataTypesSubmitted: true,
            otherDataTypesSubmitted: true,
          })
        ),
      })
      .strict(),
  })
  .strict();

export type BKeys =
  | "program._id"
  | "program.name"
  | "program.abbreviation"
  | "program.description"
  | "study.name"
  | "study.abbreviation"
  | "study.description"
  | "study.funding.agency"
  | "study.funding.grantNumbers"
  | "study.funding.nciProgramOfficer"
  | "study.publications.title"
  | "study.publications.pubmedID"
  | "study.publications.DOI"
  | "study.plannedPublications.title"
  | "study.plannedPublications.expectedDate"
  | "study.repositories.name"
  | "study.repositories.studyID"
  | "study.repositories.dataTypesSubmitted"
  | "study.repositories.otherDataTypesSubmitted";

const protection = { locked: true };

export const COLUMNS: ColumnDef<BKeys>[] = [
  {
    header: "Program",
    annotation:
      "The name of the broad administrative group that manages the data collection.  Example - Clinical Proteomic Tumor Analysis Consortium.",
    key: "program._id",
    width: 30,
    protection,
  },
  {
    header: "Program Title",
    key: "program.name",
    width: 30,
    protection,
  },
  {
    header: "Program Abbreviation",
    key: "program.abbreviation",
    width: 20,
    protection,
  },
  {
    header: "Program Description",
    key: "program.description",
    width: 50,
    protection,
  },
  {
    header: "Study Title",
    annotation: "A descriptive name that will be used to identify the study.",
    key: "study.name",
    width: 30,
    protection,
  },
  {
    header: "Study Abbreviation",
    annotation: "Provide a short abbreviation or acronym (e.g., NCI-MATCH) for the study.",
    key: "study.abbreviation",
    width: 20,
    protection,
  },
  {
    header: "Study Description",
    annotation:
      "Describe your study and the data being submitted. Include objectives of the study and provide a brief description of the scientific value of the study.",
    key: "study.description",
    width: 50,
    protection,
  },
  {
    header: "Funding Agency/Organization",
    key: "study.funding.agency",
    width: 40,
    annotation:
      "If there is more than one entry, you may use additional rows for the details of each entry.",
    protection,
  },
  {
    header: "Grant or Contract Number(s)",
    annotation:
      "For US federally funded studies, include: Grant or Contract number(s), for example, R01CAXXXX.",
    key: "study.funding.grantNumbers",
    width: 30,
    protection,
  },
  {
    header: "NCI Program Officer",
    key: "study.funding.nciProgramOfficer",
    width: 30,
    protection,
  },
  {
    header: "Existing Publication Title",
    key: "study.publications.title",
    width: 30,
    annotation:
      "If there is more than one entry, you may use additional rows for the details of each entry.",
    protection,
  },
  {
    header: "PubMed ID (PMID)",
    key: "study.publications.pubmedID",
    width: 30,
    protection,
  },
  {
    header: "DOI",
    key: "study.publications.DOI",
    width: 30,
    protection,
  },
  {
    header: "Planned Publication Title",
    key: "study.plannedPublications.title",
    width: 30,
    annotation:
      "If there is more than one entry, you may use additional rows for the details of each entry.",
    protection,
  },
  {
    header: "Expected Publication Date",
    annotation:
      "Data made available for secondary research only after investigators have obtained approval from NIH to use the requested data for a particular project.",
    key: "study.plannedPublications.expectedDate",
    width: 30,
    protection,
  },
  {
    header: "Repository Name",
    key: "study.repositories.name",
    width: 30,
    annotation:
      "If there is more than one entry, you may use additional rows for the details of each entry. Name of the repository (e.g., GEO, EGA, etc.).",
    protection,
  },
  {
    header: "Study ID",
    annotation: "Associated repository study identifier.",
    key: "study.repositories.studyID",
    width: 30,
    protection,
  },
  {
    header: "Data Type(s) Submitted",
    key: "study.repositories.dataTypesSubmitted",
    width: 50,
    annotation:
      'Pick from the dropdown or type multiple using the pipe ("|") separator (e.g. "clinicalTrial | genomics | imaging").',
    protection,
  },
  {
    header: "Other Data Type(s)",
    annotation: 'Enter additional Data Types, separated by pipes ("|").',
    key: "study.repositories.otherDataTypesSubmitted",
    width: 50,
    protection,
  },
];
