/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import bannerSvg from "../../assets/banner/profile_banner.png";
import studyIcon from "../../assets/icons/study_icon.svg";
import usePageTitle from "../../hooks/usePageTitle";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import { FieldState } from "../../hooks/useProfileFields";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import { formatORCIDInput, isValidORCID } from "../../utils";
import StyledHelperText from "../../components/StyledFormComponents/StyledHelperText";
import CheckboxCheckedIconSvg from "../../assets/icons/checkbox_checked.svg";
import StyledTooltip from "../../components/StyledFormComponents/StyledTooltip";
import infoCircleIcon from "../../assets/icons/info_circle.svg";
import Tooltip from "../../components/Tooltip";
import options from "../../config/AccessTypesConfig";
import {
  CREATE_APPROVED_STUDY,
  CreateApprovedStudyInput,
  CreateApprovedStudyResp,
} from "../../graphql";

const InfoIcon = styled("div")(() => ({
  backgroundImage: `url(${infoCircleIcon})`,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  width: "12px",
  height: "12px",
}));

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

const StyledHeader = styled("div")({
  textAlign: "left",
  width: "100%",
  marginTop: "-34px !important",
  marginBottom: "41px !important",
});

const StyledHeaderText = styled(Typography)({
  fontSize: "26px",
  lineHeight: "35px",
  color: "#083A50",
  fontWeight: 700,
});

const StyledField = styled("div", { shouldForwardProp: (p) => p !== "visible" })<{
  visible?: boolean;
}>(({ visible = true }) => ({
  marginBottom: "10px",
  minHeight: "41px",
  display: visible ? "flex" : "none",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "40px",
  fontSize: "18px",
}));

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

const StyledCheckbox = styled(Checkbox)(({ readOnly }) => ({
  cursor: readOnly ? "not-allowed" : "pointer",
  "&.MuiCheckbox-root": {
    padding: "10px",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
}));

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

const StyledTitleBox = styled(Box)({
  marginTop: "-86px",
  marginBottom: "88px",
  width: "100%",
});

const TooltipIcon = styled(InfoIcon)`
  font-size: 12px;
  color: inherit;
`;

const TooltipButton = styled(IconButton)(() => ({
  padding: 0,
  fontSize: "12px",
  verticalAlign: "top",
  marginLeft: "6px",
  color: "#000000",
}));

type FormInput = Pick<
  ApprovedStudy,
  "studyName" | "studyAbbreviation" | "PI" | "dbGaPID" | "ORCID" | "openAccess" | "controlledAccess"
>;

type Props = {
  _id: string;
};

const StudyView: FC<Props> = ({ _id }: Props) => {
  usePageTitle(`${!!_id && _id !== "new" ? "Edit" : "Add"} Study ${_id || ""}`.trim());
  const navigate = useNavigate();
  const { lastSearchParams } = useSearchParamsContext();
  const {
    handleSubmit,
    register,
    reset,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput>({ mode: "onSubmit", reValidateMode: "onSubmit" });
  const isControlled = watch("controlledAccess");

  const [saving, setSaving] = useState<boolean>(false);
  const [ORCID, setORCID] = useState<string>("");
  const [error, setError] = useState(null);

  const manageStudiesPageUrl = `/studies${lastSearchParams?.["/studies"] ?? ""}`;

  const [createApprovedStudy] = useMutation<CreateApprovedStudyResp, CreateApprovedStudyInput>(
    CREATE_APPROVED_STUDY,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
    }
  );

  const handlePreSubmit = (data: FormInput) => {
    // shouldn't ever happen
    if (!data) {
      setError("Invalid form values provided.");
      return;
    }
    if (!isValidORCID(data.ORCID)) {
      setError("Invalid ORCID format.");
      return;
    }
    if (!data.controlledAccess && !data.openAccess) {
      setError("Invalid Access Type. Please select at least one Access Type.");
      return;
    }

    setError(null);
    onSubmit(data);
  };

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    const variables = { ...data, name: data.studyName, acronym: data.studyAbbreviation };

    if (_id === "new") {
      const { data: d, errors } = await createApprovedStudy({ variables }).catch((e) => ({
        errors: e?.message,
        data: null,
      }));
      setSaving(false);

      if (errors || !d?.createApprovedStudy?._id) {
        setError(errors || "Unable to create approved study");
        return;
      }
    }

    setError(null);
    navigate(manageStudiesPageUrl);
  };

  const handleORCIDInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const inputValue = event.target.value || "";
    const formattedValue = formatORCIDInput(inputValue);
    setORCID(formattedValue);
  };

  return (
    <>
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

            <form onSubmit={handleSubmit(handlePreSubmit)}>
              {error && (
                <Alert sx={{ mb: 2, p: 2, width: "100%" }} severity="error">
                  {error || "An unknown API error occurred."}
                </Alert>
              )}

              <StyledField>
                <StyledLabel id="studyNameLabel">Name</StyledLabel>
                <StyledTextField
                  {...register("studyName", { required: true, setValueAs: (val) => val?.trim() })}
                  size="small"
                  required
                  inputProps={{ "aria-labelledby": "studyNameLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="studyAbbreviationLabel">Acronym</StyledLabel>
                <StyledTextField
                  {...register("studyAbbreviation", { setValueAs: (val) => val?.trim() })}
                  size="small"
                  inputProps={{ "aria-labelledby": "studyAbbreviationLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledAccessTypesLabel id="accessTypesLabel">
                  Access Types{" "}
                  <StyledAccessTypesDescription>
                    (Select all that apply):
                  </StyledAccessTypesDescription>
                </StyledAccessTypesLabel>
                <Stack direction="column">
                  <StyledCheckboxFormGroup>
                    <StyledFormControlLabel
                      {...register("openAccess", { setValueAs: (val) => Boolean(val) })}
                      control={
                        <StyledCheckbox checkedIcon={<CheckedIcon />} icon={<UncheckedIcon />} />
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
                      {...register("controlledAccess", { setValueAs: (val) => Boolean(val) })}
                      control={
                        <StyledCheckbox checkedIcon={<CheckedIcon />} icon={<UncheckedIcon />} />
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
                <StyledLabel id="dbGaPIDLabel">dbGaPID</StyledLabel>
                <StyledTextField
                  {...register("dbGaPID", {
                    required: isControlled === true,
                    setValueAs: (val) => val?.trim(),
                  })}
                  size="small"
                  required={isControlled === true}
                  inputProps={{ "aria-labelledby": "dbGaPIDLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="piLabel">PI Name</StyledLabel>
                <StyledTextField
                  {...register("PI", { required: true, setValueAs: (val) => val?.trim() })}
                  size="small"
                  required
                  placeholder="Enter <first name> <last name>"
                  inputProps={{ "aria-labelledby": "piLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="orcidLabel">ORCID</StyledLabel>
                <Stack direction="column">
                  <Controller
                    name="ORCID"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <StyledTextField
                        {...field}
                        value={ORCID}
                        onChange={(e) => {
                          field.onChange(e);
                          handleORCIDInputChange(e);
                        }}
                        size="small"
                        required
                        placeholder="e.g. 0000-0001-2345-6789"
                        inputProps={{ "aria-labelledby": "orcidLabel" }}
                      />
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
                <StyledButton type="submit" loading={saving} txt="#14634F" border="#26B893">
                  Save
                </StyledButton>
                <StyledButton
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
    </>
  );
};

export default StudyView;
