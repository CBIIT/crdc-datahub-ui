import { Button, Container, Stack, Typography, styled } from "@mui/material";
import { FC } from "react";

const StyledPageTitle = styled(Typography)({
  maxWidth: "611px",
  height: "79px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flexShrink: 0,
  color: "#3E577C",
  fontSize: "45px",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontWeight: 800,
  lineHeight: "40px",
  letterSpacing: "-1.5px",
  margin: 0,
});

const StyledPageDescription = styled(Typography)({
  fontSize: "16px",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontWeight: 400,
  color: "#000",
  marginTop: "16px",
});

const StyledCopyTokenButton = styled(Button)({
  marginTop: "16px",
  marginBottom: "4px",
  maxWidth: "300px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "1px dashed #B3B3B3",
  color: "#004A80",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "17px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#1A5874",
    borderColor: "#DDE6EF",
    color: "#DDE6EF",
  },
});

const StyledGenerateButton = styled(Button)({
  marginTop: "16px",
  marginBottom: "4px",
  width: "fit-content",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 20px",
  borderRadius: "8px",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "17px",
  letterSpacing: "0.32px",
  textTransform: "none",
  background: "#1D91AB",
  color: "#FFF",
  "&:hover": {
    background: "#1A7B90",
  },
});

type Props = {
  _id: string;
};

const APIToken: FC<Props> = ({ _id }) => {
  console.log("HERE");
  return (
    <Container maxWidth="xl">
      <Stack direction="column" alignItems="center">
        <StyledPageTitle variant="h4">
          API Token
        </StyledPageTitle>
        <StyledPageDescription variant="body1">
          API Tokens can be used to make API calls when using the Uploader CLI tool to upload your files. The token will expire 60 days after it's created.
        </StyledPageDescription>
        <StyledCopyTokenButton>
          *************************
        </StyledCopyTokenButton>
        <StyledGenerateButton>
          Generate Token
        </StyledGenerateButton>
      </Stack>
    </Container>
  );
};

export default APIToken;
