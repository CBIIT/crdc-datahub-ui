import { FC, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { cloneDeep } from "lodash";
import { Box, FormControl, MenuItem, Select, styled } from "@mui/material";
import { useQuery } from "@apollo/client";
import { compareNodeStats } from "../../utils";
import { SUBMISSION_STATS, SubmissionStatsResp } from "../../graphql";

export type SubmittedDataFiltersProps = {
  /**
   * The `_id` of the Data Submission
   *
   * @note The filters will not be fetched if this is not valid
   */
  submissionId: string;
  onChange?: (data: FilterForm) => void;
};

export type FilterForm = {
  nodeType: string;
};

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: "19px",
  paddingLeft: "24px",
});

const StyledFormControl = styled(FormControl)({
  margin: "10px",
  marginRight: "15px",
  minWidth: "250px",
});

const StyledInlineLabel = styled("label")({
  padding: "0 10px",
  fontWeight: "700"
});

const baseTextFieldStyles = {
  borderRadius: "8px",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    padding: "10px",
    height: "20px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
  "& .Mui-disabled": {
    cursor: "not-allowed",
  },
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiMenuItem-root.Mui-selected": {
    background: "#3E7E6D !important",
    color: "#FFFFFF !important",
  },
  "& .MuiMenuItem-root:hover": {
    background: "#D5EDE5",
  },
};

const StyledSelect = styled(Select)(baseTextFieldStyles);

export const SubmittedDataFilters: FC<SubmittedDataFiltersProps> = ({ submissionId, onChange }: SubmittedDataFiltersProps) => {
  const { watch, setValue, getValues, control } = useForm<FilterForm>();

  const { data } = useQuery<SubmissionStatsResp>(SUBMISSION_STATS, {
    variables: { id: submissionId, },
    context: { clientName: "backend" },
    skip: !submissionId,
    fetchPolicy: "cache-and-network"
  });

  const nodeTypes = useMemo(() => cloneDeep(data?.submissionStats?.stats)
    ?.sort(compareNodeStats)
    ?.reverse()
    ?.map((stat) => stat.nodeName), [data?.submissionStats?.stats]);

  useEffect(() => {
    if (!!watch("nodeType") || !nodeTypes?.length) {
      return;
    }

    setValue("nodeType", nodeTypes?.[0] || "");
  }, [nodeTypes]);

  useEffect(() => {
    onChange?.(getValues());
  }, [watch("nodeType")]);

  return (
    <StyledContainer>
      <StyledInlineLabel htmlFor="nodeType-filter">Node Type</StyledInlineLabel>
      <StyledFormControl>
        <Controller
          name="nodeType"
          control={control}
          render={({ field }) => (
            <StyledSelect
              {...field}
              defaultValue={nodeTypes?.[0] || ""}
              value={field.value || ""}
              MenuProps={{ disablePortal: true }}
              inputProps={{ id: "nodeType-filter" }}
              data-testid="data-content-node-filter"
            >
              {nodeTypes?.map((nodeType) => (
                <MenuItem
                  key={nodeType}
                  value={nodeType}
                  data-testid={`nodeType-${nodeType}`}
                >
                  {nodeType}
                </MenuItem>
              ))}
            </StyledSelect>
          )}
        />
      </StyledFormControl>
    </StyledContainer>
  );
};
