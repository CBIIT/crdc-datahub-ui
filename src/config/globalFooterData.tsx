import env from '../env';
import instagramIcon from '../assets/footer/Instgram_Logo.svg';
import twitterIcon from '../assets/footer/Twitter_Logo.svg';
import facebookIcon from '../assets/footer/Facebook_Logo.svg';
import youtubeIcon from '../assets/footer/Youtube_Logo.svg';
import linkedInIcon from '../assets/footer/LinkedIn_Logo.svg';
// footerLogoImage ideal image size 310x80 px

export default {
  footerLogoImage: 'https://raw.githubusercontent.com/cbiit/datacommons-assets/main/bento/images/icons/png/footerlogo.png',
  footerLogoAltText: 'Footer Logo',
  footerLogoHyperlink: 'https://www.cancer.gov/',
  footerStaticText: 'NIH … Turning Discovery Into Health®',
  version: env.REACT_APP_FE_VERSION,
  BEversion: env.REACT_APP_BE_VERSION,
  // A maximum of 3 Subsections (link_sections) are allowed
  // A maximum of 4 Subsection Links ('items' under link_sections) are allowed
  // A maximum of 4 Anchor Links (global_footer_links) are allowed
  // Ideal size for icon is 20x20 px
  link_sections: [
    {
      title: 'About',
      items: [
        {
          text: 'About CRDC Data Hub',
          link: 'https://datacommons.cancer.gov/',
        },
        {
          text: 'About CRDC',
          link: 'https://datacommons.cancer.gov/',
        },
        {
          text: 'Contact CRDC Hub',
          link: 'mailto:CRDCSubmissions@nih.gov',
        },
      ],
    }, {
      title: 'Resources',
      items: [
        {
          text: 'Contact Us',
          link: 'mailto:CRDCHelpDesk@nih.gov',
        },
        {
          text: 'Publications',
          link: 'https://www.cancer.gov/publications',
        },
        {
          text: 'Dictionary of Cancer Terms',
          link: 'https://www.cancer.gov/publications/dictionaries/cancer-terms',
        },
        {
          text: 'Find a Clinical Trial',
          link: 'https://www.cancer.gov/policies/disclaimer',
        },
      ],
    },
    {
      title: 'Policies',
      items: [
        {
          text: 'Accessibility',
          link: 'https://www.cancer.gov/policies/accessibility',
        },
        {
          text: 'FOIA',
          link: 'https://www.cancer.gov/policies/foia',
        },
        {
          text: 'Privacy & Security',
          link: 'https://www.cancer.gov/policies/privacy-security',
        },
        {
          text: 'Disclaimer',
          link: 'https://www.cancer.gov/policies/disclaimer',
        },
        {
          text: 'Vulnerability Disclosure',
          link: 'https://www.hhs.gov/vulnerability-disclosure-policy/index.html',
        },
      ],
    },
  ],
  followUs_links: [
    {
      img: instagramIcon,
      link: 'https://www.instagram.com/nationalcancerinstitute/',
      description: 'instagramIcon',
    },
    {
      img: twitterIcon,
      link: 'https://twitter.com/thenci',
      description: 'twitterIcon',
    },
    {
      img: facebookIcon,
      link: 'https://www.facebook.com/cancer.gov',
      description: 'facebookIcon',

    },
    {
      img: youtubeIcon,
      link: 'https://www.youtube.com/NCIgov',
      description: 'youtubeIcon',

    },
    {
      img: linkedInIcon,
      link: 'https://www.linkedin.com/company/nationalcancerinstitute/',
      description: 'linkedInIcon',

    }
  ],
  contact_links: [
    {
      text: 'Live chat',
      link: 'https://livehelp.cancer.gov/',
    },
    {
      text: '1-800-4-CANCER',
      link: 'tel:+18004226237',
    },
    {
      text: 'NCIinfo@nih.gov',
      link: 'mailto:+NCIinfo@nih.gov',
    },
    {
      text: 'Site Feedback',
      link: 'https://nci.az1.qualtrics.com/jfe/form/SV_aeLLobt6ZeGVn5I',
    },
  ],
  global_footer_links: [
    {
      text: 'U.S. Department of Health and Human Services',
      link: 'https://www.hhs.gov',
    },
    {
      text: 'National Institutes of Health',
      link: 'https://www.nih.gov',
    },
    {
      text: 'National Cancer Institute',
      link: 'https://www.cancer.gov',
    },
    {
      text: 'USA.gov',
      link: 'https://www.usa.gov',
    },
  ],
};
