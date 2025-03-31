import React, { FC, useCallback, useId, useMemo, useState } from "react";
import {
  Button,
  DialogProps,
  IconButton,
  Stack,
  TableContainerProps,
  Typography,
  styled,
} from "@mui/material";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import { ReactComponent as DownloadIcon } from "../../assets/icons/download_icon.svg";
import StyledCloseDialogButton from "../StyledDialogComponents/StyledDialogCloseButton";
import DefaultDialog from "../StyledDialogComponents/StyledDialog";
import DefaultDialogHeader from "../StyledDialogComponents/StyledHeader";
import GenericTable, { Column } from "../GenericTable";
import { FormatDate, Logger, paginateAndSort } from "../../utils";
import FileListContext, { FileListContextState } from "./Contexts/FileListContext";
import {
  DOWNLOAD_METADATA_FILE,
  DownloadMetadataFileInput,
  DownloadMetadataFileResp,
} from "../../graphql";

const StyledDialog = styled(DefaultDialog)({
  "& .MuiDialog-paper": {
    width: "731px !important",
    padding: "38px 42px 52px",
    border: "2px solid #13B9DD",
  },
});

const StyledCloseButton = styled(Button)({
  minWidth: "137px",
  padding: "10px",
  border: "1px solid #000",
  color: "#000",
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

const StyledTitle = styled(DefaultDialogHeader)({
  fontSize: "35px",
  marginBottom: "0 !important",
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
});

const StyledNodeType = styled(Typography)({
  color: "#083A50",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "20px",
  textTransform: "capitalize",
  wordBreak: "break-all",
});

const StyledFileName = styled(Typography)({
  color: "#083A50",
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

const StyledIconButton = styled(IconButton)(({ disabled }) => ({
  cursor: disabled ? "not-allowed" : "pointer",
  padding: "0px",
  minWidth: "unset",
}));

const StyledDownloadIcon = styled(DownloadIcon)({
  color: "inherit",
});

const StyledButton = styled(LoadingButton)({
  textTransform: "none",
  backgroundColor: "#5C8FA7",
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: 500,
  borderRadius: "6px",
  "&:hover": {
    backgroundColor: "#5C8FA7",
    color: "#FFFFFF",
  },
});

const columns: Column<BatchFileInfo>[] = [
  {
    label: "Type",
    renderValue: (data) => <StyledNodeType>{data?.nodeType || "N/A"}</StyledNodeType>,
    field: "nodeType",
    default: true,
    sx: {
      width: "35%",
    },
  },
  {
    label: "Filename",
    renderValue: (data) => <StyledFileName>{data?.fileName}</StyledFileName>,
    field: "fileName",
    sx: {
      width: "60%",
    },
  },
  {
    label: "",
    fieldKey: "download-action",
    renderValue: ({ fileName }: BatchFileInfo) => (
      <FileListContext.Consumer>
        {({ handleDownloadClick, disabled }) => (
          <StyledIconButton
            onClick={() => handleDownloadClick(fileName)}
            disabled={disabled}
            aria-label={`Download ${fileName}`}
            data-testid={`download-${fileName}-button`}
          >
            <StyledDownloadIcon />
          </StyledIconButton>
        )}
      </FileListContext.Consumer>
    ),
    sortDisabled: true,
    sx: {
      width: "5%",
    },
  },
];

type FileListDialogProps = {
  /**
   * The batch to display the files for
   */
  batch: Batch;
  /**
   * Handler called when the dialog is closed
   */
  onClose?: () => void;
} & Omit<DialogProps, "onClose">;

/**
 * Provides a table display of the files uploaded for a particular batch.
 *
 * @returns The FileListDialog component
 */
const FileListDialog: FC<FileListDialogProps> = ({
  open,
  batch,
  onClose,
  ...rest
}: FileListDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const headerId = useId();

  const [batchFiles, setBatchFiles] = useState<BatchFileInfo[]>([]);
  const [prevBatchFilesFetch, setPrevBatchFilesFetch] = useState<FetchListing<BatchFileInfo>>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  const [downloadFile] = useMutation<DownloadMetadataFileResp, DownloadMetadataFileInput>(
    DOWNLOAD_METADATA_FILE,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const formattedCount = useMemo<string>(
    () => `${batch?.fileCount || 0} FILE${batch?.fileCount !== 1 ? "S" : ""}`,
    [batch?.fileCount]
  );

  const handleCloseDialog = () => {
    setBatchFiles([]);
    setPrevBatchFilesFetch(null);
    onClose?.();
  };

  const handleFetchBatchFiles = useCallback(
    async (fetchListing: FetchListing<BatchFileInfo>, force: boolean) => {
      if (!force && batchFiles?.length > 0 && isEqual(fetchListing, prevBatchFilesFetch)) {
        return;
      }

      setPrevBatchFilesFetch(fetchListing);

      const newData = paginateAndSort(batch?.files, fetchListing);
      setBatchFiles(newData);
    },
    [batch, batchFiles, prevBatchFilesFetch, setPrevBatchFilesFetch, setBatchFiles]
  );

  const handleDownload = useCallback(
    async (fileName: string = null) => {
      setDownloading(true);

      try {
        const d = await downloadFile({
          variables: { batchID: batch._id, fileName },
        });

        if (!d.data?.downloadMetadataFile) {
          throw new Error("No download URL returned");
        }

        window.open(d.data.downloadMetadataFile, "_blank", "noopener");
      } catch (error) {
        Logger.error("FileListDialog: Unable to get presigned URL.", error);
        enqueueSnackbar(`Download Failed: There was an issue with the download.`, {
          variant: "error",
        });
      } finally {
        setDownloading(false);
      }
    },
    [batch?._id, downloadFile, enqueueSnackbar, setDownloading]
  );

  const contextState = useMemo<FileListContextState>(
    () => ({
      handleDownloadClick: (fileName: string) => handleDownload(fileName),
      disabled: downloading,
    }),
    [handleDownload, downloading]
  );

  return (
    <StyledDialog
      open={open}
      onClose={handleCloseDialog}
      data-testid="file-list-dialog"
      scroll="body"
      aria-labelledby={headerId}
      {...rest}
    >
      <StyledCloseDialogButton
        aria-label="close"
        onClick={handleCloseDialog}
        data-testid="file-list-close-icon"
      >
        <CloseIconSvg />
      </StyledCloseDialogButton>
      <StyledHeader variant="overline">Data Submission</StyledHeader>
      <StyledTitle variant="h6" id={headerId}>
        Batch {batch?.displayID} File List
      </StyledTitle>
      <StyledSubtitle variant="body1">
        Uploaded on {FormatDate(batch?.createdAt, "M/D/YYYY [at] hh:mm A")}
      </StyledSubtitle>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <StyledNumberOfFiles>{formattedCount}</StyledNumberOfFiles>
        <StyledButton
          endIcon={<StyledDownloadIcon />}
          onClick={() => handleDownload()}
          disabled={!batch?.fileCount}
          loading={downloading}
          data-testid="download-all-button"
        >
          Download entire batch
        </StyledButton>
      </Stack>

      <FileListContext.Provider value={contextState}>
        <GenericTable
          columns={columns}
          data={batchFiles}
          total={batch?.fileCount || 0}
          loading={false}
          defaultOrder="asc"
          defaultRowsPerPage={20}
          paginationPlacement="center"
          noContentText="No files were uploaded."
          numRowsNoContent={5}
          onFetchData={handleFetchBatchFiles}
          setItemKey={(item, idx) => `${idx}_${item.fileName}_${item.createdAt}`}
          containerProps={{ sx: tableContainerSx }}
        />
      </FileListContext.Provider>

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

export default React.memo<FileListDialogProps>(FileListDialog, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
