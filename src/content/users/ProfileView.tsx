import { FC, useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Box, Container, MenuItem, Stack, TextField, Typography, styled } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import bannerSvg from "../../assets/banner/profile_banner.png";
import profileIcon from "../../assets/icons/profile_icon.svg";
import { useAuthContext, Status as AuthStatus } from "../../components/Contexts/AuthContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import { Roles } from "../../config/AuthRoles";
import {
  EDIT_USER,
  EditUserInput,
  EditUserResp,
  GET_USER,
  GetUserInput,
  GetUserResp,
  LIST_APPROVED_STUDIES,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
  UPDATE_MY_USER,
  UpdateMyUserInput,
  UpdateMyUserResp,
} from "../../graphql";
import { formatFullStudyName, formatIDP, formatStudySelectionValue } from "../../utils";
import { DataCommons } from "../../config/DataCommons";
import usePageTitle from "../../hooks/usePageTitle";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import BaseAutocomplete from "../../components/StyledFormComponents/StyledAutocomplete";
import useProfileFields, { FieldState } from "../../hooks/useProfileFields";
import AccessRequest from "../../components/AccessRequest";

type Props = {
  _id: User["_id"];
  viewType: "users" | "profile";
};

type FormInput = UpdateMyUserInput["userInfo"] | EditUserInput;

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

const StyledAutocomplete = styled(BaseAutocomplete)(BaseInputStyling);
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

const StyledTag = styled("div")({
  position: "absolute",
  paddingLeft: "12px",
});

