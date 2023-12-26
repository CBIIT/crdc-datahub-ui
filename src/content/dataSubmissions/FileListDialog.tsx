import { useMemo } from "react";
import { Box, Button, Dialog, DialogProps, Grid, IconButton, Stack, Typography, styled } from "@mui/material";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import GenericTable, { Column } from "../../components/DataSubmissions/GenericTable";

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    maxWidth: "none",
    width: "731px !important",
    padding: "38px 42px 52px",
    borderRadius: "8px",
    border: "2px solid #13B9DD",
    background: "linear-gradient(0deg, #F2F6FA 0%, #F2F6FA 100%), #2E4D7B",
    boxShadow: "0px 4px 45px 0px rgba(0, 0, 0, 0.40)",
  },
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

const StyledCloseButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "42px",
  padding: "12px 60px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  color: "#000",
  textAlign: "center",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  alignSelf: "center",
  marginTop: "45px",
  "&:hover": {
    background: "transparent",
    border: "1px solid #000",
  }
});

const StyledHeader = styled(Typography)({
  color: "#929292",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "27px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "2px"
});

const StyledTitle = styled(Typography)({
  color: "#0B7F99",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "35px",
  fontStyle: "normal",
  fontWeight: "900",
  lineHeight: "30px",
  marginBottom: "60px"
});

const StyledSummaryProperty = styled(Typography)({
  color: "#000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
});

const StyledSummaryPropertySubtitle = styled(Typography)({
  color: "#000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "10px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "15px",
  letterSpacing: "0.4px",
  textTransform: "uppercase",
});

const StyledSummaryValue = styled(Typography)({
  color: "#595959",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "19.6px",
  textTransform: "capitalize",
});

const StyledFileName = styled(Typography)({
  color: "#0D78C5",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  textDecorationLine: "underline",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
});

const columns: Column<BatchFileInfo>[] = [
  {
    label: "Node Type",
    renderValue: (data) => <Box textTransform="capitalize">Participant</Box>, // TODO: FIX
    field: "fileName",
    default: true
  },
  {
    label: "Filename",
    renderValue: (data) => <StyledFileName>{data?.fileName}</StyledFileName>,
    field: "fileName",
  },
];

type Props = {
  batch: Batch;
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

const FileListDialog = ({
  batch,
  onClose,
  open,
  ...rest
}: Props) => {
  const handleCloseDialog = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const batchType = useMemo(() => {
    if (!batch) {
      return "";
    }
    if (batch.type === "metadata") {
      return `${batch.metadataIntention} ${batch.type}`;
    }
    return "Data Files"; // TODO: Add "Delete Files"
  }, [batch]);

  return (
    <StyledDialog open={open} onClose={handleCloseDialog} title="" {...rest}>
      <StyledCloseDialogButton aria-label="close" onClick={handleCloseDialog}>
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3">Data Upload</StyledHeader>
      <StyledTitle variant="h6">Batch Details</StyledTitle>

      <Grid container rowSpacing={2.625} marginBottom={7.125}>
        <Grid md={3} xs={12} item>
          <StyledSummaryProperty>
            Batch Type
          </StyledSummaryProperty>
        </Grid>
        <Grid md={9} xs={12} item>
          <StyledSummaryValue>
            {batchType}
          </StyledSummaryValue>
        </Grid>
        <Grid md={3} xs={12} item>
          <Stack direction="column">
            <StyledSummaryProperty>
              Total File Count
            </StyledSummaryProperty>
            <StyledSummaryPropertySubtitle>
              Included in batch
            </StyledSummaryPropertySubtitle>
          </Stack>
        </Grid>
        <Grid md={9} xs={12} item>
          <StyledSummaryValue>
            {batch?.files?.length || 0}
          </StyledSummaryValue>
        </Grid>
        <Grid md={3} xs={12} item>
          <StyledSummaryProperty>
            Status
          </StyledSummaryProperty>
        </Grid>
        <Grid md={9} xs={12} item>
          <StyledSummaryValue>
            {batch?.status}
          </StyledSummaryValue>
        </Grid>
      </Grid>

      <GenericTable
        columns={columns}
        data={batch?.files || []}
        total={batch?.fileCount || 0}
        loading={false}
        defaultRowsPerPage={20}
        onFetchData={() => {}}
        setItemKey={(item, idx) => `${idx}_${item.size}_${item.fileName}`}
      />

      <StyledCloseButton
        id="file-list-dialog-close-button"
        variant="outlined"
        onClick={handleCloseDialog}
      >
        Close
      </StyledCloseButton>
    </StyledDialog>
  );
};

export default FileListDialog;
