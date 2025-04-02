import { Box, Container, styled } from "@mui/material";
import usePageTitle from "../../hooks/usePageTitle";
import FormAlert from "../../components/FormAlert";
import PageBanner from "../../components/PageBanner";
import PageBannerBody from "../../components/PageBanner/PageBannerBody";

const StyledContainer = styled(Container)({
  marginTop: "-180px",
  paddingBottom: "90px",
});

type Props = {
  _id: string;
};

const ListView = ({ _id }: Props) => {
  usePageTitle("Manage Institutions");

  return (
    <Box data-testid="list-institutions-container">
      <FormAlert error="An error occurred while loading the data." />

      <PageBanner
        title="Manage Institutions"
        subTitle=""
        padding="38px 0 0 25px"
        body={<PageBannerBody label="Add Institution" to="/institution/new" />}
      />

      <StyledContainer maxWidth="xl">{/* Table */}</StyledContainer>
    </Box>
  );
};

export default ListView;
