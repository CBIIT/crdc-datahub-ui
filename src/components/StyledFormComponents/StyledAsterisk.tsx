import { styled } from "@mui/material";

const Asterisk = styled("span")(() => ({
  color: "#C93F08",
  marginLeft: "2px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "18.8px",
}));

const StyledAsterisk = () => <Asterisk>*</Asterisk>;

export default StyledAsterisk;
