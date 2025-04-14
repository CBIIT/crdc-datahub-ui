import { useState } from "react";
import { Box, Container, MenuItem, Stack, styled, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import { useSnackbar } from "notistack";
import bannerSvg from "../../assets/banner/profile_banner.png";
import programIcon from "../../assets/icons/program_icon.svg";
import usePageTitle from "../../hooks/usePageTitle";
import StyledAsterisk from "../../components/StyledFormComponents/StyledAsterisk";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import {
  CREATE_INSTITUION,
  CreateInstitutionInput,
  CreateInstitutionResp,
  GET_INSTITUTION,
  GetInstitutionInput,
  GetInstitutionResp,
  UPDATE_INSTITUTION,
  UpdateInstitutionInput,
  UpdateInstitutionResp,
} from "../../graphql";
import { Logger } from "../../utils";

const StyledBanner = styled("div")({
  background: `url(${bannerSvg})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "153px",
});

const StyledContainer = styled(Container)({
  marginBottom: "90px",
});

const StyledIcon = styled("div")({
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

const StyledContentStack = styled(Stack)({
  marginLeft: "2px !important",
});

const StyledTitleBox = styled(Box)({
  marginTop: "-86px",
  marginBottom: "88px",
  width: "100%",
});

const StyledPageTitle = styled(Typography)({
  fontFamily: "Nunito Sans",
  fontSize: "45px",
  fontWeight: 800,
  letterSpacing: "-1.5px",
  color: "#fff",
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

const BaseInputStyling = {
  width: "363px",
};

const StyledTextField = styled(BaseOutlinedInput)(BaseInputStyling);
const StyledSelect = styled(BaseSelect)(BaseInputStyling);

const StyledButtonStack = styled(Stack)({
  marginTop: "50px",
});

const StyledButton = styled(LoadingButton)({
  minWidth: "120px",
  fontSize: "16px",
  padding: "10px",
  lineHeight: "24px",
});

type FormInput = Pick<Institution, "name" | "status">;

type Props = {
  _id: string;
};

const InstitutionView = ({ _id }: Props) => {
  const isNew = _id && _id === "new";
  usePageTitle(isNew ? "Add Institution" : `Edit Institution ${_id}`);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { lastSearchParams } = useSearchParamsContext();
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      status: "Active",
    },
  });

  const [saving, setSaving] = useState<boolean>(false);

  const manageInstitutionsPageUrl = `/institutions${lastSearchParams?.["/institutions"] ?? ""}`;

  const { loading: retrievingInstitution } = useQuery<GetInstitutionResp, GetInstitutionInput>(
    GET_INSTITUTION,
    {
      variables: { _id },
      skip: isNew,
      onCompleted: (data) => {
        const { name, status } = data?.getInstitution || {};
        reset({ name, status });
      },
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
      onError: (error) => onError([error], "Unable to retrieve Institution."),
    }
  );

  const [createInstitution] = useMutation<CreateInstitutionResp, CreateInstitutionInput>(
    CREATE_INSTITUION,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      onError: (error) => {
        if (error.networkError) {
          onError([error], "Unable to create a new Institution.");
        }
      },
    }
  );

  const [updateInstitution] = useMutation<UpdateInstitutionResp, UpdateInstitutionInput>(
    UPDATE_INSTITUTION,
    {
      context: { clientName: "backend" },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      onError: (error) => {
        if (error.networkError) {
          onError([error], "Unable to save changes.");
        }
      },
    }
  );

  const onError = <T extends { message: string }>(errors: readonly T[], message: string) => {
    if (!errors?.length) {
      return;
    }

    const flatErrors = errors?.flatMap((err) => err.message)?.join(" ");
    Logger.error(`InstitutionView: ${message} ${flatErrors}`);
    enqueueSnackbar(flatErrors, { variant: "error" });
  };

  const handleCreateInstitution = async ({ name, status }: FormInput) => {
    const { data: d, errors } = await createInstitution({ variables: { name, status } });

    if (errors || !d?.createInstitution?._id) {
      onError(errors, "Unable to create a new Institution.");
      return;
    }

    enqueueSnackbar("Institution created successfully.", { variant: "default" });
  };

  const handleUpdateInstitution = async ({ name, status }: FormInput) => {
    const { data: d, errors } = await updateInstitution({ variables: { _id, name, status } });

    if (errors || !d?.updateInstitution?._id) {
      onError(errors, "Unable to save changes.");
      return;
    }

    enqueueSnackbar("Institution updated successfully.", { variant: "default" });
    reset({ ...d.updateInstitution });
  };

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    const action = isNew ? handleCreateInstitution : handleUpdateInstitution;
    await action(data);

    setSaving(false);
    navigate(manageInstitutionsPageUrl);
  };

  return (
    <Box>
      <StyledBanner />
      <StyledContainer maxWidth="lg">
        <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing={2}>
          <StyledIcon>
            <img src={programIcon} alt="Institution icon" />
          </StyledIcon>

          <StyledContentStack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h1">
                {isNew ? "Add Institution" : "Edit Institution"}
              </StyledPageTitle>
            </StyledTitleBox>

            <form onSubmit={handleSubmit(onSubmit)} data-testid="institution-form">
              <StyledField>
                <StyledLabel id="institutionNameLabel">
                  Name
                  <StyledAsterisk />
                </StyledLabel>
                <StyledTextField
                  {...register("name", { required: true, setValueAs: (val) => val?.trim() })}
                  size="small"
                  required
                  disabled={retrievingInstitution}
                  readOnly={saving}
                  error={!!errors.name}
                  inputProps={{
                    "aria-labelledby": "institutionNameLabel",
                    "data-testid": "institutionName-input",
                  }}
                />
              </StyledField>

              <StyledField>
                <StyledLabel id="statusLabel">
                  Status
                  <StyledAsterisk />
                </StyledLabel>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      size="small"
                      readOnly={retrievingInstitution}
                      MenuProps={{ disablePortal: true }}
                      error={!!errors.status}
                      inputProps={{ "aria-labelledby": "statusLabel" }}
                      data-testid="status-select"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </StyledSelect>
                  )}
                />
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
                  loading={saving || retrievingInstitution}
                  variant="contained"
                  color="success"
                >
                  Save
                </StyledButton>
                <StyledButton
                  data-testid="cancel-button"
                  type="button"
                  onClick={() => navigate(manageInstitutionsPageUrl)}
                  variant="contained"
                  color="info"
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

export default InstitutionView;
