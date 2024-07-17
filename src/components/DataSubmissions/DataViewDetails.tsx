import { useEffect } from "react";
import { Divider, Grid, Stack, styled, Typography } from "@mui/material";
import { useQuery } from "@apollo/client";
import { useSnackbar } from "notistack";
import { GET_NODE_DETAIL, GetNodeDetailInput, GetNodeDetailResp } from "../../graphql";
import { capitalizeFirstLetter } from "../../utils";
import RelatedNodes from "./RelatedNodes";
import SuspenseLoader from "../SuspenseLoader";

const StyledSectionDivider = styled(Divider)(() => ({
  "&.MuiDivider-root": {
    display: "flex",
    alignSelf: "flex-start",
    width: "2px",
    height: "103px",
    background: "#6CACDA",
    marginLeft: "44px",
    marginRight: "41.82px",
    marginTop: "2px",
  },
}));

const StyledNodeTypeWrapper = styled(Stack)(() => ({
  width: "fit-content",
  minWidth: "163px",
  maxWidth: "350px",
}));

const StyledLabel = styled(Typography)(() => ({
  color: "#000000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
}));

const StyledValue = styled(Typography)(() => ({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "19.6px",
}));

const StyledNodeTypeLabel = styled(Typography)(() => ({
  width: "100%",
  maxWidth: "100%",
  color: "#929292",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
}));

const StyledNodeTypeValue = styled(Typography)(() => ({
  width: "max-content",
  maxWidth: "100%",
  color: "#0B7F99",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: 900,
  lineHeight: "30px",
  textTransform: "capitalize",
  wordBreak: "break-word",
}));

type Props = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
};

const DataViewDetails = ({ submissionID, nodeType, nodeID }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const { data, loading, error } = useQuery<GetNodeDetailResp, GetNodeDetailInput>(
    GET_NODE_DETAIL,
    {
      variables: {
        submissionID,
        nodeType,
        nodeID,
      },
      skip: !submissionID || !nodeType || !nodeID,
      context: { clientName: "backend" },
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (!error && submissionID && nodeType && nodeID) {
      return;
    }
    enqueueSnackbar("Unable to load node details.", { variant: "error" });
  }, [error]);

  if (loading) {
    return <SuspenseLoader fullscreen={false} />;
  }

  const parents = data?.getNodeDetail?.parents
    ?.map((parent) => capitalizeFirstLetter(parent.nodeType))
    ?.join(", ");
  const children = data?.getNodeDetail?.children
    ?.map((child) => capitalizeFirstLetter(child.nodeType))
    ?.join(", ");

  return (
    <Stack direction="column">
      <Stack direction="row" alignItems="flex-start">
        <StyledNodeTypeWrapper direction="column">
          <StyledNodeTypeLabel variant="h5">Node Type</StyledNodeTypeLabel>
          <StyledNodeTypeValue variant="h6">{nodeType}</StyledNodeTypeValue>
        </StyledNodeTypeWrapper>
        <StyledSectionDivider orientation="vertical" />
        <Grid container flexDirection="row" rowSpacing="3px">
          <Grid xs={2} item>
            <StyledLabel variant="body1">{nodeType} ID</StyledLabel>
          </Grid>
          <Grid xs={10} item>
            <StyledValue variant="body1">{nodeID}</StyledValue>
          </Grid>

          <Grid xs={2} item>
            <StyledLabel variant="body1">Parent(s)</StyledLabel>
          </Grid>
          <Grid xs={10} item>
            <StyledValue variant="body1">{parents}</StyledValue>
          </Grid>

          <Grid xs={2} item>
            <StyledLabel variant="body1">Child(ren)</StyledLabel>
          </Grid>
          <Grid xs={10} item>
            <StyledValue variant="body1">{children}</StyledValue>
          </Grid>
        </Grid>
      </Stack>

      <RelatedNodes
        submissionID={submissionID}
        nodeType={nodeType}
        nodeID={nodeID}
        parentNodes={data?.getNodeDetail?.parents || []}
        childNodes={data?.getNodeDetail?.children || []}
      />
    </Stack>
  );
};

export default DataViewDetails;
