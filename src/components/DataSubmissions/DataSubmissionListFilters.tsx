import { memo, useEffect, useRef, useState } from "react";
import { FormControl, IconButton, MenuItem, Grid, Box, styled, Stack } from "@mui/material";
import { debounce, isEqual } from "lodash";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Controller, useForm } from "react-hook-form";
import StyledSelectFormComponent from "../StyledFormComponents/StyledSelect";
import StyledTextFieldFormComponent from "../StyledFormComponents/StyledOutlinedInput";
import ColumnVisibilityButton from "../GenericTable/ColumnVisibilityButton";
import { useOrganizationListContext } from "../Contexts/OrganizationListContext";
import { ListSubmissionsInput, ListSubmissionsResp } from "../../graphql";
import { useAuthContext } from "../Contexts/AuthContext";
import { canViewOtherOrgRoles } from "../../config/AuthRoles";
import { Column } from "../GenericTable";
import { useSearchParamsContext } from "../Contexts/SearchParamsContext";
import Tooltip from "../Tooltip";

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
  fontFamily: "'Nunito', 'Rubik', sans-serif !important",
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

const StyledRefreshIcon = styled(RefreshIcon)({
  transform: "scale(-1, 1)",
  color: "#346798",
  fontSize: "31px",
});

const StyledIconButton = styled(IconButton)({
  padding: 0,
  border: "1px solid #D0D0D0",
  borderRadius: "5px",
});

const StyledActionWrapper = styled(Box)({
  minWidth: "44px",
  width: "100%",
  height: "44px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
});

const ActionButtonsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
  gap: "9px",
});

const initialTouchedFields: TouchedState = {
  organization: false,
  status: false,
  dataCommons: false,
  name: false,
  dbGaPID: false,
  submitterName: false,
};

const statusValues: SubmissionStatus[] = [
  "New",
  "In Progress",
  "Submitted",
  "Released",
  "Withdrawn",
  "Rejected",
  "Completed",
  "Canceled",
  "Deleted",
];

const defaultValues: FilterForm = {
  organization: "All",
  status: "All",
  dataCommons: "All",
  name: "",
  dbGaPID: "",
  submitterName: "All",
};

type T = ListSubmissionsResp["listSubmissions"]["submissions"][0];

export type FilterForm = Pick<
  ListSubmissionsInput,
  "organization" | "status" | "dataCommons" | "name" | "dbGaPID" | "submitterName"
>;

type FilterFormKey = keyof FilterForm;

type TouchedState = { [K in FilterFormKey]: boolean };

type Props = {
  columns: Column<T>[];
  submitterNames: string[];
  dataCommons: string[];
  columnVisibilityModel: ColumnVisibilityModel;
  onColumnVisibilityModelChange: (model: ColumnVisibilityModel) => void;
  onChange?: (data: FilterForm) => void;
};

