import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyQuery } from "@apollo/client";
import { isEqual } from "lodash";
import { Box, Button, styled } from "@mui/material";
import { useSnackbar } from "notistack";
import { LIST_BATCHES, ListBatchesResp } from "../../graphql";
import GenericTable, { Column } from "../../components/GenericTable";
import BatchTableContext from "./Contexts/BatchTableContext";
import {
  SubmissionCtxStatus,
  useSubmissionContext,
} from "../../components/Contexts/SubmissionContext";
import { FormatDate } from "../../utils";
import FileListDialog from "../../components/FileListDialog";
import ErrorDetailsDialog from "../../components/ErrorDetailsDialog";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";

const StyledDateTooltip = styled(StyledTooltip)({
  cursor: "pointer",
});

const StyledRejectedStatus = styled("div")({
  color: "#B54717",
  fontWeight: 600,
});

const StyledFileCountButton = styled(Button)({
  color: "#0B6CB1",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  textDecorationLine: "underline",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
  "&:hover": {
    background: "transparent",
    textDecorationLine: "underline",
  },
});

const StyledErrorDetailsButton = styled(Button)({
  color: "#0B6CB1",
  fontFamily: "Inter",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 600,
  lineHeight: "19px",
  textDecorationLine: "underline",
  textTransform: "none",
  padding: 0,
  justifyContent: "flex-start",
  "&:hover": {
    background: "transparent",
    textDecorationLine: "underline",
  },
});

const columns: Column<Batch>[] = [
  {
    label: "Batch ID",
    renderValue: (data) => data.displayID,
    field: "displayID",
  },
  {
    label: "Batch Type",
    renderValue: (data) => <Box textTransform="capitalize">{data?.type}</Box>,
    field: "type",
  },
  {
    label: "File Count",
    renderValue: (data) => (
      <BatchTableContext.Consumer>
        {({ handleOpenFileListDialog }) => (
          <StyledFileCountButton
            data-testid={`activity-file-count-${data?._id}`}
            onClick={() => handleOpenFileListDialog && handleOpenFileListDialog(data)}
            variant="text"
            disableRipple
            disableTouchRipple
            disableFocusRipple
          >
            {Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(data?.fileCount || 0)}
          </StyledFileCountButton>
        )}
      </BatchTableContext.Consumer>
    ),
    field: "fileCount",
  },
  {
    label: "Status",
    renderValue: (data) => (
      <Box textTransform="capitalize">
        {data.status === "Failed" ? (
          <StyledRejectedStatus>{data.status}</StyledRejectedStatus>
        ) : (
          data.status
        )}
      </Box>
    ),
    field: "status",
  },
  {
    label: "Uploaded Date",
    renderValue: (data) => (
      <StyledDateTooltip title={FormatDate(data.createdAt, "M/D/YYYY h:mm A")} placement="top">
        <span data-testid={`activity-uploaded-date-${data?._id}`}>
          {FormatDate(data.createdAt, "M/D/YYYY")}
        </span>
      </StyledDateTooltip>
    ),
    field: "createdAt",
    default: true,
    sx: {
      minWidth: "92px",
    },
  },
  {
    label: "Uploaded By",
    renderValue: (data) => data?.submitterName || "",
    field: "submitterName",
  },
  {
    label: "Upload Errors",
    renderValue: (data) => (
      <BatchTableContext.Consumer>
        {({ handleOpenErrorDialog }) => {
          if (!data?.errors?.length || !handleOpenErrorDialog) {
            return null;
          }

          return (
            <StyledErrorDetailsButton
              onClick={() => handleOpenErrorDialog && handleOpenErrorDialog(data)}
              data-testid={`activity-error-count-${data?._id}`}
              variant="text"
              disableRipple
              disableTouchRipple
              disableFocusRipple
            >
              {`${data.errors.length} ${data.errors.length === 1 ? "Error" : "Errors"}`}
            </StyledErrorDetailsButton>
          );
        }}
      </BatchTableContext.Consumer>
    ),
    field: "errors",
    sortDisabled: true,
  },
];

export type DataActivityRef = {
  /**
   * A reference to the nest table methods.
   */
  tableRef: TableMethods;
};

