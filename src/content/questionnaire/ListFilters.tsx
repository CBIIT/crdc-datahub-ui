import { forwardRef, memo, useEffect } from "react";
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
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { isStringLengthBetween } from "../../utils";
import { ListApplicationsInput, ListApplicationsResp } from "../../graphql";
import StyledSelectFormComponent from "../../components/StyledFormComponents/StyledSelect";
import StyledTextFieldFormComponent from "../../components/StyledFormComponents/StyledOutlinedInput";
import StyledAutocompleteFormComponent from "../../components/StyledFormComponents/StyledAutocomplete";
import { useDebouncedWatch } from "../../hooks/useDebouncedWatch";

export type FilterForm = Pick<
  ListApplicationsInput,
  "programName" | "studyName" | "statues" | "submitterName"
>;

export type FilterProps = {
  applicationData: ListApplicationsResp["listApplications"];
  loading?: boolean;
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
});

const StyledIconButton = styled(IconButton)({
  padding: 0,
  border: "1px solid #D0D0D0",
  borderRadius: "5px",
});

const DEFAULT_STATUSES_SELECTED: ApplicationStatus[] = [
  "New",
  "In Progress",
  "Submitted",
  "Inquired",
];

const defaultValues: FilterForm = {
  programName: "",
  studyName: "",
  statues: [],
  submitterName: "",
};

/**
 * A component that provides filters for the Cross Validation table
 *
 * @see {@link FilterProps} for the props
 */
const ListFilters = forwardRef<null, FilterProps>(({ applicationData, loading, onChange }, ref) => {
  const { watch, setValue, control, register, reset } = useForm<FilterForm>({ defaultValues });
  useDebouncedWatch<FilterForm>({
    watch,
    fieldsToDebounce: ["studyName", "submitterName"],
    minLength: 3,
    debounceMs: 500,
    onChange: (form) => handleFormChange(form),
  });
  const [programNameFilter, statusesFilter] = watch(["programName", "statues"]);

  useEffect(() => {
    const foundDefaultStatuses = DEFAULT_STATUSES_SELECTED.filter(
      (status) => applicationData?.status?.includes(status)
    );

    if (statusesFilter === foundDefaultStatuses) {
      return;
    }

    setValue("statues", foundDefaultStatuses);
  }, [applicationData?.status]);

  const handleFormChange = (form: FilterForm) => {
    if (!onChange || !form) {
      return;
    }

    const newForm: FilterForm = {
      ...form,
      studyName: form.studyName?.length >= 3 ? form.studyName : "",
      submitterName: form.submitterName?.length >= 3 ? form.submitterName : "",
    };

    onChange(newForm);
  };

  const handleResetFilters = () => {
    reset({ ...defaultValues });
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
                disabled={loading}
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
                rules={{ required: true }}
                render={({ field }) => (
                  <StyledAutocomplete
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
                    options={applicationData?.programs || []}
                    loading={loading}
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
                disabled={loading}
                required
              />
            </StyledFormControl>
          </Grid>

          <Grid item xs={3}>
            <StyledFormControl>
              <StyledInlineLabel htmlFor="status-filter">Status</StyledInlineLabel>
              <Controller
                name="statues"
                control={control}
                render={({ field }) => (
                  <StyledSelect
                    {...field}
                    MenuProps={{ disablePortal: true }}
                    inputProps={{ id: "status-filter" }}
                    data-testid="application-status-filter"
                    disabled={loading}
                    multiple
                  >
                    {applicationData?.status?.map((status) => (
                      <MenuItem key={`application_status_${status}`} value={status}>
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
});

export default memo(ListFilters, isEqual);
