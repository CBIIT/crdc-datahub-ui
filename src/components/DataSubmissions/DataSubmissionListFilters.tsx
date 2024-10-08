import { useEffect, useRef, useState } from "react";
import { FormControl, IconButton, MenuItem, Grid, Box, styled, Stack } from "@mui/material";
import { debounce } from "lodash";
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
  color: "#327E8F",
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

type T = ListSubmissionsResp["listSubmissions"]["submissions"][0];

export type FilterForm = Pick<
  ListSubmissionsInput,
  "organization" | "status" | "dataCommons" | "name" | "dbGaPID" | "submitterName"
>;

type FilterFormKey = keyof FilterForm;

type TouchedState = { [K in FilterFormKey]: boolean };

type ColumnVisibilityModel = { [key: string]: boolean };

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
    defaultValues: {
      organization: "All",
      status: "All",
      dataCommons: "All",
      name: "",
      dbGaPID: "",
      submitterName: "All",
    },
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
  const serializedSearchParams = searchParams?.toString();
  const debounceAfter3CharsInputs: FilterFormKey[] = ["name", "dbGaPID"];
  const debouncedOnChangeRef = useRef(
    debounce((form: FilterForm) => onChange?.(form), 500)
  ).current;

  useEffect(() => {
    if (!activeOrganizations?.length) {
      return;
    }

    const organizationId = searchParams.get("organization");
    const status = searchParams.get("status");
    const dataCommon = searchParams.get("dataCommon");
    const name = searchParams.get("name");
    const dbGaPID = searchParams.get("dbGaPID");
    const submitterName = searchParams.get("submitterName");

    handleStatusChange(status);
    handleOrganizationChange(organizationId);

    if (dataCommon !== dataCommonsFilter && isDataCommonsFilterOption(dataCommon)) {
      setValue("dataCommons", dataCommon);
    }
    if (submitterName !== submitterNameFilter && isSubmitterNameFilterOption(submitterName)) {
      setValue("submitterName", submitterName);
    }
    if (name !== nameFilter) {
      setValue("name", name);
    }
    if (dbGaPID !== dbGaPIDFilter) {
      setValue("dbGaPID", dbGaPID);
    }

    if (Object.values(touchedFilters).every((filter) => !filter)) {
      onChange?.(getValues());
    }
  }, [activeOrganizations, canViewOtherOrgs, serializedSearchParams]);

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
        onChange?.(formValue);
      }

      // Immediately call the onChange if the change is not a debounce field
      onChange?.(formValue);
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedOnChangeRef]);

  const isValidOrg = (orgId: string) =>
    orgId && !!activeOrganizations?.find((org) => org._id === orgId);

  const isStatusFilterOption = (status: string): status is FilterForm["status"] =>
    ["All", ...statusValues].includes(status);

  const isDataCommonsFilterOption = (dataCommon: string): boolean =>
    ["All", ...dataCommons].includes(dataCommon);

  const isSubmitterNameFilterOption = (submitterName: string): boolean =>
    ["All", ...submitterNames].includes(submitterName);

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
    reset();
    searchParams.delete("organization");
    searchParams.delete("status");
    searchParams.delete("dataCommons");
    searchParams.delete("name");
    searchParams.delete("dbGaPID");
    searchParams.delete("submitterName");
  };

  return (
    <StyledFilters>
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
                    inputProps={{ id: "organization-filter" }}
                    readOnly={!canViewOtherOrgRoles.includes(user?.role)}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("organization");
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {activeOrganizations?.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
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
                    inputProps={{ id: "status-filter" }}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("status");
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {statusValues.map((value) => (
                      <MenuItem key={`submission_status_${value}`} value={value}>
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
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{ id: "data-commons-filter" }}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("dataCommons");
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {dataCommons?.map((dc) => (
                      <MenuItem key={dc} value={dc}>
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
              <StyledInlineLabel htmlFor="submission-name-filter">
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
                placeholder="Enter Name"
                inputProps={{ "aria-labelledby": "submission-name-filter" }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={4}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="dbGaPID-filter">dbGaP ID</StyledInlineLabel>
              <StyledTextField
                {...register("dbGaPID", {
                  setValueAs: (val) => val?.trim(),
                  onChange: () => handleFilterChange("dbGaPID"),
                })}
                size="small"
                inputProps={{ "aria-labelledby": "dbGaPID-filter" }}
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
                    value={field.value}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{ id: "submitter-name-filter" }}
                    onChange={(e) => {
                      field.onChange(e);
                      handleFilterChange("submitterName");
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {submitterNames?.map((submitter) => (
                      <MenuItem key={`submitter_${submitter}`} value={submitter}>
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
            <StyledIconButton onClick={handleResetFilters}>
              <StyledRefreshIcon />
            </StyledIconButton>
          </StyledActionWrapper>
          <StyledActionWrapper>
            <ColumnVisibilityButton
              columns={columns}
              getColumnKey={(column) => column.fieldKey ?? column.field}
              getColumnLabel={(column) => column.label?.toString()}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            />
          </StyledActionWrapper>
        </ActionButtonsContainer>
      </Stack>
    </StyledFilters>
  );
};

export default DataSubmissionListFilters;
