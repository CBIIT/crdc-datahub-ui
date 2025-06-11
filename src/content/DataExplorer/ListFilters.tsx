/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { Box, FormControl, Grid, MenuItem, Stack, styled } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { ListReleasedStudiesInput, ListReleasedStudiesResp } from "../../graphql";
import StyledSelectFormComponent from "../../components/StyledFormComponents/StyledSelect";
import StyledTextFieldFormComponent from "../../components/StyledFormComponents/StyledOutlinedInput";
import { isStringLengthBetween } from "../../utils";
import ColumnVisibilityButton from "../../components/GenericTable/ColumnVisibilityButton";
import { Column } from "../../components/GenericTable";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";

const StyledFilters = styled("div")({
  paddingTop: "19px",
  paddingBottom: "15px",
  paddingLeft: "38px",
  paddingRight: "26px",
});

const StyledFormControl = styled(FormControl)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "15px",
});

const StyledInlineLabel = styled("label")({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "16px",
  minWidth: "100px",
  textAlign: "right",
});

const StyledSelect = styled(StyledSelectFormComponent)({
  width: "280px",
});

const StyledTextField = styled(StyledTextFieldFormComponent)({
  width: "280px",
});

const ActionButtonsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
  gap: "9px",
});

const StyledActionWrapper = styled(Box)({
  minWidth: "44px",
  width: "100%",
  height: "44px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
});

const initialTouchedFields: TouchedState = {
  name: false,
  dbGaPID: false,
  dataCommons: false,
};

export const defaultValues: FilterForm = {
  name: "",
  dbGaPID: "",
  dataCommons: ["All"],
};

type T = ListReleasedStudiesResp["listReleasedStudies"]["studies"][number];

type TouchedState = { [K in keyof FilterForm]: boolean };

export type FilterForm = Pick<ListReleasedStudiesInput, "name" | "dbGaPID" | "dataCommons">;

type Props = {
  data: ListReleasedStudiesResp["listReleasedStudies"];
  columns: Column<T>[];
  columnVisibilityModel: ColumnVisibilityModel;
  onColumnVisibilityModelChange: (model: ColumnVisibilityModel) => void;
  onChange?: (data: FilterForm) => void;
};

const ListFilters = ({
  data,
  columns,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  onChange,
}: Props) => {
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const { control, register, watch, reset, setValue, getValues } = useForm<FilterForm>({
    defaultValues,
  });

  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const handleResetFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    searchParams.delete("program");
    searchParams.delete("status");
    searchParams.delete("dataCommons");
    searchParams.delete("name");
    searchParams.delete("dbGaPID");
    searchParams.delete("submitterName");
    setSearchParams(newSearchParams);
    reset({ ...defaultValues });
  };

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <StyledFilters data-testid="data-submission-list-filters">
      <Stack direction="row" alignItems="center" gap="12px">
        <Grid container spacing={2} rowSpacing="9px">
          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="study-filter">Study</StyledInlineLabel>
              <StyledTextField
                {...register("name", {
                  setValueAs: (val) => val?.trim(),
                  onChange: () => handleFilterChange("name"),
                  onBlur: (e) =>
                    isStringLengthBetween(e?.target?.value, 0, 3) && setValue("name", ""),
                })}
                size="small"
                placeholder="Minimum 3 characters required"
                inputProps={{
                  "aria-labelledby": "name-filter",
                  "data-testid": "name-input",
                }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="study-filter">dbGapID</StyledInlineLabel>
              <StyledTextField
                {...register("dbGaPID", {
                  setValueAs: (val) => val?.trim(),
                  onChange: () => handleFilterChange("dbGaPID"),
                  onBlur: (e) =>
                    isStringLengthBetween(e?.target?.value, 0, 3) && setValue("dbGaPID", ""),
                })}
                size="small"
                placeholder="Minimum 3 characters required"
                inputProps={{
                  "aria-labelledby": "dbGaPID-filter",
                  "data-testid": "dbGaPID-input",
                }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="data-commons-filter">
                Data
                <br />
                Commons
              </StyledInlineLabel>
              <Controller
                name="dataCommons"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{
                      id: "data-commons-filter",
                      "data-testid": "data-commons-select-input",
                    }}
                    data-testid="data-commons-select"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("dataCommons");
                    }}
                  >
                    <MenuItem value="All" data-testid="data-commons-option-All">
                      All
                    </MenuItem>
                    {data?.dataCommons?.map((dc, index) => (
                      <MenuItem key={dc} value={dc} data-testid={`data-commons-option-${dc}`}>
                        {data?.dataCommons?.[index]}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
          </Grid>
        </Grid>

        <ActionButtonsContainer>
          <StyledActionWrapper>
            <ColumnVisibilityButton
              columns={columns}
              getColumnKey={(column) => column.fieldKey ?? column.field}
              getColumnLabel={(column) => column.label?.toString()}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={onColumnVisibilityModelChange}
              data-testid="column-visibility-button"
            />
          </StyledActionWrapper>
        </ActionButtonsContainer>
      </Stack>
    </StyledFilters>
  );
};

export default ListFilters;
