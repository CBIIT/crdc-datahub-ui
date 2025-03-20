import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { Box, FormControl, MenuItem, styled } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import StyledOutlinedInput from "../../StyledFormComponents/StyledOutlinedInput";
import StyledSelect from "../../StyledFormComponents/StyledSelect";
import { useSearchParamsContext } from "../../Contexts/SearchParamsContext";

const StyledFilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingBottom: "10px",
});

const StyledInlineLabel = styled("label")({
  padding: "0 10px",
  fontWeight: "700",
});

const StyledFormControl = styled(FormControl)({
  margin: "10px",
  marginRight: "15px",
  minWidth: "250px",
});

const initialTouchedFields: TouchedState = {
  study: false,
  dbGaPID: false,
  accessType: false,
};

export type FilterForm = {
  study: string;
  dbGaPID: string;
  accessType: AccessType;
};

type TouchedState = { [K in keyof FilterForm]: boolean };

type Props = {
  onChange?: (data: FilterForm) => void;
};

const ApprovedStudyFilters = ({ onChange }: Props) => {
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const { watch, register, control, setValue, getValues } = useForm<FilterForm>({
    defaultValues: {
      study: "",
      dbGaPID: "",
      accessType: "All",
    },
  });
  const [studyFilter, dbGaPIDFilter, accessTypeFilter] = watch(["study", "dbGaPID", "accessType"]);
  const [touchedFilters, setTouchedFilters] = useState<TouchedState>(initialTouchedFields);
  const debouncedOnChangeRef = useRef(
    debounce((form: FilterForm) => onChange?.(form), 500)
  ).current;

  const isAccessTypeFilterOption = (accessType: string): accessType is FilterForm["accessType"] =>
    ["All", "Controlled", "Open"].includes(accessType);

  const handleAccessTypeChange = (accessType: string) => {
    if (accessType === accessTypeFilter) {
      return;
    }

    if (isAccessTypeFilterOption(accessType)) {
      setValue("accessType", accessType);
    }
  };

  useEffect(() => {
    const dbGaPID = searchParams.get("dbGaPID") || "";
    const study = searchParams.get("study") || "";
    const accessType = searchParams.get("accessType");

    if (dbGaPID !== dbGaPIDFilter) {
      setValue("dbGaPID", dbGaPID);
    }
    if (study !== studyFilter) {
      setValue("study", study);
    }
    handleAccessTypeChange(accessType);

    if (!touchedFilters.dbGaPID && !touchedFilters.study && !touchedFilters.accessType) {
      onChange?.(getValues());
    }
  }, [searchParams.get("dbGaPID"), searchParams.get("study"), searchParams.get("accessType")]);

  useEffect(() => {
    if (!touchedFilters.dbGaPID && !touchedFilters.study && !touchedFilters.accessType) {
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);

    if (dbGaPIDFilter) {
      newSearchParams.set("dbGaPID", dbGaPIDFilter);
    } else {
      newSearchParams.delete("dbGaPID");
    }
    if (studyFilter) {
      newSearchParams.set("study", studyFilter);
    } else {
      newSearchParams.delete("study");
    }
    if (accessTypeFilter && accessTypeFilter !== "All") {
      newSearchParams.set("accessType", accessTypeFilter);
    } else if (accessTypeFilter === "All") {
      newSearchParams.delete("accessType");
    }

    if (newSearchParams?.toString() !== searchParams?.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [dbGaPIDFilter, studyFilter, accessTypeFilter, touchedFilters]);

  useEffect(() => {
    const subscription = watch((formValue: FilterForm, { name }) => {
      // Add debounce for input fields
      if (name === "study" || name === "dbGaPID") {
        debouncedOnChangeRef(formValue);
        return;
      }

      // Immediately call the onChange if the change is not an input field
      onChange?.(formValue);
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedOnChangeRef]);

  const handleFilterChange = (field: keyof FilterForm) => {
    setTouchedFilters((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <StyledFilterContainer data-testid="approved-study-filters">
      <StyledInlineLabel htmlFor="study-filter">Study</StyledInlineLabel>
      <StyledFormControl>
        <StyledOutlinedInput
          {...register("study", {
            onChange: (e) => handleFilterChange("study"),
            setValueAs: (val) => val?.trim(),
          })}
          placeholder="Enter a Study"
          id="study-filter"
          required
          inputProps={{
            "data-testid": "study-input",
          }}
        />
      </StyledFormControl>
      <StyledInlineLabel htmlFor="dbGaPID-filter">dbGaPID</StyledInlineLabel>
      <StyledFormControl>
        <StyledOutlinedInput
          {...register("dbGaPID", {
            onChange: (e) => handleFilterChange("dbGaPID"),
            setValueAs: (val) => val?.trim(),
          })}
          placeholder="Enter a dbGaPID"
          id="dbGaPID-filter"
          required
          inputProps={{
            "data-testid": "dbGaPID-input",
          }}
        />
      </StyledFormControl>
      <StyledInlineLabel htmlFor="accessType-filter">Access Type</StyledInlineLabel>
      <StyledFormControl>
        <Controller
          name="accessType"
          control={control}
          render={({ field }) => (
            <StyledSelect
              {...field}
              value={field.value}
              MenuProps={{ disablePortal: true }}
              inputProps={{ id: "accessType-filter" }}
              data-testid="accessType-select"
              onChange={(e) => {
                field.onChange(e);
                handleFilterChange("accessType");
              }}
            >
              <MenuItem value="All" data-testid="accessType-option-All">
                All
              </MenuItem>
              <MenuItem value="Controlled" data-testid="accessType-option-Controlled">
                Controlled
              </MenuItem>
              <MenuItem value="Open" data-testid="accessType-option-Open">
                Open
              </MenuItem>
            </StyledSelect>
          )}
        />
      </StyledFormControl>
    </StyledFilterContainer>
  );
};

export default ApprovedStudyFilters;
