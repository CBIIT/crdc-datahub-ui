import { styled } from '@mui/material';
import { ReactComponent as ChevronLeft } from "../../assets/icons/chevron_left.svg";

const StyledButton = styled('button')({
  color: "#3D4551",
  background: "transparent !important",
  transform: "translateX(10px)",
});

const CustomLeftArrow = (props) => (
  <StyledButton
    onClick={props?.onClick}
    aria-label="Paginate Left"
    type="button"
    className="react-multiple-carousel__arrow"
  >
    <ChevronLeft />
  </StyledButton>
);

export default CustomLeftArrow;
