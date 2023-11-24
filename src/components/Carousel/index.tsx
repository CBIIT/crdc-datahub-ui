import { FC } from 'react';
import { styled } from '@mui/material';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

type Props = {
  children: React.ReactNode;
};

const sizing = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 3
  }
};

const StyledWrapper = styled('div')({
  maxWidth: "700px",
  margin: "0 auto",
  flexGrow: 1,
  "& .react-multi-carousel-list": {
    height: "206px",
  },
  "& .react-multi-carousel-list::after": {
    content: "''",
    position: "absolute",
    left: "calc(100% - 162px)",
    top: "0",
    bottom: "0",
    width: "162px",
    background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)",
    zIndex: 9,
  },
  "& .react-multi-carousel-list::before": {
    content: "''",
    position: "absolute",
    right: "calc(100% - 162px)",
    top: "0",
    bottom: "0",
    width: "162px",
    background: "linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%)",
    zIndex: 9,
  },
});

/**
 * Provides a general carousel component for displaying multiple items
 * at the same time.
 *
 * @param Props
 * @returns {JSX.Element}
 */
const ContentCarousel: FC<Props> = ({ children }: Props) => (
  <StyledWrapper>
    <Carousel
      responsive={sizing}
      swipeable
      draggable
      infinite
      centerMode
    >
      {children}
    </Carousel>
  </StyledWrapper>
);

export default ContentCarousel;
