import { FC, useEffect, useMemo, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery } from "@apollo/client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  query as approvedStudiesQuery,
  Response as approvedStudiesRespone,
} from "../../graphql/listApprovedStudiesOfMyOrganization";
import {
  mutation as CREATE_SUBMISSION,
  Response as CreateSubmissionResp,
} from "../../graphql/createSubmission";
import RadioInput from "../../components/DataSubmissions/RadioInput";
import { DataCommons } from "../../config/DataCommons";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import StyledSelect from "../../components/StyledFormComponents/StyledSelect";
import StyledOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import StyledAsterisk from "../../components/StyledFormComponents/StyledAsterisk";
import StyledLabel from "../../components/StyledFormComponents/StyledLabel";
import BaseStyledHelperText from "../../components/StyledFormComponents/StyledHelperText";

const CreateSubmissionDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "725px",
    height: "fit-content",
    borderRadius: "8px",
    border: "2px solid #5ab8ff",
    background: "#f2f6fa",
    maxWidth: "none",
    maxHeight: "none",
    overflow: "hidden",
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  paddingTop: "39px",
  paddingLeft: "74px",
});

const StyledHeader = styled(Typography)({
  fontFamily: "'Nunito Sans'",
  fontSize: "45px",
  fontWeight: 800,
  lineHeight: "40px",
  letterSpacing: "-1.5px",
  textAlign: "left",
  color: "#1873bd",
  minHeight: "79px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const StyledSubHeader = styled(Typography)({
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "22px",
  letterSpacing: 0,
  textAlign: "left",
});

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: "1px",
});

const StyledButton = styled(LoadingButton)({
  height: "51px",
  width: "261px",
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  letterSpacing: "2%",
  lineHeight: "20.14px",
  borderRadius: "8px",
  color: "#fff",
  textTransform: "none",
  borderColor: "#005EA2 !important",
  background: "#005EA2 !important",
  marginRight: "25px",

  "&.Mui-disabled": {
    cursor: "not-allowed",
    pointerEvents: "all",
  },
});

const StyledDialogActions = styled(DialogActions)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: "65px",
});

const StyledDialogError = styled(Typography)({
  color: "#c93f08",
  textAlign: "center",
});

const StyledDialogButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "50.59px",
  padding: "12px 36.5px 14.59px 36.5px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  textDecoration: "none",
  color: "rgba(0, 0, 0, 0.87)",
  alignSelf: "center",
  cursor: "pointer",
  textTransform: "none",
  letterSpacing: "2%",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute !important" as "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C",
  },
}));

const StyledFormWrapper = styled(Box)(() => ({
  alignSelf: "center",
  width: "485px",
  minHeight: "450px",
  marginTop: "24px",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: 0,
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  "& .formControl": {
    marginTop: "0 !important",
    marginBottom: "0 !important",
  },
}));

const StyledRadioInput = styled(RadioInput)(() => ({
  marginLeft: "2px",
  marginTop: "5px",
  "& .MuiRadio-root": {
    padding: "4px 7px 4px 4px",
  },
  "& .MuiFormControlLabel-root": {
    marginRight: "0 !important",
    paddingRight: "10px !important",
  },
}));

const StyledField = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  flexDirection: "column",
});

const StyledOrganizationField = styled(StyledField)({
  marginBottom: "25px",
});

const StyledHelperText = styled(BaseStyledHelperText)({
  marginTop: "5px",
});

const StyledOutlinedInputMultiline = styled(StyledOutlinedInput)({
  height: "96px",
});

type CreateSubmissionParams = Pick<
  Submission,
  "studyAbbreviation" | "dataCommons" | "name" | "dbGaPID" | "intention" | "dataType"
>;

type Props = {
  organizations: Partial<Organization>[];
  onCreate: (data: CreateSubmissionParams) => void;
};

