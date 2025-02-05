import { memo, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { isEqual } from "lodash";
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  styled,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { isStringLengthBetween } from "../../utils";
import { ListApplicationsInput, ListApplicationsResp } from "../../graphql";
import StyledSelectFormComponent from "../../components/StyledFormComponents/StyledSelect";
import StyledTextFieldFormComponent from "../../components/StyledFormComponents/StyledOutlinedInput";
import StyledAutocompleteFormComponent from "../../components/StyledFormComponents/StyledAutocomplete";
import { useDebouncedWatch } from "../../hooks/useDebouncedWatch";
import Tooltip from "../../components/Tooltip";

export type FilterForm = Pick<
  ListApplicationsInput,
  "programName" | "studyName" | "statuses" | "submitterName"
>;

export type FilterProps = {
  applicationData: ListApplicationsResp["listApplications"];
  onChange?: (data: FilterForm) => void;
};

const StyledContainer = styled(Box)({
  padding: "15px 32px 15px 32px",
});

const StyledFormControl = styled(FormControl)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "5px",
});

const StyledInlineLabel = styled("label")({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "16px",
  textAlign: "right",
});

const StyledSelect = styled(StyledSelectFormComponent)({
  width: "298.25px",
});

const StyledTextField = styled(StyledTextFieldFormComponent)({
  width: "298.25px",
});

const StyledAutocomplete = styled(StyledAutocompleteFormComponent)({
  width: "298.25px",
});

const StyledRefreshIcon = styled(RefreshIcon)({
  transform: "scale(-1, 1)",
  color: "#346798",
  fontSize: "31px",
});

const StyledActionWrapper = styled(Box)({
  minWidth: "31px",
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
  paddingTop: "21px",
});

const StyledIconButton = styled(IconButton)({
  padding: 0,
  border: "1px solid #D0D0D0",
  borderRadius: "5px",
});

export const DEFAULT_STATUSES_SELECTED: ApplicationStatus[] = [
  "New",
  "In Progress",
  "Submitted",
  "In Review",
  "Inquired",
];

export const defaultValues: FilterForm = {
  programName: "All",
  studyName: "",
  statuses: DEFAULT_STATUSES_SELECTED,
  submitterName: "",
};

const FIELDS_TO_DEBOUNCE: (keyof FilterForm)[] = [
  "studyName",
  "submitterName",
  "programName",
  "statuses",
];

const MIN_LENGTHS: { [K in keyof FilterForm]: number } = {
  studyName: 3,
  submitterName: 3,
  programName: 0,
  statuses: 0,
};

const statusValues: ApplicationStatus[] = [
  "New",
  "In Progress",
  "Submitted",
  "In Review",
  "Inquired",
  "Approved",
  "Rejected",
  "Canceled",
  "Deleted",
];

/**
 * A component that provides filters for the Cross Validation table
 *
 * @see {@link FilterProps} for the props
 */
const ListFilters = ({ applicationData, onChange }: FilterProps) => {
  const { watch, setValue, control, register, reset } = useForm<FilterForm>({ defaultValues });

  const handleFormChange = useCallback((form: FilterForm) => {
    if (!onChange || !form) {
      return;
    }

    const newForm: FilterForm = {
      ...form,
      studyName: form.studyName?.length >= 3 ? form.studyName : "",
      submitterName: form.submitterName?.length >= 3 ? form.submitterName : "",
    };

    onChange(newForm);
  }, []);

  useDebouncedWatch<FilterForm>({
    watch,
    fieldsToDebounce: FIELDS_TO_DEBOUNCE,
    minLengths: MIN_LENGTHS,
    defaultMinLength: 3,
    debounceMs: 500,
    onChange: handleFormChange,
  });
  const [programNameFilter] = watch(["programName"]);

  const programOptions = useMemo(() => {
    const programs = applicationData?.programs?.filter((p) => !!p) || [];
    return ["All", ...programs];
  }, [applicationData?.programs]);

  const handleResetFilters = () => {
    const newForm: FilterForm = { ...defaultValues };

    reset(newForm);
    handleFormChange(newForm);
  };

  return (
    <StyledContainer>
      <Stack direction="row" alignItems="center">
        <Grid container>
          <Grid item xs={3}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Submitter Name</StyledInlineLabel>
              <StyledTextField
                {...register("submitterName", {
                  setValueAs: (val) => val?.trim(),
                  onBlur: (e) =>
                    isStringLengthBetween(e?.target?.value, 0, 3) && setValue("submitterName", ""),
                })}
                size="small"
                placeholder="Minimum 3 characters required"
                inputProps={{
                  "aria-labelledby": "submitter-name-filter",
                  "data-testid": "submitter-name-input",
                }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={3}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="programName-filter">Program</StyledInlineLabel>
              <Controller
                name="programName"
                control={control}
                render={({ field }) => (
                  <StyledAutocomplete
                    disablePortal={false}
                    {...field}
                    renderInput={({ inputProps, ...params }) => (
                      <TextField
                        {...params}
                        placeholder="Select programs"
                        inputProps={{
                          "aria-labelledby": "programName-filter",
                          required: !programNameFilter?.length,
                          ...inputProps,
                        }}
                      />
                    )}
                    onChange={(_, value) => {
                      field.onChange(value);
                    }}
                    options={programOptions}
                    slotProps={{
                      popper: {
                        sx: {
                          zIndex: 99999,
                        },
                      },
                    }}
                    disableCloseOnSelect
                  />
                )}
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={3}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Study</StyledInlineLabel>
              <StyledTextField
                {...register("studyName", {
                  setValueAs: (val) => val?.trim(),
                  onBlur: (e) =>
                    isStringLengthBetween(e?.target?.value, 0, 3) && setValue("studyName", ""),
                })}
                size="small"
                placeholder="Minimum 3 characters required"
                inputProps={{
                  "aria-labelledby": "study-name-filter",
                  "data-testid": "study-name-input",
                }}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={3}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Status</StyledInlineLabel>
              <Controller
                name="statuses"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 99999 } }}
                    inputProps={{ id: "status-filter" }}
                    renderValue={(selected: string[]) =>
                      selected?.length > 1 ? `${selected.length} statuses selected` : selected
                    }
                    data-testid="application-status-filter"
                    multiple
                  >
                    {statusValues?.map((status) => (
                      <MenuItem
                        key={`application_status_${status}`}
                        data-testid={`application-status-${status}`}
                        value={status}
                      >
                        {status}
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
        </ActionButtonsContainer>
      </Stack>
    </StyledContainer>
  );
};

export default memo(ListFilters, isEqual);
