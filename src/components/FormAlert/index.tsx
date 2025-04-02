import { Alert, Container, styled } from "@mui/material";
import { memo } from "react";
import { useLocation } from "react-router-dom";

const StyledAlert = styled(Alert)({
  margin: "16px auto 0",
  padding: "16px",
});

type Props = {
  error?: string;
};

const FormAlert = ({ error }: Props) => {
  const { state } = useLocation();

  if (!state?.alert && !error) {
    return null;
  }

  return (
    <Container maxWidth="xl">
      <StyledAlert severity="error">{state?.error || error}</StyledAlert>
    </Container>
  );
};

export default memo(FormAlert);
