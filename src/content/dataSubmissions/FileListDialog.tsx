import { useState } from "react";
import { Box, Button, Dialog, DialogProps, IconButton, Typography, styled } from "@mui/material";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import GenericTable, { Column, FetchListing } from "../../components/DataSubmissions/GenericTable";
import { LIST_BATCH_FILES, listBatchFilesResp } from "../../graphql";
import { FormatDate } from "../../utils";

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
});

const StyledSubtitle = styled(Typography)({
  color: "#595959",
  fontFamily: "'Nunito Sans', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "19.6px",
  marginTop: "8px",
  marginBottom: "40px"
});

const StyledNumberOfFiles = styled(Typography)({
  color: "#453D3D",
  fontFamily: "'Public Sans', sans-serif",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "19.6px",
  letterSpacing: "0.52px",
  textTransform: "uppercase",
  marginBottom: "21px"
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

const columns: Column<BatchFile>[] = [
  {
    label: "Node Type",
    renderValue: (data) => <Box textTransform="capitalize">{data?.nodeType}</Box>,
    field: "nodeType",
    default: true
  },
  {
    label: "Filename",
    renderValue: (data) => <StyledFileName>{data?.fileName}</StyledFileName>,
    field: "fileName",
    sx: {
      width: "70%"
    }
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
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [totalBatchFiles, setTotalBatchFiles] = useState<number>(0);
  const [prevBatchFilesFetch, setPrevBatchFilesFetch] = useState<FetchListing<BatchFile>>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [listBatchFiles] = useLazyQuery<listBatchFilesResp>(LIST_BATCH_FILES, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleCloseDialog = () => {
    setBatchFiles([]);
    setTotalBatchFiles(0);
    setPrevBatchFilesFetch(null);
    setError(null);
    setLoading(false);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleFetchBatchFiles = async (fetchListing: FetchListing<BatchFile>, force: boolean) => {
    const { first, offset, sortDirection, orderBy } = fetchListing || {};
    if (!batch?._id || !batch?.submissionID) {
      setError("Invalid submission ID provided.");
      return;
    }
    if (!force && batchFiles?.length > 0 && isEqual(fetchListing, prevBatchFilesFetch)) {
      return;
    }

    setPrevBatchFilesFetch(fetchListing);

    try {
      setLoading(true);
      const { data: newBatchFiles, error: batchFilesError } = await listBatchFiles({
        variables: {
          submissionID: batch.submissionID,
          batchID: batch._id,
          first,
          offset,
          sortDirection,
          orderBy
        },
        context: { clientName: 'backend' },
        fetchPolicy: 'no-cache'
      });
      if (batchFilesError || !newBatchFiles?.listBatchFiles) {
        throw Error();
      }
      setBatchFiles(newBatchFiles.listBatchFiles.batchFiles);
      setTotalBatchFiles(newBatchFiles.listBatchFiles.total);
    } catch (err) {
      setError("Unable to retrieve batch file data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledDialog open={open} onClose={handleCloseDialog} title="" {...rest}>
      <StyledCloseDialogButton aria-label="close" onClick={handleCloseDialog}>
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3">Data Submission</StyledHeader>
      <StyledTitle variant="h6">
        Batch
        {" "}
        {batch?.displayID}
        {" "}
        File List
      </StyledTitle>
      <StyledSubtitle variant="body1">
        Uploaded on
        {" "}
        {FormatDate(batch?.createdAt, "M/D/YYYY [at] hh:mm A")}
      </StyledSubtitle>

      <StyledNumberOfFiles>
        {`${totalBatchFiles} FILES`}
      </StyledNumberOfFiles>

      <GenericTable
        columns={columns}
        data={batchFiles}
        total={totalBatchFiles}
        loading={loading}
        defaultOrder="asc"
        defaultRowsPerPage={20}
        onFetchData={handleFetchBatchFiles}
        setItemKey={(item, idx) => `${idx}_${item.batchID}_${item.fileName}`}
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
