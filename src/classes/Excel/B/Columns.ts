import { ColumnDef } from "../SectionBase";

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
    key: "study.name",
    width: 30,
    protection,
  },
  {
    header: "Study Abbreviation",
    key: "study.abbreviation",
    width: 20,
    protection,
  },
  {
    header: "Study Description",
    key: "study.description",
    width: 50,
    protection,
  },
  {
    header: "Funding Agency/Organization",
    key: "study.funding.agency",
    width: 40,
    protection,
  },
  {
    header: "Grant or Contract Number(s)",
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
    header: "Publication Title",
    key: "study.publications.title",
    width: 30,
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
    protection,
  },
  {
    header: "Expected Publication Date",
    key: "study.plannedPublications.expectedDate",
    width: 30,
    protection,
  },
  {
    header: "Repository Name",
    key: "study.repositories.name",
    width: 30,
    protection,
  },
  {
    header: "Study ID",
    key: "study.repositories.studyID",
    width: 30,
    protection,
  },
  {
    header: "Data Type(s) Submitted",
    key: "study.repositories.dataTypesSubmitted",
    width: 50,
    protection,
  },
  {
    header: "Other Data Type(s)",
    key: "study.repositories.otherDataTypesSubmitted",
    width: 50,
    protection,
  },
];
