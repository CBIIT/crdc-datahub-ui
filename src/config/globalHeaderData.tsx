import Logo from "../assets/header/Portal_Logo.svg";
import LogoSmall from "../assets/header/Portal_Logo_Small.svg";
import usaFlagSmall from "../assets/header/us_flag_small.svg";
import { DataCommons } from "./DataCommons";

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
    link: "https://datacommons.cancer.gov/",
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
    name: "API Documentation",
    link: "/playground",
    id: "navbar-dropdown-graphql-playground",
    className: "navMobileItem",
  },
  {
    name: "Model Navigator",
    link: "#",
    id: "navbar-dropdown-model-navigator",
    className: "navMobileItem clickable",
  },
];

export const navbarSublists = {
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
};
