import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import bannerSvg from "../../assets/banner/profile_banner.png";
import studyIcon from "../../assets/icons/study_icon.svg";
import usePageTitle from "../../hooks/usePageTitle";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import { formatORCIDInput, isValidORCID } from "../../utils";
import CheckboxCheckedIconSvg from "../../assets/icons/checkbox_checked.svg";
import Tooltip from "../../components/Tooltip";
import options from "../../config/AccessTypesConfig";
import {
  CREATE_APPROVED_STUDY,
  CreateApprovedStudyInput,
  CreateApprovedStudyResp,
  GET_APPROVED_STUDY,
  GetApprovedStudyInput,
  GetApprovedStudyResp,
  LIST_ACTIVE_DCPS,
  ListActiveDCPsResp,
  UPDATE_APPROVED_STUDY,
  UpdateApprovedStudyInput,
  UpdateApprovedStudyResp,
} from "../../graphql";
import SuspenseLoader from "../../components/SuspenseLoader";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import BaseAsterisk from "../../components/StyledFormComponents/StyledAsterisk";

const UncheckedIcon = styled("div")<{ readOnly?: boolean }>(({ readOnly }) => ({
  outline: "2px solid #1D91AB",
  outlineOffset: -2,
  width: "24px",
  height: "24px",
  backgroundColor: readOnly ? "#E5EEF4" : "initial",
  color: "#083A50",
  cursor: readOnly ? "not-allowed" : "pointer",
}));

const CheckedIcon = styled("div")<{ readOnly?: boolean }>(({ readOnly }) => ({
  backgroundImage: `url(${CheckboxCheckedIconSvg})`,
  backgroundSize: "auto",
  backgroundRepeat: "no-repeat",
  width: "24px",
  height: "24px",
  backgroundColor: readOnly ? "#E5EEF4" : "initial",
  color: "#1D91AB",
  cursor: readOnly ? "not-allowed" : "pointer",
}));

const StyledContainer = styled(Container)({
  marginBottom: "90px",
});

