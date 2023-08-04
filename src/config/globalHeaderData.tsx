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
};
