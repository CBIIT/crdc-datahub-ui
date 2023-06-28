// NOTE: this will have to be changed if schema changes
const initialValues: Omit<Application, "id"> = {
  sections: [],
  pi: {
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    institution: "",
    eRAAccount: "",
    address: "",
  },
  primaryContact: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    institution: "",
    position: "",
  },
  additionalContacts: [],
  program: {
    title: "",
    abbreviation: "",
    description: "",
  },
  study: {
    title: "",
    abbreviation: "",
    description: "",
    repositories: [],
  },
  accessTypes: [],
  targetedSubmissionDate: "",
  targetedReleaseDate: "",
  timeConstraints: [],
  cancerTypes: [],
  otherCancerTypes: "",
  preCancerTypes: [],
  otherPreCancerTypes: "",
  numberOfParticipants: 0,
  species: [],
  cellLines: false,
  modelSystems: false,
  funding: {
    agencies: [],
    nciProgramOfficer: "",
    nciGPA: "",
  },
  publications: [],
  plannedPublications: [],
};

export default initialValues;
