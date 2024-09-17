/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, MenuItem, Stack, styled, Typography } from "@mui/material";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import bannerSvg from "../../assets/banner/profile_banner.png";
import profileIcon from "../../assets/icons/profile_icon.svg";
import usePageTitle from "../../hooks/usePageTitle";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import { FieldState } from "../../hooks/useProfileFields";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import { formatORCIDInput, isValidORCID } from "../../utils";
import StyledHelperText from "../../components/StyledFormComponents/StyledHelperText";

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
  justifyContent: "flex-start",
  fontSize: "18px",
}));

const StyledLabel = styled("span")({
  color: "#356AAD",
  fontWeight: "700",
  marginRight: "40px",
  minWidth: "127px",
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

const StyledTitleBox = styled(Box)({
  marginTop: "-86px",
  marginBottom: "88px",
  width: "100%",
});

const StyledSelectionCount = styled(Typography)({
  fontSize: "16px",
  fontWeight: 600,
  color: "#666666",
  width: "200px",
  position: "absolute",
  left: "373px",
  transform: "translateY(-50%)",
  top: "50%",
});

type FormInput = Pick<
  ApprovedStudy,
  "studyName" | "studyAbbreviation" | "PI" | "dbGaPID" | "ORCID"
>;

type Props = {
  _id: string;
};

const StudyView: FC<Props> = ({ _id }: Props) => {
  usePageTitle(`${_id ? "Edit" : "Add"} Approved Study ${_id || ""}`.trim());
  const navigate = useNavigate();
  const { lastSearchParams } = useSearchParamsContext();
  const { handleSubmit, register, reset, watch, setValue, control, formState } =
    useForm<FormInput>();

  const [saving, setSaving] = useState<boolean>(false);

  const manageStudiesPageUrl = `/users${lastSearchParams?.["/users"] ?? ""}`;

  const onSubmit = async (data: FormInput) => {};

  const handleORCIDInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: ControllerRenderProps<FormInput, "ORCID">
  ) => {
    const inputValue = event.target.value || "";
    const formattedValue = formatORCIDInput(inputValue);
    field.onChange(formattedValue);
  };

  return (
    <>
      <StyledBanner />
      <StyledContainer maxWidth="lg">
        <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing={2}>
          <StyledProfileIcon>
            <img src={profileIcon} alt="profile icon" />
          </StyledProfileIcon>

          <StyledContentStack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h1">
                {`${_id ? "Edit" : "Add"} Approved Study`}
              </StyledPageTitle>
            </StyledTitleBox>
            <StyledHeader>
              <StyledHeaderText variant="h2">Header Text</StyledHeaderText>
            </StyledHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
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
                  {...(register("studyAbbreviation"), { setValueAs: (val) => val?.trim() })}
                  size="small"
                  inputProps={{ "aria-labelledby": "studyAbbreviationLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="piLabel">PI Name</StyledLabel>
                <StyledTextField
                  {...register("PI", { required: true, setValueAs: (val) => val?.trim() })}
                  size="small"
                  required
                  inputProps={{ "aria-labelledby": "piLabel" }}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="orcidLabel">ORCID</StyledLabel>
                <Controller
                  name="ORCID"
                  control={control}
                  rules={{
                    required: "This field is required",
                    validate: (val) => {
                      if (!val || val.length === 0) {
                        return true;
                      }
                      return isValidORCID(val) || "Please provide a valid ORCID";
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <Stack direction="column">
                      <StyledTextField
                        {...field}
                        value={field.value}
                        size="small"
                        required
                        inputProps={{ "aria-labelledby": "orcidLabel" }}
                        placeholder="e.g. 0000-0001-2345-6789"
                        onChange={(event) => handleORCIDInputChange(event, field)}
                        error={!!error}
                      />
                      <StyledHelperText id="ORCID-helper-text">{error?.message}</StyledHelperText>
                    </Stack>
                  )}
                />
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