const DataActivity = forwardRef<DataActivityRef>((_, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: dataSubmission,
    refetch: getSubmission,
    status: submissionStatus,
  } = useSubmissionContext();
  const { _id: submissionId } = dataSubmission?.getSubmission || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Batch[]>([]);
  const [prevData, setPrevData] = useState<FetchListing<Batch>>(null);
  const [totalData, setTotalData] = useState<number>(0);
  const [hasUploadingBatches, setHasUploadingBatches] = useState<boolean>(false);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [openFileListDialog, setOpenFileListDialog] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<Batch | null>(null);
  const [startPollingFn, setPollingFn] = useState<((pollInterval: number) => void) | null>(null);
  const [stopPollingFn, setStopPollingFn] = useState<(() => void) | null>(null);

  const tableRef = useRef<TableMethods>(null);

  const [listBatches] = useLazyQuery<ListBatchesResp>(LIST_BATCHES, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: ListBatchesResp) => {
      setData(data.listBatches.batches);
      setTotalData(data.listBatches.total);
      setHasUploadingBatches(data.batchStatusList.batches.some((b) => b.status === "Uploading"));
    },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const handleOpenErrorDialog = useCallback(
    (data: Batch) => {
      setOpenErrorDialog(true);
      setSelectedRow(data);
    },
    [setOpenErrorDialog, setSelectedRow]
  );

  const handleOpenFileListDialog = useCallback(
    (data: Batch) => {
      setOpenFileListDialog(true);
      setSelectedRow(data);
    },
    [setOpenFileListDialog, setSelectedRow]
  );

  const handleFetchBatches = useCallback(
    async (fetchListing: FetchListing<Batch>, force: boolean) => {
      const { first, offset, sortDirection, orderBy } = fetchListing || {};
      if (!submissionId) {
        return;
      }
      if (!force && data?.length > 0 && isEqual(fetchListing, prevData)) {
        return;
      }

      setPrevData(fetchListing);

      try {
        setLoading(true);
        const {
          data: newBatchFiles,
          error: batchFilesError,
          startPolling,
          stopPolling,
        } = await listBatches({
          variables: {
            submissionID: submissionId,
            first,
            offset,
            sortDirection,
            orderBy,
          },
        });

        if (batchFilesError || !newBatchFiles?.listBatches) {
          throw new Error("Unable to retrieve batch data.");
        }

        const hasUploading = newBatchFiles.batchStatusList?.batches?.some(
          (b) => b.status === "Uploading"
        );

        if (hasUploading) {
          setPollingFn(() => startPolling);
          setStopPollingFn(() => stopPolling);
        }
      } catch (err) {
        enqueueSnackbar("Unable to retrieve batch data.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [submissionId, data.length, prevData, listBatches, enqueueSnackbar, setLoading]
  );

  const batchContextValue = useMemo(
    () => ({
      handleOpenErrorDialog,
      handleOpenFileListDialog,
    }),
    [handleOpenErrorDialog, handleOpenFileListDialog]
  );

  useImperativeHandle(
    ref,
    () => ({
      tableRef: tableRef.current,
    }),
    [tableRef.current]
  );

  useEffect(() => {
    if (!hasUploadingBatches && stopPollingFn) {
      stopPollingFn();

      setPollingFn(null);
      setStopPollingFn(null);
      return;
    }
    if (hasUploadingBatches && startPollingFn) {
      startPollingFn(1000);

      // If the submission is not polling, refetch to kick-off polling
      if (submissionStatus !== SubmissionCtxStatus.POLLING) {
        getSubmission();
      }
    }
  }, [hasUploadingBatches, stopPollingFn, startPollingFn]);

  useEffect(() => {
    tableRef?.current?.refresh();
  }, [submissionId]);

  return (
    <>
      <BatchTableContext.Provider value={batchContextValue}>
        <GenericTable
          ref={tableRef}
          columns={columns}
          data={data || []}
          total={totalData || 0}
          loading={loading}
          defaultRowsPerPage={20}
          onFetchData={handleFetchBatches}
          containerProps={{ sx: { marginBottom: "8px" } }}
        />
      </BatchTableContext.Provider>
      <ErrorDetailsDialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        header="Data Submission"
        title={`Batch ${selectedRow?.displayID || ""} Upload Errors`}
        errors={selectedRow?.errors}
        uploadedDate={dataSubmission?.getSubmission?.createdAt}
      />
      <FileListDialog
        open={openFileListDialog}
        batch={selectedRow}
        onClose={() => setOpenFileListDialog(false)}
      />
    </>
  );
});

export default React.memo(DataActivity, (prevProps, nextProps) => isEqual(prevProps, nextProps));
