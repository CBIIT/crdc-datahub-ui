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
    link: '',
    className: 'navMobileItem',
  },
  {
    name: 'Join CRDC Data Hub',
    link: '',
    className: 'navMobileItem clickable',
  },
  {
    name: 'About',
    link: '',
    className: 'navMobileItem clickable',
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
  "Join CRDC Data Hub": [
    {
      name: 'Become a CRDC Submitter',
      link: '/questionnaire/1234',
      className: 'navMobileSubItem',
    },
    {
      name: 'CRDC Intake Applications',
      link: '/crdcia',
      className: 'navMobileSubItem',
    },
],
  About: [
    {
      name: 'Other Resources',
      link: '/or',
      className: 'navMobileSubTitle',
    },
    {
      name: 'Cancer Genomics Cloud',
      link: '/cgc',
      className: 'navMobileSubItem',
    },
    {
      name: 'Database of Genotypes and Phenotypes',
      link: '/dbgap',
      className: 'navMobileSubItem',
    }],
};