const StyledBanner = styled("div")({
  background: `url(${bannerSvg})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "153px",
});

const StyledPageTitle = styled(Typography)({
  fontFamily: "Nunito Sans",
  fontSize: "45px",
  fontWeight: 800,
  letterSpacing: "-1.5px",
  color: "#fff",
});

const StyledProfileIcon = styled("div")({
  position: "relative",
  transform: "translate(-218px, -75px)",
  "& img": {
    position: "absolute",
  },
  "& img:nth-of-type(1)": {
    zIndex: 2,
    filter: "drop-shadow(10px 13px 9px rgba(0, 0, 0, 0.35))",
  },
});

const StyledField = styled("div")({
  marginBottom: "10px",
  minHeight: "41px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "40px",
  fontSize: "18px",
});

const StyledLabel = styled("span")({
  color: "#356AAD",
  fontWeight: "700",
  minWidth: "127px",
});

const StyledAccessTypesLabel = styled("span")({
  display: "flex",
  flexDirection: "column",
  color: "#356AAD",
  fontWeight: 700,
  minWidth: "127px",
});

const StyledAccessTypesDescription = styled("span")(() => ({
  fontWeight: 400,
  fontSize: "16px",
}));

const StyledCheckboxFormGroup = styled(FormGroup)(() => ({
  width: "363px",
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  width: "363px",
  marginRight: 0,
  pointerEvents: "none",
  marginLeft: "-10px",
  "& .MuiButtonBase-root ": {
    pointerEvents: "all",
  },
  "& .MuiFormControlLabel-label": {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "19.6px",
    minHeight: "20px",
    color: "#083A50",
  },
}));

const StyledCheckbox = styled(Checkbox)({
  "&.MuiCheckbox-root": {
    padding: "10px",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
  "&.Mui-disabled": {
    cursor: "not-allowed",
  },
});

const BaseInputStyling = {
  width: "363px",
};

const StyledTextField = styled(BaseOutlinedInput)(BaseInputStyling);
const StyledSelect = styled(BaseSelect)(BaseInputStyling);

const StyledButtonStack = styled(Stack)({
  marginTop: "50px",
});

const StyledButton = styled(LoadingButton)(({ txt, border }: { txt: string; border: string }) => ({
  borderRadius: "8px",
  border: `2px solid ${border}`,
  color: `${txt} !important`,
  width: "101px",
  height: "51px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "17px",
  padding: "6px 8px",
}));

const StyledContentStack = styled(Stack)({
  marginLeft: "2px !important",
});

const StyledAlert = styled(Alert)({
  marginBottom: "16px",
  padding: "16px",
  width: "100%",
  maxWidth: "556px",
});

const StyledTitleBox = styled(Box)({
  marginTop: "-86px",
  marginBottom: "88px",
  width: "100%",
});

const StyledAsterisk = styled(BaseAsterisk, { shouldForwardProp: (p) => p !== "visible" })<{
  visible?: boolean;
}>(({ visible = true }) => ({
  display: visible ? undefined : "none",
}));

type FormInput = Pick<
  ApprovedStudy,
  "studyName" | "studyAbbreviation" | "PI" | "dbGaPID" | "ORCID" | "openAccess" | "controlledAccess"
> & { primaryContactID: string };

type Props = {
  _id: string;
};

const StudyView: FC<Props> = ({ _id }: Props) => {
  const isNew = _id && _id === "new";
  usePageTitle(`${!isNew && _id ? "Edit" : "Add"} Study ${!isNew && _id ? _id : ""}`.trim());
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { lastSearchParams } = useSearchParamsContext();
  const {
    handleSubmit,
    register,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInput>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      studyName: "",
      studyAbbreviation: "",
      PI: "",
      dbGaPID: "",
      ORCID: "",
      primaryContactID: "",
      openAccess: false,
      controlledAccess: false,
    },
  });
  const isControlled = watch("controlledAccess");

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const [sameAsProgramPrimaryContact, setSameAsProgramPrimaryContact] = useState<boolean>(true);
  const [approvedStudy, setApprovedStudy] = useState<ApprovedStudy>(null);

  const manageStudiesPageUrl = `/studies${lastSearchParams?.["/studies"] ?? ""}`;

  const { loading: retrievingStudy } = useQuery<GetApprovedStudyResp, GetApprovedStudyInput>(
    GET_APPROVED_STUDY,
    {
      variables: { _id },
      skip: !_id || _id === "new",
      onCompleted: (data) => {
        setApprovedStudy({ ...data?.getApprovedStudy });
        const {
          primaryContact,
          studyName,
          studyAbbreviation,
          PI,
          dbGaPID,
          ORCID,
          openAccess,
          controlledAccess,
        } = data?.getApprovedStudy || {};

        if (primaryContact?._id) {
          setSameAsProgramPrimaryContact(false);
        } else if (data?.getApprovedStudy?.programs?.length === 1) {
          setSameAsProgramPrimaryContact(true);
        }

        resetForm({
          studyName,
          studyAbbreviation,
          PI,
          dbGaPID,
          ORCID,
          openAccess,
          controlledAccess,
          primaryContactID: primaryContact?._id,
        });
      },
      onError: (error) =>
        navigate(manageStudiesPageUrl, {
          state: { error: error?.message || "Unable to fetch study." },
        }),
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const { data: activeDCPs } = useQuery<ListActiveDCPsResp>(LIST_ACTIVE_DCPS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const [updateApprovedStudy] = useMutation<UpdateApprovedStudyResp, UpdateApprovedStudyInput>(
    UPDATE_APPROVED_STUDY,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const [createApprovedStudy] = useMutation<CreateApprovedStudyResp, CreateApprovedStudyInput>(
    CREATE_APPROVED_STUDY,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    if (approvedStudy?.programs?.length > 1 && sameAsProgramPrimaryContact) {
      setSameAsProgramPrimaryContact(false);
    }
  }, [approvedStudy?.programs?.length, sameAsProgramPrimaryContact]);

  /**
   * Reset the form values, and preventing invalid
   * properties from being set
   */
  const resetForm = ({
    studyName,
    studyAbbreviation,
    controlledAccess,
    openAccess,
    dbGaPID,
    PI,
    ORCID,
    primaryContactID,
  }: FormInput) => {
    reset({
      studyName: studyName || "",
      studyAbbreviation: studyAbbreviation || "",
      controlledAccess: controlledAccess || false,
      openAccess: openAccess || false,
      dbGaPID: dbGaPID || "",
      PI: PI || "",
      ORCID: ORCID || "",
      primaryContactID: primaryContactID || "",
    });
  };

  const handlePreSubmit = (data: FormInput) => {
    if (data.ORCID && !isValidORCID(data?.ORCID)) {
      setError("Invalid ORCID format.");
      return;
    }
    if (!data?.controlledAccess && !data?.openAccess) {
      setError("Invalid Access Type. Please select at least one Access Type.");
      return;
    }

    setError(null);
    onSubmit(data);
  };

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    const variables: CreateApprovedStudyInput | UpdateApprovedStudyInput = {
      ...data,
      name: data.studyName,
      acronym: data.studyAbbreviation,
      primaryContactID: sameAsProgramPrimaryContact
        ? undefined
        : data.primaryContactID || undefined,
    };

    if (_id === "new") {
      const { data: d, errors } = await createApprovedStudy({ variables }).catch((e) => ({
        errors: e?.message,
        data: null,
      }));
      setSaving(false);

      if (errors || !d?.createApprovedStudy?._id) {
        setError(errors || "Unable to create approved study.");
        return;
      }
      enqueueSnackbar("This study has been successfully added.", {
        variant: "default",
      });
    } else {
      const { data: d, errors } = await updateApprovedStudy({
        variables: { studyID: _id, ...variables },
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d?.updateApprovedStudy) {
        setError(errors || "Unable to save changes");
        return;
      }

      enqueueSnackbar("All changes have been saved.", { variant: "default" });
      resetForm({ ...d.updateApprovedStudy });
    }

    setError(null);
    navigate(manageStudiesPageUrl);
  };

  const handleORCIDInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const inputValue = event?.target?.value;
    const formattedValue = formatORCIDInput(inputValue);
    setValue("ORCID", formattedValue);
  };

  const handleOnSameAsProgramPCChange = (checked: boolean) => {
    setSameAsProgramPrimaryContact(checked);

    if (
      checked &&
      approvedStudy?.programs?.length === 1 &&
      approvedStudy.programs[0]?.conciergeID
    ) {
      setValue("primaryContactID", approvedStudy.programs[0].conciergeID);
      return;
    }

    setValue("primaryContactID", null);
  };

  if (retrievingStudy) {
    return <SuspenseLoader data-testid="study-view-suspense-loader" />;
  }

  return (
    <Box data-testid="study-view-container">
      <StyledBanner />
      <StyledContainer maxWidth="lg">
        <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing={2}>
          <StyledProfileIcon>
            <img src={studyIcon} alt="profile icon" />
          </StyledProfileIcon>

          <StyledContentStack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h1">{`${
                !!_id && _id !== "new" ? "Edit" : "Add"
              } Study`}</StyledPageTitle>
            </StyledTitleBox>

            <form onSubmit={handleSubmit(handlePreSubmit)} data-testid="study-form">
              {error && (
                <StyledAlert severity="error" data-testid="alert-error-message">
                  {error || "An unknown API error occurred."}
                </StyledAlert>
              )}

              <StyledField>
                <StyledLabel id="studyNameLabel">
                  Name
                  <StyledAsterisk visible />
                </StyledLabel>
                <StyledTextField
                  {...register("studyName", { required: true, setValueAs: (val) => val?.trim() })}
                  size="small"
                  required
                  disabled={retrievingStudy}
                  readOnly={saving}
                  inputProps={{
                    "aria-labelledby": "studyNameLabel",
                    "data-testid": "studyName-input",
                  }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="studyAbbreviationLabel">Acronym</StyledLabel>
                <StyledTextField
                  {...register("studyAbbreviation", { setValueAs: (val) => val?.trim() })}
                  size="small"
                  disabled={retrievingStudy}
                  readOnly={saving}
                  inputProps={{
                    "aria-labelledby": "studyAbbreviationLabel",
                    "data-testid": "studyAbbreviation-input",
                  }}
                />
              </StyledField>
              <StyledField>
                <StyledAccessTypesLabel id="accessTypesLabel">
                  <span>
                    Access Types
                    <StyledAsterisk visible />
                  </span>
                  <StyledAccessTypesDescription>
                    (Select all that apply)
                  </StyledAccessTypesDescription>
                </StyledAccessTypesLabel>
                <Stack direction="column">
                  <StyledCheckboxFormGroup>
                    <StyledFormControlLabel
                      control={
                        <Controller
                          name="openAccess"
                          control={control}
                          render={({ field }) => (
                            <StyledCheckbox
                              {...field}
                              checked={field.value}
                              checkedIcon={<CheckedIcon readOnly={saving || retrievingStudy} />}
                              icon={<UncheckedIcon readOnly={saving || retrievingStudy} />}
                              disabled={saving || retrievingStudy}
                              inputProps={{ "data-testid": "openAccess-checkbox" } as unknown}
                            />
                          )}
                        />
                      }
                      label={
                        <>
                          Open Access
                          <Tooltip
                            title={options.find((opt) => opt.label === "Open Access")?.tooltipText}
                          />
                        </>
                      }
                    />
                    <StyledFormControlLabel
                      control={
                        <Controller
                          name="controlledAccess"
                          control={control}
                          render={({ field }) => (
                            <StyledCheckbox
                              {...field}
                              checked={field.value}
                              checkedIcon={<CheckedIcon readOnly={saving || retrievingStudy} />}
                              icon={<UncheckedIcon readOnly={saving || retrievingStudy} />}
                              disabled={saving || retrievingStudy}
                              inputProps={{ "data-testid": "controlledAccess-checkbox" } as unknown}
                            />
                          )}
                        />
                      }
                      label={
                        <>
                          Controlled Access
                          <Tooltip
                            title={
                              options.find((opt) => opt.label === "Controlled Access")?.tooltipText
                            }
                          />
                        </>
                      }
                    />
                  </StyledCheckboxFormGroup>
                </Stack>
              </StyledField>
              <StyledField>
                <StyledLabel id="dbGaPIDLabel">
                  dbGaPID
                  <StyledAsterisk visible={isControlled} />
                </StyledLabel>
                <StyledTextField
                  {...register("dbGaPID", {
                    required: isControlled === true,
                    setValueAs: (val) => val?.trim(),
                  })}
                  size="small"
                  required={isControlled === true}
                  disabled={retrievingStudy}
                  readOnly={saving}
                  inputProps={{ "aria-labelledby": "dbGaPIDLabel", "data-testid": "dbGaPID-input" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="piLabel">PI Name</StyledLabel>
                <StyledTextField
                  {...register("PI", { setValueAs: (val) => val?.trim() })}
                  size="small"
                  disabled={retrievingStudy}
                  readOnly={saving}
                  placeholder="Enter <first name> <last name>"
                  inputProps={{ "aria-labelledby": "piLabel", "data-testid": "PI-input" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="orcidLabel">ORCID</StyledLabel>
                <Stack direction="column">
                  <Controller
                    name="ORCID"
                    control={control}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handleORCIDInputChange(e);
                        }}
                        size="small"
                        disabled={retrievingStudy}
                        readOnly={saving}
                        placeholder="e.g. 0000-0001-2345-6789"
                        inputProps={{
                          "aria-labelledby": "orcidLabel",
                          "data-testid": "ORCID-input",
                        }}
                      />
                    )}
                  />
                </Stack>
              </StyledField>

              <StyledField sx={{ alignItems: "flex-start" }}>
                <StyledLabel id="primaryContactLabel" sx={{ paddingTop: "10px" }}>
                  Primary Contact
                </StyledLabel>
                <Stack
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <StyledCheckboxFormGroup>
                    <Tooltip
                      title="Disabled due to this study is associated with multiple programs; manually assign a Primary Contact."
                      placement="top"
                      open={undefined}
                      disableHoverListener={
                        saving ||
                        retrievingStudy ||
                        !approvedStudy?.programs ||
                        approvedStudy?.programs?.length <= 1
                      }
                    >
                      <StyledFormControlLabel
                        control={
                          <StyledCheckbox
                            checked={sameAsProgramPrimaryContact}
                            onChange={(_, checked) => handleOnSameAsProgramPCChange(checked)}
                            checkedIcon={<CheckedIcon readOnly={saving || retrievingStudy} />}
                            icon={<UncheckedIcon readOnly={saving || retrievingStudy} />}
                            disabled={
                              saving || retrievingStudy || approvedStudy?.programs?.length > 1
                            }
                            inputProps={
                              { "data-testid": "sameAsProgramPrimaryContact-checkbox" } as unknown
                            }
                          />
                        }
                        label="Same as the Program Primary Contact"
                      />
                    </Tooltip>
                  </StyledCheckboxFormGroup>
                  <Controller
                    name="primaryContactID"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        value={
                          sameAsProgramPrimaryContact
                            ? approvedStudy?.programs?.[0]?.conciergeID || ""
                            : field.value || ""
                        }
                        MenuProps={{ disablePortal: true }}
                        inputProps={{
                          "aria-labelledby": "primaryContactLabel",
                        }}
                        data-testid="primaryContactID-select"
                        error={!!errors.primaryContactID}
                        disabled={sameAsProgramPrimaryContact}
                      >
                        {sameAsProgramPrimaryContact &&
                        approvedStudy?.programs?.[0]?.conciergeID ? (
                          <MenuItem value={approvedStudy.programs[0].conciergeID}>
                            {`${approvedStudy?.programs?.[0]?.conciergeName}`.trim()}
                          </MenuItem>
                        ) : (
                          <MenuItem value={null}>{"<Not Set>"}</MenuItem>
                        )}
                        {activeDCPs?.listActiveDCPs?.map((user) => (
                          <MenuItem key={user?.userID} value={user?.userID}>
                            {`${user?.firstName} ${user?.lastName}`.trim()}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                </Stack>
              </StyledField>

              <StyledButtonStack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <StyledButton
                  data-testid="save-button"
                  type="submit"
                  loading={saving || retrievingStudy}
                  txt="#14634F"
                  border="#26B893"
                >
                  Save
                </StyledButton>
                <StyledButton
                  data-testid="cancel-button"
                  type="button"
                  onClick={() => navigate(manageStudiesPageUrl)}
                  txt="#666666"
                  border="#828282"
                >
                  Cancel
                </StyledButton>
              </StyledButtonStack>
            </form>
          </StyledContentStack>
        </Stack>
      </StyledContainer>
    </Box>
  );
};

export default StudyView;
