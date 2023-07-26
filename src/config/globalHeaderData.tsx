import Logo from '../assets/header/Portal_Logo.svg';
import LogoSmall from '../assets/header/Portal_Logo_Small.svg';
import searchbarIcon from '../assets/header/Search_Icon.svg';
import usaFlagSmall from '../assets/header/us_flag_small.svg';

// globalHeaderLogo image 468x100
// globalHeaderImage: image 2200x100
export const headerData = {
  globalHeaderLogo: Logo,
  globalHeaderLogoSmall: LogoSmall,
  globalHeaderLogoLink: '/',
  globalHeaderLogoAltText: 'Portal Logo',
  globalHeaderSearchIcon: searchbarIcon,
  globalHeaderSearchIconAltText: 'search Icon',
  usaFlagSmall,
  usaFlagSmallAltText: 'usaFlagSmall',
};

export const navMobileList = [
  {
    name: 'Home',
    link: '/',
    id: 'navbar-link-home',
    className: 'navMobileItem',
  },
  {
    name: 'Submission Requests',
    link: '/submissions',
    id: 'navbar-dropdown-join-crdc-data-hub',
    className: 'navMobileItem',
    needsAuthentication: true,
  },
  {
    name: 'Data Submissions',
    link: '/dataSubmissionsTodo',
    id: 'navbar-dropdown-join-crdc-data-hub',
    className: 'navMobileItem',
  },
  {
    name: 'CRDC Data Commons',
    link: 'https://datacommons.cancer.gov/',
    id: 'navbar-dropdown-join-crdc-data-hub',
    className: 'navMobileItem',
  },
  {
    name: 'About',
    link: '/aboutTodo',
    id: 'navbar-dropdown-about',
    className: 'navMobileItem',
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
  //   "Join CRDC Data Hub": [
  //     {
  //       name: 'Become a CRDC Submitter',
  //       link: '/todo', // TODO: update link to help docs
  //       id: 'navbar-dropdown-item-become-a-crdc-submitter',
  //       className: 'navMobileSubItem',
  //     },
  //     {
  //       name: 'CRDC Submission Requests',
  //       link: '/submissions',
  //       id: 'navbar-dropdown-item-crdc-submission-requests',
  //       className: 'navMobileSubItem',
  //       needsAuthentication: true,
  //     },
  // ],
  //   About: [
  //     {
  //       name: 'Other Resources',
  //       link: '/or',
  //       id: 'navbar-dropdown-item-other-resources',
  //       className: 'navMobileSubTitle',
  //     },
  //     {
  //       name: 'Cancer Genomics Cloud',
  //       link: '/cgc',
  //       id: 'navbar-dropdown-item-cancer-genomics-cloud',
  //       className: 'navMobileSubItem',
  //     },
  //     {
  //       name: 'Database of Genotypes and Phenotypes',
  //       link: '/dbgap',
  //       id: 'navbar-dropdown-item-database-of-genotypes-and-phenotypes',
  //       className: 'navMobileSubItem',
  //     }],
};
