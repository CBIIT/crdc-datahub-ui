import Logo from "../assets/header/Portal_Logo.svg";
import LogoSmall from "../assets/header/Portal_Logo_Small.svg";
import usaFlagSmall from "../assets/header/us_flag_small.svg";
import { DataCommons } from "./DataCommons";
import ApiInstructions from "../assets/pdf/API_Instructions_Documentation.pdf";

export interface NavBarSublist {
  name: string;
  link?: string;
  text?: string;
  className: string;
  id?: string;
  onClick?: () => void;
  needsAuthentication?: boolean;
}

export const DataSubmissionInstructionsLink =
  "https://datacommons.cancer.gov/sites/default/files/2024-07/CRDC%20Data%20Submission%20Instructions%202024.pdf";

// globalHeaderLogo image 468x100
// globalHeaderImage: image 2200x100
export const headerData = {
  globalHeaderLogo: Logo,
  globalHeaderLogoSmall: LogoSmall,
  globalHeaderLogoLink: "/",
  globalHeaderLogoAltText: "Portal Logo",
  usaFlagSmall,
  usaFlagSmallAltText: "usaFlagSmall",
};

export const navMobileList = [
  {
    name: "Return to CRDC",
    link: "https://datacommons.cancer.gov/submit",
    id: "navbar-dropdown-join-crdc-data-hub",
    className: "navMobileItem",
  },
  {
    name: "Submission Requests",
    link: "/submissions",
    id: "navbar-dropdown-submission-requests",
    className: "navMobileItem",
  },
  {
    name: "Data Submissions",
    link: "/data-submissions",
    id: "navbar-dropdown-data-submissions",
    className: "navMobileItem",
  },
  {
    name: "Documentations",
    link: "#",
    id: "navbar-dropdown-documentation",
    className: "navMobileItem clickable",
  },
  {
    name: "Model Navigator",
    link: "#",
    id: "navbar-dropdown-model-navigator",
    className: "navMobileItem clickable",
  },
];

export const navbarSublists: Record<string, NavBarSublist[]> = {
  // Example of how to do a navMobileSubTitle and subtext
  // Home: [
  //   {
  //     name: 'Explore ##',
  //     link: '',
  //     text: 'testText',
  //     className: 'navMobileSubTitle',
  //   },
  // ],
  //
  // To make it a link, the className has to be navMobileSubItem
  "Model Navigator": DataCommons.map((dc) => ({
    name: `${dc.name} Model`,
    link: `/model-navigator/${dc.name}`,
    text: "",
    className: "navMobileSubItem",
  })),

  Documentations: [
    {
      name: "Submission Request Instructions",
      link: "https://datacommons.cancer.gov/sites/default/files/2024-07/CRDC%20Submission%20Request%20Instructions%202024.pdf",
      text: "",
      id: "submission-request-instructions",
      className: "navMobileSubItem",
    },
    {
      name: "Data Submission Instructions",
      link: DataSubmissionInstructionsLink,
      text: "",
      id: "data-submission-instructions",
      className: "navMobileSubItem",
    },
    {
      name: "API Instructions",
      link: ApiInstructions,
      text: "",
      id: "api-instructions",
      className: "navMobileSubItem",
    },
  ],
};
