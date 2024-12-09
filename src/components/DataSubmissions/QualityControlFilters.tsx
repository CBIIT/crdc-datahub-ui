import { memo, useEffect, useMemo, useState } from "react";
import { Box, FormControl, MenuItem, Stack, styled } from "@mui/material";
import { useQuery } from "@apollo/client";
import { cloneDeep } from "lodash";
import { Controller, useForm } from "react-hook-form";
import StyledFormSelect from "../StyledFormComponents/StyledSelect";
import {
  LIST_BATCHES,
  ListBatchesInput,
  ListBatchesResp,
  SUBMISSION_AGG_QC_RESULTS,
  SUBMISSION_STATS,
  SubmissionAggQCResultsInput,
  SubmissionAggQCResultsResp,
  SubmissionStatsInput,
  SubmissionStatsResp,
} from "../../graphql";
import { useSubmissionContext } from "../Contexts/SubmissionContext";
import { compareNodeStats, FormatDate } from "../../utils";

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "21px",
  paddingLeft: "17px",
  paddingRight: "17px",
  gap: "20px",
});

const StyledInlineLabel = styled("label")({
  color: "#083A50",
  fontWeight: 700,
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "19.6px",
  paddingRight: "8px",
});

const StyledFormControl = styled(FormControl)({
  minWidth: "200px",
});

const StyledSelect = styled(StyledFormSelect)(() => ({
  width: "200px",
}));

type TouchedState = { [K in keyof FilterForm]: boolean };

const initialTouchedFields: TouchedState = {
  issueType: false,
  nodeType: false,
  batchID: false,
  severity: false,
};

type FilterForm = {
  issueType: string;
  /**
   * The node type to filter by.
   *
   * @default "All"
   */
  nodeType: string;
  batchID: number | "All";
  severity: QCResult["severity"] | "All";
};

type Props = {
  onChange: (filters: FilterForm) => void;
};

const QualityControlFilters = ({ onChange }: Props) => {
  const { data: submissionData } = useSubmissionContext();
  const { _id: submissionID } = submissionData?.getSubmission || {};
  const { watch, control, getValues } = useForm<FilterForm>({
    defaultValues: {
      issueType: "All",
      batchID: "All",
      nodeType: "All",
      severity: "All",
    },
  });
  const [issueTypeFilter, nodeTypeFilter, batchIDFilter, severityFilter] = watch([
    "issueType",
    "nodeType",
    "batchID",
    "severity",
  ]);

  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const { data: issueTypes } = useQuery<SubmissionAggQCResultsResp, SubmissionAggQCResultsInput>(
    SUBMISSION_AGG_QC_RESULTS,
    {
      variables: {
        submissionID,
        partial: true,
        first: -1,
        orderBy: "title",
        sortDirection: "asc",
      },
      context: { clientName: "backend" },
      skip: !submissionID,
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: batchData } = useQuery<ListBatchesResp<true>, ListBatchesInput>(LIST_BATCHES, {
    variables: {
      submissionID,
      first: -1,
      offset: 0,
      partial: true,
      orderBy: "displayID",
      sortDirection: "asc",
    },
    context: { clientName: "backend" },
    skip: !submissionID,
    fetchPolicy: "cache-and-network",
  });

  const { data: submissionStats } = useQuery<SubmissionStatsResp, SubmissionStatsInput>(
    SUBMISSION_STATS,
    {
      variables: { id: submissionID },
      context: { clientName: "backend" },
      skip: !submissionID,
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (
      !touchedFilters.issueType &&
      !touchedFilters.nodeType &&
      !touchedFilters.batchID &&
      !touchedFilters.severity
    ) {
      return;
    }
    onChange(getValues());
  }, [issueTypeFilter, nodeTypeFilter, batchIDFilter, severityFilter]);

  const nodeTypes = useMemo<string[]>(
    () =>
      cloneDeep(submissionStats?.submissionStats?.stats)
        ?.filter((stat) => stat.error > 0 || stat.warning > 0)
        ?.sort(compareNodeStats)
        ?.map((stat) => stat.nodeName),
    [submissionStats?.submissionStats?.stats]
  );

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <StyledFilterContainer>
      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        <StyledInlineLabel htmlFor="batchID-filter">Issue Type</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="issueType"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                inputProps={{ id: "batchID-filter" }}
                data-testid="quality-control-batchID-filter"
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange("batchID");
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {issueTypes?.submissionAggQCResults?.results?.map((issue) => (
                  <MenuItem key={issue.code} value={issue.code} data-testid={issue.code}>
                    {issue.title}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          />
        </StyledFormControl>
      </Stack>

      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        <StyledInlineLabel htmlFor="batchID-filter">Batch ID</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="batchID"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                inputProps={{ id: "batchID-filter" }}
                data-testid="quality-control-batchID-filter"
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange("batchID");
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {batchData?.listBatches?.batches?.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id} data-testid={batch._id}>
                    {batch.displayID}
                    {` (${FormatDate(batch.createdAt, "MM/DD/YYYY")})`}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          />
        </StyledFormControl>
      </Stack>

      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        <StyledInlineLabel htmlFor="nodeType-filter">Node Type</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="nodeType"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                inputProps={{ id: "nodeType-filter" }}
                data-testid="quality-control-nodeType-filter"
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange("nodeType");
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {nodeTypes?.map((nodeType) => (
                  <MenuItem key={nodeType} value={nodeType} data-testid={`nodeType-${nodeType}`}>
                    {nodeType.toLowerCase()}
                  </MenuItem>
                ))}
              </StyledSelect>
            )}
          />
        </StyledFormControl>
      </Stack>

      <Stack direction="row" justifyContent="flex-start" alignItems="center">
        <StyledInlineLabel htmlFor="severity-filter">Severity</StyledInlineLabel>
        <StyledFormControl>
          <Controller
            name="severity"
            control={control}
            render={({ field }) => (
              <StyledSelect
                {...field}
                /* zIndex has to be higher than the SuspenseLoader to avoid cropping */
                MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                inputProps={{ id: "severity-filter" }}
                data-testid="quality-control-severity-filter"
                onChange={(e) => {
                  field.onChange(e);
                  handleFilterChange("severity");
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Error">Error</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
              </StyledSelect>
            )}
          />
        </StyledFormControl>
      </Stack>
    </StyledFilterContainer>
  );
};

export default memo(QualityControlFilters);