/**
 * User Profile View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProfileView: FC<Props> = ({ _id, viewType }: Props) => {
  usePageTitle(viewType === "profile" ? "User Profile" : `Edit User ${_id}`);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser, setData, logout, status: authStatus } = useAuthContext();
  const { lastSearchParams } = useSearchParamsContext();
  const { handleSubmit, register, reset, watch, control } = useForm<FormInput>();

  const isSelf = _id === currentUser._id;
  const [user, setUser] = useState<User | null>(
    isSelf && viewType === "profile" ? { ...currentUser } : null
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [studyOptions, setStudyOptions] = useState<string[]>([]);

  const roleField = watch("role");
  const fieldset = useProfileFields({ _id: user?._id, role: roleField }, viewType);
  const visibleFieldState: FieldState[] = ["UNLOCKED", "DISABLED"];

  const manageUsersPageUrl = `/users${lastSearchParams?.["/users"] ?? ""}`;

  const canRequestRole: boolean = useMemo<boolean>(() => {
    if (viewType !== "profile" || _id !== currentUser._id) {
      return false;
    }

    return true;
  }, [user, _id, currentUser, viewType]);

  const [getUser] = useLazyQuery<GetUserResp, GetUserInput>(GET_USER, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [updateMyUser] = useMutation<UpdateMyUserResp, UpdateMyUserInput>(UPDATE_MY_USER, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [editUser] = useMutation<EditUserResp, EditUserInput>(EDIT_USER, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const { data: approvedStudies, loading: approvedStudiesLoading } = useQuery<
    ListApprovedStudiesResp,
    ListApprovedStudiesInput
  >(LIST_APPROVED_STUDIES, {
    variables: {
      // show all access types
      controlledAccess: "All",
      first: -1,
      offset: 0,
      orderBy: "studyName",
      sortDirection: "asc",
    },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
    skip: fieldset.studies !== "UNLOCKED",
  });

  const formattedStudyMap = useMemo<Record<string, string>>(() => {
    if (!approvedStudies?.listApprovedStudies?.studies) {
      return {};
    }

    return approvedStudies.listApprovedStudies.studies.reduce(
      (acc, { _id, studyName, studyAbbreviation }) => ({
        ...acc,
        [_id]: formatFullStudyName(studyName, studyAbbreviation),
      }),
      {}
    );
  }, [approvedStudies?.listApprovedStudies?.studies]);

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    // Save profile changes
    if (isSelf && viewType === "profile" && "firstName" in data && "lastName" in data) {
      const { data: d, errors } = await updateMyUser({
        variables: {
          userInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d?.updateMyUser) {
        enqueueSnackbar(errors || "Unable to save profile changes", { variant: "error" });
        return;
      }

      setData(d.updateMyUser);
      // Save user changes
    } else if (viewType === "users" && "role" in data) {
      const { data: d, errors } = await editUser({
        variables: {
          userID: _id,
          role: data.role,
          userStatus: data.userStatus,
          studies: fieldset.studies !== "HIDDEN" ? data.studies : null,
          dataCommons: fieldset.dataCommons !== "HIDDEN" ? data.dataCommons : null,
        },
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d?.editUser) {
        enqueueSnackbar(errors || "Unable to save user profile changes", { variant: "error" });
        return;
      }

      if (isSelf) {
        setData(d.editUser);
        if (d.editUser.userStatus === "Inactive") {
          logout();
        }
      }
    }

    enqueueSnackbar("All changes have been saved", { variant: "success" });
    if (viewType === "users") {
      navigate(manageUsersPageUrl);
    }
  };

  const sortStudyOptions = () => {
    const val = watch("studies");
    const options = Object.keys(formattedStudyMap);

    const selectedOptions = val
      .filter((v) => options.includes(v))
      .sort((a, b) => formattedStudyMap[a]?.localeCompare(formattedStudyMap?.[b]));
    const unselectedOptions = options
      .filter((o) => !selectedOptions.includes(o))
      .sort((a, b) => formattedStudyMap[a]?.localeCompare(formattedStudyMap?.[b]));

    setStudyOptions([...selectedOptions, ...unselectedOptions]);
  };

  useEffect(() => {
    // No action needed if viewing own profile, using cached data
    if (isSelf && viewType === "profile") {
      setUser({ ...currentUser });
      reset({
        ...currentUser,
        studies: currentUser.studies?.map((s: ApprovedStudy) => s?._id) || [],
      });
      return;
    }

    (async () => {
      const { data, error } = await getUser({ variables: { userID: _id } });

      if (error || !data?.getUser) {
        navigate(manageUsersPageUrl, {
          state: { error: "Unable to fetch user data" },
        });
        return;
      }

      setUser({ ...data?.getUser });
      reset({
        ...data?.getUser,
        studies: data?.getUser?.studies?.map((s: ApprovedStudy) => s?._id) || [],
      });
    })();
  }, [_id]);

  useEffect(() => {
    if (fieldset.studies === "UNLOCKED") {
      sortStudyOptions();
    }
  }, [formattedStudyMap]);

  if (!user || authStatus === AuthStatus.LOADING) {
    return <SuspenseLoader />;
  }

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
                {viewType === "profile" ? "User Profile" : "Edit User"}
              </StyledPageTitle>
            </StyledTitleBox>
            <StyledHeader>
              <StyledHeaderText variant="h2">{user.email}</StyledHeaderText>
            </StyledHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <StyledField>
                <StyledLabel>Account Type</StyledLabel>
                {formatIDP(user.IDP)}
              </StyledField>
              <StyledField>
                <StyledLabel>Email</StyledLabel>
                {user.email}
              </StyledField>
              <StyledField>
                <StyledLabel id="firstNameLabel">First name</StyledLabel>
                {visibleFieldState.includes(fieldset.firstName) ? (
                  <StyledTextField
                    {...register("firstName", {
                      required: true,
                      maxLength: 30,
                      setValueAs: (v: string) => v?.trim(),
                    })}
                    inputProps={{ "aria-labelledby": "firstNameLabel", maxLength: 30 }}
                    size="small"
                    required
                  />
                ) : (
                  user.firstName
                )}
              </StyledField>
              <StyledField>
                <StyledLabel id="lastNameLabel">Last name</StyledLabel>
                {visibleFieldState.includes(fieldset.lastName) ? (
                  <StyledTextField
                    {...register("lastName", {
                      required: true,
                      maxLength: 30,
                      setValueAs: (v: string) => v?.trim(),
                    })}
                    inputProps={{ "aria-labelledby": "lastNameLabel", maxLength: 30 }}
                    size="small"
                    required
                  />
                ) : (
                  user.lastName
                )}
              </StyledField>
              <StyledField>
                <StyledLabel id="userRoleLabel">Role</StyledLabel>
                {visibleFieldState.includes(fieldset.role) ? (
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        MenuProps={{ disablePortal: true }}
                        inputProps={{ "aria-labelledby": "userRoleLabel" }}
                      >
                        {Roles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                ) : (
                  <>
                    {user?.role}
                    {canRequestRole && <AccessRequest />}
                  </>
                )}
              </StyledField>
              <StyledField visible={fieldset.studies !== "HIDDEN"}>
                <StyledLabel id="userStudies">Studies</StyledLabel>
                {visibleFieldState.includes(fieldset.studies) ? (
                  <Controller
                    name="studies"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <StyledAutocomplete
                        {...field}
                        renderInput={({ inputProps, ...params }) => (
                          <TextField
                            {...params}
                            placeholder={
                              watch("studies")?.length > 0 ? undefined : "Select studies"
                            }
                            inputProps={{ "aria-labelledby": "userStudies", ...inputProps }}
                            onBlur={sortStudyOptions}
                          />
                        )}
                        renderTags={(value: string[], _, state) => {
                          if (value?.length === 0 || state.focused) {
                            return null;
                          }

                          return (
                            <StyledTag>
                              {formatStudySelectionValue(value, formattedStudyMap)}
                            </StyledTag>
                          );
                        }}
                        options={studyOptions}
                        getOptionLabel={(option: string) => formattedStudyMap[option]}
                        onChange={(_, data: string[]) => field.onChange(data)}
                        disabled={fieldset.studies === "DISABLED"}
                        loading={approvedStudiesLoading}
                        disableCloseOnSelect
                        multiple
                      />
                    )}
                  />
                ) : null}
              </StyledField>
              <StyledField>
                <StyledLabel id="userStatusLabel">Account Status</StyledLabel>
                {visibleFieldState.includes(fieldset.userStatus) ? (
                  <Controller
                    name="userStatus"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        MenuProps={{ disablePortal: true }}
                        inputProps={{ "aria-labelledby": "userStatusLabel" }}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </StyledSelect>
                    )}
                  />
                ) : (
                  user.userStatus
                )}
              </StyledField>
              <StyledField visible={fieldset.dataCommons !== "HIDDEN"}>
                <StyledLabel id="userDataCommons">Data Commons</StyledLabel>
                {visibleFieldState.includes(fieldset.dataCommons) ? (
                  <Controller
                    name="dataCommons"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        value={field.value || []}
                        disabled={fieldset.dataCommons === "DISABLED"}
                        MenuProps={{ disablePortal: true }}
                        inputProps={{ "aria-labelledby": "userDataCommons" }}
                        multiple
                      >
                        {DataCommons.map((dc) => (
                          <MenuItem key={dc.name} value={dc.name}>
                            {dc.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                ) : (
                  user.dataCommons?.join(", ")
                )}
              </StyledField>

              <StyledButtonStack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                {Object.values(fieldset).some((fieldState) => fieldState === "UNLOCKED") && (
                  <StyledButton type="submit" loading={saving} txt="#14634F" border="#26B893">
                    Save
                  </StyledButton>
                )}
                {viewType === "users" && (
                  <StyledButton
                    type="button"
                    onClick={() => navigate(manageUsersPageUrl)}
                    txt="#666666"
                    border="#828282"
                  >
                    Cancel
                  </StyledButton>
                )}
              </StyledButtonStack>
            </form>
          </StyledContentStack>
        </Stack>
      </StyledContainer>
    </>
  );
};

export default ProfileView;
