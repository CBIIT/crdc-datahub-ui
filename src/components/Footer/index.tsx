import { useMediaQuery } from '@mui/material';
import FooterDesktop from './FooterDesktop';
import FooterTablet from './FooterTablet';
import FooterMobile from './FooterMobile';

const Footer = () => {
  const tablet = useMediaQuery("(min-width: 768px) and (max-width: 1024px)");
  const mobile = useMediaQuery("(max-width: 767px)");

  if (mobile) {
    return <FooterMobile />;
  }

  if (tablet) {
    return <FooterTablet />;
  }

  return <FooterDesktop />;
};

export default Footer;
