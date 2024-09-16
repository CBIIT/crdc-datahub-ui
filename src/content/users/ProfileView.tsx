import { FC, useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import { Box, Container, MenuItem, Stack, Typography, styled } from "@mui/material";
import { cloneDeep } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import bannerSvg from "../../assets/banner/profile_banner.png";
import profileIcon from "../../assets/icons/profile_icon.svg";
import { useAuthContext, Status as AuthStatus } from "../../components/Contexts/AuthContext";
import {
  Status as OrgStatus,
  useOrganizationListContext,
} from "../../components/Contexts/OrganizationListContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import { OrgAssignmentMap, Roles } from "../../config/AuthRoles";
import {
  EDIT_USER,
  EditUserInput,
  EditUserResp,
  GET_USER,
  GetUserInput,
  GetUserResp,
  LIST_APPROVED_STUDIES,
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
import useProfileFields, { FieldState } from "../../hooks/useProfileFields";

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
  const { data: orgData, activeOrganizations, status: orgStatus } = useOrganizationListContext();
  const { user: currentUser, setData, logout, status: authStatus } = useAuthContext();
  const { lastSearchParams } = useSearchParamsContext();
  const { handleSubmit, register, reset, watch, setValue, control, formState } =
    useForm<FormInput>();

  const isSelf = _id === currentUser._id;
  const [user, setUser] = useState<User | null>(
    isSelf && viewType === "profile" ? { ...currentUser } : null
  );
  const [saving, setSaving] = useState<boolean>(false);
  const [orgList, setOrgList] = useState<Partial<Organization>[]>(undefined);

  const roleField = watch("role");
  const studiesField = watch("studies");
  const fieldset = useProfileFields({ _id: user?._id, role: roleField }, viewType);
  const visibleFieldState: FieldState[] = ["UNLOCKED", "DISABLED"];

  const userOrg = orgData?.find((org) => org._id === user?.organization?.orgID);
  const manageUsersPageUrl = `/users${lastSearchParams?.["/users"] ?? ""}`;

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

  const { data: approvedStudies } = useQuery<ListApprovedStudiesResp>(LIST_APPROVED_STUDIES, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
    skip: fieldset.studies !== "UNLOCKED",
  });

  // TODO: This is temporary until the API supports sorting natively
  const sortedStudies = useMemo<ApprovedStudy[]>( // TODO: FIX with new API structure
    () =>
      cloneDeep(approvedStudies?.listApprovedStudies?.studies)?.sort((a, b) =>
        a.studyName.localeCompare(b.studyName)
      ) || [],
    [approvedStudies]
  );

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
          organization: data.organization,
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

  useEffect(() => {
    // No action needed if viewing own profile, using cached data
    if (isSelf && viewType === "profile") {
      setUser({ ...currentUser });
      reset({
        ...currentUser,
        organization: currentUser.organization?.orgID || "",
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
        organization: data?.getUser.organization?.orgID || "",
      });
    })();
  }, [_id]);

  useEffect(() => {
    if (fieldset.organization !== "DISABLED" || !OrgAssignmentMap[roleField]) {
      return;
    }

    const expectedOrg = orgData?.find((org) => org.name === OrgAssignmentMap[roleField])?._id;
    setValue("organization", expectedOrg || "");
  }, [fieldset.organization === "DISABLED", roleField, user, orgData]);

  useEffect(() => {
    if (!user || orgStatus === OrgStatus.LOADING) {
      return;
    }
    if (userOrg?.status === "Inactive") {
      setOrgList(
        [...activeOrganizations, userOrg].sort((a, b) => a.name?.localeCompare(b.name || ""))
      );
      return;
    }

    setOrgList(activeOrganizations || []);
  }, [activeOrganizations, userOrg, user, orgStatus]);

  useEffect(() => {
    if (roleField === "User" && "role" in formState.dirtyFields && formState.dirtyFields.role) {
      setValue("organization", "");
    }
  }, [roleField]);

  if (
    !user ||
    orgStatus === OrgStatus.LOADING ||
    authStatus === AuthStatus.LOADING ||
    orgList === undefined
  ) {
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
                    {...register("firstName", { required: true })}
                    size="small"
                    inputProps={{ "aria-labelledby": "firstNameLabel" }}
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
                    {...register("lastName", { required: true })}
                    size="small"
                    required
                    inputProps={{ "aria-labelledby": "lastNameLabel" }}
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
                  user?.role
                )}
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
              <StyledField>
                <StyledLabel id="userOrganizationLabel">Organization</StyledLabel>
                {visibleFieldState.includes(fieldset.organization) ? (
                  <Controller
                    name="organization"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        MenuProps={{ disablePortal: true }}
                        disabled={fieldset.organization === "DISABLED"}
                        inputProps={{
                          "aria-labelledby": "userOrganizationLabel",
                        }}
                      >
                        <MenuItem value="">{"<Not Set>"}</MenuItem>
                        {orgList?.map((org) => (
                          <MenuItem key={org._id} value={org._id}>
                            {org.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                ) : (
                  user?.organization?.orgName
                )}
              </StyledField>
              <StyledField visible={fieldset.studies !== "HIDDEN"}>
                <StyledLabel id="userStudies">Studies</StyledLabel>
                {visibleFieldState.includes(fieldset.studies) ? (
                  <div style={{ position: "relative" }}>
                    <Controller
                      name="studies"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <StyledSelect
                          {...field}
                          size="small"
                          value={field.value || []}
                          disabled={fieldset.studies === "DISABLED"}
                          MenuProps={{ disablePortal: true }}
                          inputProps={{ "aria-labelledby": "userStudies" }}
                          renderValue={(selected: string[]) =>
                            formatStudySelectionValue(selected, sortedStudies)
                          }
                          multiple
                        >
                          {sortedStudies?.map(({ _id, studyName, studyAbbreviation }) => (
                            <MenuItem key={_id} value={_id}>
                              {formatFullStudyName(studyName, studyAbbreviation)}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                      )}
                    />
                    {studiesField?.length > 1 && (
                      <StyledSelectionCount>
                        * {studiesField?.length} Studies selected
                      </StyledSelectionCount>
                    )}
                  </div>
                ) : null}
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