const CreateDataSubmissionDialog: FC<Props> = ({ organizations, onCreate }) => {
  const { user } = useAuthContext();
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateSubmissionParams>({
    defaultValues: {
      dataCommons: "CDS",
      studyAbbreviation: "",
      intention: "New/Update",
      dataType: "Metadata and Data Files",
      dbGaPID: "",
      name: "",
    },
  });

  const [creatingSubmission, setCreatingSubmission] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const createSubmissionDialogFormRef = useRef<HTMLFormElement>();
  const [createDataSubmission] = useMutation<
    CreateSubmissionResp,
    {
      studyAbbreviation: string;
      dataCommons: string;
      name: string;
      dbGaPID: string;
      intention: SubmissionIntention;
      dataType: SubmissionDataType;
    }
  >(CREATE_SUBMISSION, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });
  const { data: approvedStudiesData } = useQuery<approvedStudiesRespone>(approvedStudiesQuery, {
    variables: {},
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const orgOwnerOrSubmitter = user?.role === "Organization Owner" || user?.role === "Submitter";
  const hasOrganizationAssigned = user?.organization !== null && user?.organization?.orgID !== null;
  const organizationNames: SelectOption[] = organizations?.map((org) => ({
    label: org.name,
    value: org.name,
  }));
  organizationNames?.unshift({ label: "All", value: "All" });
  const approvedStudiesMapToDbGaPID = useMemo(() => {
    const result = {};
    approvedStudiesData?.listApprovedStudiesOfMyOrganization?.forEach((study) => {
      result[study.studyAbbreviation] = study.dbGaPID;
    });
    return result;
  }, [approvedStudiesData]);
  const intention = watch("intention");

  const submissionTypeOptions = [
    { label: "New/Update", value: "New/Update", disabled: false },
    { label: "Delete", value: "Delete", disabled: false },
  ];

  const submissionDataTypeOptions: {
    label: string;
    value: SubmissionDataType;
    disabled: boolean;
  }[] = [
    {
      label: "Metadata and Data Files",
      value: "Metadata and Data Files",
      disabled: intention === "Delete",
    },
    { label: "Metadata Only", value: "Metadata Only", disabled: false },
  ];

  useEffect(() => {
    if (intention === "New/Update") {
      setValue("dataType", "Metadata and Data Files");
    }
    if (intention === "Delete") {
      setValue("dataType", "Metadata Only");
    }
  }, [intention]);

  /**
   * Updates the default form values after save or initial fetch
   *
   * @param data FormInput
   */
  const setFormValues = (
    data: CreateSubmissionParams,
    fields: (keyof CreateSubmissionParams)[] = [
      "name",
      "dataCommons",
      "dbGaPID",
      "intention",
      "studyAbbreviation",
      "dataType",
    ]
  ) => {
    const resetData = {};

    fields.forEach((field) => {
      resetData[field] = cloneDeep(data[field]);
    });

    reset(resetData);
  };

  useEffect(() => {
    setFormValues({
      dataCommons: "CDS",
      studyAbbreviation: "",
      intention: "New/Update",
      dataType: "Metadata and Data Files",
      dbGaPID: "",
      name: "",
    });
  }, []);

  const handleOpenDialog = () => {
    setCreatingSubmission(true);
  };

  const createSubmission = async ({
    studyAbbreviation,
    dataCommons,
    name,
    dbGaPID,
    intention,
    dataType,
  }: CreateSubmissionParams) => {
    await createDataSubmission({
      variables: {
        studyAbbreviation,
        dataCommons,
        name,
        dbGaPID,
        intention,
        dataType,
      },
    })
      .then(() => {
        setCreatingSubmission(false);
        setError(false);
        if (onCreate) {
          onCreate({
            studyAbbreviation,
            dataCommons,
            name,
            dbGaPID,
            intention,
            dataType,
          });
        }
      })
      .catch(() => {
        setError(true);
      });
  };

  const onSubmit: SubmitHandler<CreateSubmissionParams> = (data) => {
    createSubmission(data);
  };

  const handleStudyChange = (e: SelectChangeEvent<unknown>) => {
    const value = e?.target?.value as string;
    if (!value || !approvedStudiesMapToDbGaPID || !approvedStudiesMapToDbGaPID[value]) {
      setValue("dbGaPID", "");
      return;
    }
    setValue("dbGaPID", approvedStudiesMapToDbGaPID[value]);
  };

  const validateEmpty = (value: string) => (!value?.trim() ? "This field is required" : null);

  return (
    <>
      <CreateSubmissionDialog open={creatingSubmission} scroll="body">
        <StyledDialogTitle>
          <StyledCloseDialogButton
            aria-label="close"
            onClick={() => setCreatingSubmission(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCreatingSubmission(false);
              }
            }}
          >
            <CloseIconSvg />
          </StyledCloseDialogButton>
          <Stack direction="column" justifyContent="center" alignItems="flex-start">
            <StyledHeader variant="h3" id="create-a-submission-title">
              Create a Data Submission
            </StyledHeader>
            <StyledSubHeader>
              Please fill out the form below to start your data submission
            </StyledSubHeader>
          </Stack>
        </StyledDialogTitle>
        <StyledDialogContent>
          <StyledFormWrapper>
            <form
              id="create-submission-dialog-form"
              ref={createSubmissionDialogFormRef}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Stack direction="column">
                <StyledField>
                  <Controller
                    name="intention"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Grid container>
                        <StyledRadioInput
                          {...field}
                          id="create-data-submission-dialog-submission-type"
                          label="Submission Type"
                          value={field.value || ""}
                          options={submissionTypeOptions}
                          gridWidth={12}
                          required
                          row
                          aria-describedby="submission-intention-helper-text"
                        />
                      </Grid>
                    )}
                  />
                  <StyledHelperText id="submission-intention-helper-text">
                    {errors?.intention?.message}
                  </StyledHelperText>
                </StyledField>
                <StyledField>
                  <Controller
                    name="dataType"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Grid container>
                        <StyledRadioInput
                          {...field}
                          id="create-data-submission-dialog-data-type"
                          label="Data Type"
                          value={field.value || ""}
                          options={submissionDataTypeOptions}
                          gridWidth={12}
                          required
                          row
                          aria-describedby="submission-data-type-helper-text"
                        />
                      </Grid>
                    )}
                  />
                  <StyledHelperText id="submission-data-type-helper-text">
                    {errors?.intention?.message}
                  </StyledHelperText>
                </StyledField>
                <StyledOrganizationField>
                  <StyledLabel id="organization">Organization</StyledLabel>
                  <StyledOutlinedInput value={user.organization?.orgName} readOnly />
                </StyledOrganizationField>
                <StyledField>
                  <StyledLabel id="dataCommons">
                    Data Commons
                    <StyledAsterisk />
                  </StyledLabel>
                  <Controller
                    name="dataCommons"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        value={field.value || ""}
                        MenuProps={{ disablePortal: true }}
                        aria-describedby="submission-data-commons-helper-text"
                      >
                        {DataCommons.map((dc) => (
                          <MenuItem key={dc.name} value={dc.name}>
                            {dc.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                  <StyledHelperText id="submission-data-commons-helper-text">
                    {errors?.dataCommons?.message}
                  </StyledHelperText>
                </StyledField>
                <StyledField>
                  <StyledLabel id="study">
                    Study
                    <StyledAsterisk />
                  </StyledLabel>
                  <Controller
                    name="studyAbbreviation"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          handleStudyChange(e);
                        }}
                        MenuProps={{ disablePortal: true }}
                        aria-describedby="submission-study-abbreviation-helper-text"
                      >
                        {approvedStudiesData?.listApprovedStudiesOfMyOrganization?.map((abbr) => (
                          <MenuItem key={abbr.studyAbbreviation} value={abbr.studyAbbreviation}>
                            {abbr.studyAbbreviation}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                  <StyledHelperText id="submission-study-abbreviation-helper-text">
                    {errors?.studyAbbreviation?.message}
                  </StyledHelperText>
                </StyledField>
                <StyledField>
                  <StyledLabel id="dbGaPID">dbGaP ID</StyledLabel>
                  <StyledOutlinedInput
                    {...register("dbGaPID", { required: false, maxLength: 50 })}
                    inputProps={{ maxLength: 50 }}
                    placeholder="Input dbGaP ID"
                    aria-describedby="submission-dbGaPID-helper-text"
                  />
                  <StyledHelperText id="submission-dbGaPID-helper-text">
                    {errors?.dbGaPID?.message}
                  </StyledHelperText>
                </StyledField>
                <StyledField>
                  <StyledLabel id="submissionName">
                    Submission Name
                    <StyledAsterisk />
                  </StyledLabel>
                  <StyledOutlinedInputMultiline
                    {...register("name", {
                      maxLength: 25,
                      validate: validateEmpty,
                    })}
                    multiline
                    rows={3}
                    placeholder="25 characters allowed"
                    inputProps={{ maxLength: 25 }}
                    aria-describedby="submission-name-helper-text"
                  />
                  <StyledHelperText id="submission-name-helper-text">
                    {errors?.name?.message}
                  </StyledHelperText>
                </StyledField>
              </Stack>
            </form>
          </StyledFormWrapper>
        </StyledDialogContent>
        <StyledDialogActions>
          <StyledDialogButton
            type="submit"
            tabIndex={0}
            id="createSubmissionDialogCreateButton"
            form="create-submission-dialog-form"
          >
            Create
          </StyledDialogButton>
          {error && (
            <StyledDialogError variant="body1">
              Unable to create this data submission. If the problem persists please contact
              <br />
              <a href="mailto:ncicrdchelpdesk@mail.nih.gov">ncicrdchelpdesk@mail.nih.gov</a>
            </StyledDialogError>
          )}
        </StyledDialogActions>
      </CreateSubmissionDialog>

      {orgOwnerOrSubmitter && (
        <StyledButton
          type="button"
          onClick={handleOpenDialog}
          sx={{ bottom: "30px", right: "50px" }}
          disabled={!hasOrganizationAssigned}
        >
          Create a Data Submission
        </StyledButton>
      )}
    </>
  );
};

export default CreateDataSubmissionDialog;