const DataSubmissionListFilters = ({
  columns,
  submitterNames,
  dataCommons,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  onChange,
}: Props) => {
  const { user } = useAuthContext();
  const { activeOrganizations } = useOrganizationListContext();
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const { control, register, watch, reset, setValue, getValues } = useForm<FilterForm>({
    defaultValues,
  });
  const [
    statusFilter,
    orgFilter,
    dataCommonsFilter,
    nameFilter,
    dbGaPIDFilter,
    submitterNameFilter,
  ] = watch(["status", "organization", "dataCommons", "name", "dbGaPID", "submitterName"]);

  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);

  const canViewOtherOrgs = canViewOtherOrgRoles.includes(user?.role);
  const debounceAfter3CharsInputs: FilterFormKey[] = ["name", "dbGaPID"];
  const debouncedOnChangeRef = useRef(
    debounce((form: FilterForm) => onChange?.(form), 500)
  ).current;

  useEffect(() => {
    // Reset submitterName filter if it is no longer a valid option
    // due to other filters changing
    if (
      submitterNameFilter !== "All" &&
      Object.values(touchedFilters).some((filter) => filter) &&
      !submitterNames?.includes(submitterNameFilter)
    ) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("submitterName");
      setSearchParams(newSearchParams);
      setValue("submitterName", "All");
    }
  }, [submitterNames, submitterNameFilter, touchedFilters]);

  useEffect(() => {
    if (!activeOrganizations?.length) {
      return;
    }

    const organizationId = searchParams.get("organization");
    const status = searchParams.get("status");
    const dataCommon = searchParams.get("dataCommons");
    const name = searchParams.get("name");
    const dbGaPID = searchParams.get("dbGaPID");
    const submitterName = searchParams.get("submitterName");

    handleStatusChange(status);
    handleOrganizationChange(organizationId);

    if (dataCommon && dataCommon !== dataCommonsFilter) {
      setValue("dataCommons", dataCommon);
    }
    if (submitterName && submitterName !== submitterNameFilter) {
      setValue("submitterName", submitterName);
    }
    if (name && name !== nameFilter) {
      setValue("name", name);
    }
    if (dbGaPID && dbGaPID !== dbGaPIDFilter) {
      setValue("dbGaPID", dbGaPID);
    }

    if (Object.values(touchedFilters).every((filter) => !filter)) {
      onChange?.(getValues());
    }
  }, [
    activeOrganizations,
    submitterNames,
    dataCommons,
    canViewOtherOrgs,
    searchParams?.toString(),
  ]);

  useEffect(() => {
    if (Object.values(touchedFilters).every((filter) => !filter)) {
      return;
    }

    const newSearchParams = new URLSearchParams(searchParams);

    if (canViewOtherOrgs && orgFilter && orgFilter !== "All") {
      newSearchParams.set("organization", orgFilter);
    } else if (orgFilter === "All") {
      newSearchParams.delete("organization");
    }
    if (statusFilter && statusFilter !== "All") {
      newSearchParams.set("status", statusFilter);
    } else if (statusFilter === "All") {
      newSearchParams.delete("status");
    }
    if (dataCommonsFilter && dataCommonsFilter !== "All") {
      newSearchParams.set("dataCommons", dataCommonsFilter);
    } else if (dataCommonsFilter === "All") {
      newSearchParams.delete("dataCommons");
    }
    if (submitterNameFilter && submitterNameFilter !== "All") {
      newSearchParams.set("submitterName", submitterNameFilter);
    } else if (submitterNameFilter === "All") {
      newSearchParams.delete("submitterName");
    }

    if (nameFilter) {
      newSearchParams.set("name", nameFilter);
    } else {
      newSearchParams.delete("name");
    }
    if (dbGaPIDFilter) {
      newSearchParams.set("dbGaPID", dbGaPIDFilter);
    } else {
      newSearchParams.delete("dbGaPID");
    }

    if (newSearchParams?.toString() !== searchParams?.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [
    orgFilter,
    statusFilter,
    dataCommonsFilter,
    nameFilter,
    dbGaPIDFilter,
    submitterNameFilter,
    touchedFilters,
  ]);

  useEffect(() => {
    const subscription = watch((formValue: FilterForm, { name }) => {
      // Add debounce for input fields
      const isDebounceField = debounceAfter3CharsInputs.includes(name as FilterFormKey);
      // Debounce if value has at least 3 characters
      if (isDebounceField && formValue[name]?.length >= 3) {
        debouncedOnChangeRef(formValue);
        return;
      }
      // Do nothing if values has between 0 and 3 (exclusive) characters
      if (isDebounceField && formValue[name]?.length > 0) {
        return;
      }
      // If value is cleared, call the onChange immediately
      if (isDebounceField && formValue[name]?.length === 0) {
        debouncedOnChangeRef.cancel();
        onChange?.(formValue);
        return;
      }

      // Immediately call the onChange if the change is not a debounce field
      onChange?.(formValue);
    });

    return () => {
      debouncedOnChangeRef.cancel();
      subscription.unsubscribe();
    };
  }, [watch, debouncedOnChangeRef]);

  const isValidOrg = (orgId: string) =>
    orgId && !!activeOrganizations?.find((org) => org._id === orgId);

  const isStatusFilterOption = (status: string): status is FilterForm["status"] =>
    ["All", ...statusValues].includes(status);

  const handleOrganizationChange = (organizationId: string) => {
    if (organizationId === orgFilter) {
      return;
    }

    if (!canViewOtherOrgs && isValidOrg(user?.organization?.orgID)) {
      setValue("organization", user.organization.orgID);
    } else if (canViewOtherOrgs && isValidOrg(organizationId)) {
      setValue("organization", organizationId);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === statusFilter) {
      return;
    }

    if (isStatusFilterOption(status)) {
      setValue("status", status);
    }
  };

  const handleFilterChange = (field: FilterFormKey) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  const handleResetFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    searchParams.delete("organization");
    searchParams.delete("status");
    searchParams.delete("dataCommons");
    searchParams.delete("name");
    searchParams.delete("dbGaPID");
    searchParams.delete("submitterName");
    setSearchParams(newSearchParams);
    reset({
      ...defaultValues,
      organization: canViewOtherOrgs ? "All" : user?.organization?.orgID,
    });
  };

  return (
    <StyledFilters data-testid="data-submission-list-filters">
      <Stack direction="row" alignItems="center" gap="12px">
        <Grid container spacing={2} rowSpacing="9px">
          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="organization-filter">Organization</StyledInlineLabel>
              <Controller
                name="organization"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{
                      id: "organization-filter",
                      "data-testid": "organization-select-input",
                    }}
                    data-testid="organization-select"
                    readOnly={!canViewOtherOrgs}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("organization");
                    }}
                  >
                    <MenuItem value="All" data-testid="organization-option-All">
                      All
                    </MenuItem>
                    {activeOrganizations?.map((org) => (
                      <MenuItem
                        key={org._id}
                        value={org._id}
                        data-testid={`organization-option-${org._id}`}
                      >
                        {org.name}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Status</StyledInlineLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{ id: "status-filter", "data-testid": "status-select-input" }}
                    data-testid="status-select"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("status");
                    }}
                  >
                    <MenuItem value="All" data-testid="status-option-All">
                      All
                    </MenuItem>
                    {statusValues.map((value) => (
                      <MenuItem
                        key={`submission_status_${value}`}
                        value={value}
                        data-testid={`status-option-${value}`}
                      >
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
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
                    value={dataCommons?.length ? field.value : "All"}
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
                    {dataCommons?.map((dc) => (
                      <MenuItem key={dc} value={dc} data-testid={`data-commons-option-${dc}`}>
                        {dc}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel id="submission-name-filter">
                Submission
                <br />
                Name
              </StyledInlineLabel>
              <StyledTextField
                {...register("name", {
                  setValueAs: (val) => val?.trim(),
                  onChange: () => handleFilterChange("name"),
                })}
                size="small"
                placeholder="Minimum 3 characters required"
                inputProps={{
                  "aria-labelledby": "submission-name-filter",
                  "data-testid": "submission-name-input",
                }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel id="dbGaPID-filter">dbGaP ID</StyledInlineLabel>
              <StyledTextField
                {...register("dbGaPID", {
                  setValueAs: (val) => val?.trim(),
                  onChange: () => handleFilterChange("dbGaPID"),
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
              <StyledInlineLabel htmlFor="submitter-name-filter">Submitter</StyledInlineLabel>
              <Controller
                name="submitterName"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    value={submitterNames?.includes(field.value) ? field.value : "All"}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{
                      id: "submitter-name-filter",
                      "data-testid": "submitter-name-select-input",
                    }}
                    data-testid="submitter-name-select"
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("submitterName");
                    }}
                  >
                    <MenuItem value="All" data-testid="submitter-name-option-All">
                      All
                    </MenuItem>
                    {submitterNames?.map((submitter) => (
                      <MenuItem
                        key={`submitter_${submitter}`}
                        value={submitter}
                        data-testid={`submitter-name-option-${submitter}`}
                      >
                        {submitter}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                )}
              />
            </StyledFormControl>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <ActionButtonsContainer>
          <StyledActionWrapper>
            <Tooltip
              open={undefined}
              title="Reset filters."
              placement="top"
              disableHoverListener={false}
            >
              <StyledIconButton
                onClick={handleResetFilters}
                data-testid="reset-filters-button"
                aria-label="Reset filters button"
              >
                <StyledRefreshIcon />
              </StyledIconButton>
            </Tooltip>
          </StyledActionWrapper>
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

export default memo(DataSubmissionListFilters, isEqual);
