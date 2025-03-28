import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogProps,
  IconButton,
  TableContainerProps,
  Typography,
  styled,
} from "@mui/material";
import { isEqual } from "lodash";
import CloseIconSvg from "../../assets/icons/close_icon.svg?react";
import GenericTable, { Column } from "../GenericTable";
import { FormatDate, paginateAndSort } from "../../utils";

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
  position: "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
}));

const StyledCloseButton = styled(Button)({
  minWidth: "137px",
  padding: "10px",
  border: "1px solid #000",
  color: "#000",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  margin: "0 auto",
  marginTop: "62px",
  "&:hover": {
    background: "transparent",
    border: "1px solid #000",
  },
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
  marginBottom: "2px",
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
  marginBottom: "40px",
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
  marginBottom: "21px",
});

const StyledNodeType = styled(Typography)({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "20px",
  textTransform: "capitalize",
  wordBreak: "break-all",
});

const StyledFileName = styled(Typography)({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "20px",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
  wordBreak: "break-all",
});

const tableContainerSx: TableContainerProps["sx"] = {
  "& .MuiTableHead-root .MuiTableCell-root:first-of-type": {
    paddingLeft: "26px",
    paddingY: "16px",
  },
  "& .MuiTableHead-root .MuiTableCell-root:last-of-type": {
    paddingRight: "26px",
    paddingY: "16px",
  },
  "& .MuiTableBody-root .MuiTableCell-root:first-of-type": {
    paddingLeft: "26px",
  },
  "& .MuiTableBody-root .MuiTableCell-root:last-of-type": {
    paddingRight: "26px",
  },
  "& .MuiTableBody-root .MuiTableCell-root": {
    paddingY: "7px",
  },
  "& .MuiTableBody-root .MuiTableRow-root": {
    height: "35px",
  },
};

const columns: Column<BatchFileInfo>[] = [
  {
    label: "Type",
    renderValue: (data) => <StyledNodeType>{data?.nodeType || "N/A"}</StyledNodeType>,
    field: "nodeType",
    default: true,
  },
  {
    label: "Filename",
    renderValue: (data) => <StyledFileName>{data?.fileName}</StyledFileName>,
    field: "fileName",
    sx: {
      width: "70%",
    },
  },
];

type Props = {
  batch: Batch;
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

const FileListDialog = ({ batch, onClose, open, ...rest }: Props) => {
  const [batchFiles, setBatchFiles] = useState<BatchFileInfo[]>([]);
  const [prevBatchFilesFetch, setPrevBatchFilesFetch] = useState<FetchListing<BatchFileInfo>>(null);

  const [, setError] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setBatchFiles([]);
    setPrevBatchFilesFetch(null);
    setError(null);
    setLoading(false);
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleFetchBatchFiles = async (
    fetchListing: FetchListing<BatchFileInfo>,
    force: boolean
  ) => {
    if (!batch?._id || !batch?.submissionID) {
      setError("Invalid submission ID provided.");
      return;
    }
    if (!force && batchFiles?.length > 0 && isEqual(fetchListing, prevBatchFilesFetch)) {
      return;
    }

    setPrevBatchFilesFetch(fetchListing);

    const newData = paginateAndSort(batch?.files, fetchListing);
    setBatchFiles(newData);
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleCloseDialog}
      title=""
      data-testid="file-list-dialog"
      scroll="body"
      {...rest}
    >
      <StyledCloseDialogButton
        aria-label="close"
        onClick={handleCloseDialog}
        data-testid="file-list-close-icon"
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="h3">Data Submission</StyledHeader>
      <StyledTitle variant="h6">Batch {batch?.displayID} File List</StyledTitle>
      <StyledSubtitle variant="body1">
        Uploaded on {FormatDate(batch?.createdAt, "M/D/YYYY [at] hh:mm A")}
      </StyledSubtitle>

      <StyledNumberOfFiles>{`${batch?.fileCount || 0} FILES`}</StyledNumberOfFiles>

      <GenericTable
        columns={columns}
        data={batchFiles}
        total={batch?.fileCount || 0}
        loading={loading}
        defaultOrder="asc"
        defaultRowsPerPage={20}
        paginationPlacement="center"
        noContentText="No files were uploaded."
        numRowsNoContent={5}
        onFetchData={handleFetchBatchFiles}
        setItemKey={(item, idx) => `${idx}_${item.fileName}_${item.createdAt}`}
        containerProps={{ sx: tableContainerSx }}
      />

      <StyledCloseButton
        id="file-list-dialog-close-button"
        data-testid="file-list-close-button"
        variant="contained"
        color="info"
        onClick={handleCloseDialog}
      >
        Close
      </StyledCloseButton>
    </StyledDialog>
  );
};

export default React.memo<Props>(FileListDialog, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
