import Logo from "../assets/header/Portal_Logo.svg";
import LogoSmall from "../assets/header/Portal_Logo_Small.svg";
import usaFlagSmall from "../assets/header/us_flag_small.svg";
import { DataCommons } from "./DataCommons";
import ApiInstructions from "../assets/pdf/CRDC_Data_Submission_API_Instructions.pdf";

export const DataSubmissionInstructionsLink =
  "https://datacommons.cancer.gov/data-submission-instructions";

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

export const HeaderLinks: NavBarItem[] = [
  {
    name: "Back to CRDC",
    link: "https://datacommons.cancer.gov/submit",
    id: "navbar-dropdown-join-crdc-data-hub",
    className: "navMobileItem",
  },
  {
    name: "Submission Requests",
    link: "/submission-requests",
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
    name: "Documentation",
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
  {
    name: "Operation Dashboard",
    link: "/operation-dashboard",
    id: "navbar-dropdown-operation-dashboard",
    className: "navMobileItem",
    permissions: ["dashboard:view"],
  },
];

export const HeaderSubLinks: Record<string, NavBarSubItem[]> = {
  "Model Navigator": DataCommons.map((dc, idx) => ({
    id: `model-navigator-${dc.name}`,
    name: `${dc.displayName}${dc.displayName.indexOf("Model") === -1 ? " Model" : ""}`,
    link: `/model-navigator/${dc.displayName}/latest`,
    className: "navMobileSubItem",
    position: [idx % 4, Math.floor(idx / 4)],
  })),

  Documentation: [
    {
      name: "Submission Request Instructions",
      link: "https://datacommons.cancer.gov/submission-request-instructions",
      id: "submission-request-instructions",
      className: "navMobileSubItem",
      position: [0, 0],
    },
    {
      name: "Data Submission Instructions",
      link: DataSubmissionInstructionsLink,
      id: "data-submission-instructions",
      className: "navMobileSubItem",
      position: [1, 0],
    },
    {
      name: "API Instructions",
      link: ApiInstructions,
      id: "api-instructions",
      className: "navMobileSubItem",
      position: [2, 0],
    },
  ],

  // NOTE: Special case for logged-in user. Should not be renamed
  User: [
    {
      name: "User Profile",
      link: "/profile/:userId",
      id: "navbar-dropdown-item-user-profile",
      className: "navMobileSubItem",
      position: [0, 0],
    },
    {
      name: "Uploader CLI Tool",
      id: "navbar-dropdown-item-uploader-tool",
      className: "navMobileSubItem action",
      position: [1, 0],
    },
    {
      name: "API Token",
      id: "navbar-dropdown-item-api-token",
      className: "navMobileSubItem action",
      permissions: ["data_submission:create"],
      position: [1, 1],
    },
    {
      name: "Manage Studies",
      link: "/studies",
      id: "navbar-dropdown-item-studies-manage",
      className: "navMobileSubItem",
      permissions: ["study:manage"],
      position: [2, 0],
    },
    {
      name: "Manage Programs",
      link: "/programs",
      id: "navbar-dropdown-item-program-manage",
      className: "navMobileSubItem",
      permissions: ["program:manage"],
      position: [2, 1],
    },
    {
      name: "Manage Institutions",
      link: "/institutions",
      id: "navbar-dropdown-item-institution-manage",
      className: "navMobileSubItem",
      permissions: ["institution:manage"],
      position: [2, 2],
    },
    {
      name: "Manage Users",
      link: "/users",
      id: "navbar-dropdown-item-user-manage",
      className: "navMobileSubItem",
      permissions: ["user:manage"],
      position: [2, 3],
    },
    {
      name: "Logout",
      id: "navbar-dropdown-item-logout",
      className: "navMobileSubItem action",
      position: [3, 0],
    },
  ],
};
