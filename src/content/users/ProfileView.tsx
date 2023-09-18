import { FC, useEffect, useMemo, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import {
  Alert, Box, Container, MenuItem,
  OutlinedInput, Select, Stack, Typography,
  styled,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import bannerSvg from '../../assets/banner/profile_banner.svg';
import profileIcon from '../../assets/icons/profile_icon.svg';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import { useOrganizationListContext } from '../../components/Contexts/OrganizationListContext';
import GenericAlert from '../../components/GenericAlert';
import SuspenseLoader from '../../components/SuspenseLoader';
import { OrgRequiredRoles, Roles } from '../../config/AuthRoles';
import { EDIT_USER, EditUserResp, GET_USER, GetUserResp, UPDATE_MY_USER, UpdateMyUserResp } from '../../graphql';
import { formatIDP, getEditableFields } from '../../utils';

type Props = {
  _id: User["_id"];
};

type FormInput = UserInput | EditUserInput;

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
  transform: "translate(-219px, -75px)",
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
  fontWeight: 700
});

const StyledField = styled('div')({
  marginBottom: '10px',
  minHeight: '41px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const StyledLabel = styled('span')({
  color: '#356AAD',
  fontWeight: '700',
  marginRight: '20px',
  fontSize: '16px',
  minWidth: '113px',
});

const BaseInputStyling = {
  width: "363px",
  borderRadius: "8px",
  backgroundColor: "#fff",
  color: "#083A50",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "16px",
    fontFamily: "'Nunito', 'Rubik', sans-serif",
    padding: "10px",
    height: "20px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6B7294",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #209D7D",
    boxShadow: "2px 2px 4px 0px rgba(38, 184, 147, 0.10), -1px -1px 6px 0px rgba(38, 184, 147, 0.20)",
  },
};

const StyledTextField = styled(OutlinedInput)(BaseInputStyling);

const StyledSelect = styled(Select)(BaseInputStyling);

const StyledButtonStack = styled(Stack)({
  margin: "50px 0",
});

const StyledButton = styled(LoadingButton)(({ txt, border }: { txt: string, border: string }) => ({
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

const StyledTitleBox = styled(Box)({
  marginTop: "-98px",
  marginBottom: "100px",
  width: "100%",
});

/**
 * User Profile View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProfileView: FC<Props> = ({ _id }: Props) => {
  const navigate = useNavigate();
  const { data: orgData } = useOrganizationListContext();
  const { user: currentUser, setData } = useAuthContext();

  const [user, setUser] = useState<User | null>(_id === currentUser._id ? { ...currentUser } : null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [changesAlert, setChangesAlert] = useState<string>("");

  const { handleSubmit, register, reset, watch, setValue, control } = useForm<FormInput>();

  const role = watch("role");
  const orgFieldDisabled = useMemo(() => !OrgRequiredRoles.includes(role) && role !== "User", [role]);
  const fieldset = useMemo(() => getEditableFields(currentUser, user), [user?._id, _id]);

  const [getUser] = useLazyQuery<GetUserResp>(GET_USER, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const [updateMyUser] = useMutation<UpdateMyUserResp, { userInfo: UserInput }>(UPDATE_MY_USER, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const [editUser] = useMutation<EditUserResp>(EDIT_USER, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const onSubmit = async (data) => {
    setSaving(true);

    if (_id === currentUser._id) {
      const { data: d, errors } = await updateMyUser({
        variables: {
          userInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
          }
        }
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d) {
        setError(errors || "Unable to save profile changes");
        return;
      }

      setData(data as UserInput);
    } else {
      const { data: d, errors } = await editUser({
        variables: {
          userID: _id,
          organization: data.organization.orgID,
          role: data.role,
          status: data.userStatus,
        }
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d) {
        setError(errors || "Unable to save profile changes");
        return;
      }
    }

    setError(null);
    setChangesAlert("All changes have been saved");
    setTimeout(() => setChangesAlert(""), 10000);
    setFormValues(data);
  };

  /**
   * Updates the default form values after save or initial fetch
   *
   * @param data FormInput
   */
  const setFormValues = (data: FormInput, fields = fieldset) => {
    const resetData = {};

    fields.forEach((field) => {
      resetData[field] = cloneDeep(data[field]);
    });

    reset(resetData);
  };

  useEffect(() => {
    setError(null);

    // No action needed if viewing own profile, using cached data
    if (_id === currentUser._id) {
      setUser({ ...currentUser });
      setFormValues(currentUser, getEditableFields(currentUser, currentUser));
      return;
    }

    (async () => {
      const { data, error } = await getUser({ variables: { userID: _id } });

      if (error || !data?.getUser) {
        navigate("/users", { state: { error: "Unable to fetch user data" } });
        return;
      }

      setUser({ ...data?.getUser });
      setFormValues(data?.getUser);
    })();
  }, [_id]);

  useEffect(() => {
    if (orgFieldDisabled) {
      const nciID = orgData?.find((org) => org.orgName === "NCI")?.orgID;
      setValue("organization.orgID", nciID || "");
    }
  }, [orgFieldDisabled, user, orgData]);

  if (!user) {
    return <SuspenseLoader />;
  }

  return (
    <>
      <GenericAlert open={!!changesAlert} key="profile-changes-alert">
        <span>
          {changesAlert}
        </span>
      </GenericAlert>
      <StyledBanner />
      <Container maxWidth="lg">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <StyledProfileIcon>
            <img src={profileIcon} alt="profile icon" />
          </StyledProfileIcon>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h4">
                {currentUser?._id === _id ? "User Profile" : "Edit User Profile"}
              </StyledPageTitle>
            </StyledTitleBox>

            {error && (
              <Alert sx={{ m: 2, p: 2, width: "100%" }} severity="error">
                {error || "An unknown API error occurred."}
              </Alert>
            )}

            <StyledHeader>
              <StyledHeaderText variant="h1">
                {user.email}
              </StyledHeaderText>
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
                <StyledLabel>First name</StyledLabel>
                {fieldset.includes("firstName") ? (
                  <StyledTextField {...register("firstName", { required: true })} size="small" required />
                ) : user.firstName}
              </StyledField>
              <StyledField>
                <StyledLabel>Last name</StyledLabel>
                {fieldset.includes("lastName") ? (
                  <StyledTextField {...register("lastName", { required: true })} size="small" required />
                ) : user.lastName}
              </StyledField>
              <StyledField>
                <StyledLabel>Role</StyledLabel>
                {fieldset.includes("role") ? (
                  <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
                    <Controller
                      name="role"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <StyledSelect
                          {...field}
                          size="small"
                          MenuProps={{ disablePortal: true }}
                        >
                          {Roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                        </StyledSelect>
                      )}
                    />
                  </Stack>
                ) : user?.role}
              </StyledField>
              <StyledField>
                <StyledLabel>Account Status</StyledLabel>
                {fieldset.includes("userStatus") ? (
                  <Controller
                    name="userStatus"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        value={field.value || ""}
                        MenuProps={{ disablePortal: true }}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </StyledSelect>
                    )}
                  />
                ) : user.userStatus}
              </StyledField>
              <StyledField>
                <StyledLabel>Organization</StyledLabel>
                {fieldset.includes("organization") ? (
                  <Controller
                    name="organization.orgID"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        value={field.value || ""}
                        MenuProps={{ disablePortal: true }}
                        disabled={orgFieldDisabled}
                      >
                        <MenuItem value="">Select an organization</MenuItem>
                        {orgData?.map((org) => <MenuItem key={org.orgID} value={org.orgID}>{org.orgName}</MenuItem>)}
                      </StyledSelect>
                    )}
                  />
                ) : user?.organization?.orgName}
              </StyledField>

              <StyledButtonStack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                {fieldset?.length > 0 && <StyledButton type="submit" loading={saving} txt="#22A584" border="#26B893">Save</StyledButton>}
                {_id !== currentUser._id && <StyledButton type="button" onClick={() => navigate("/users")} txt="#949494" border="#828282">Cancel</StyledButton>}
              </StyledButtonStack>
            </form>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default ProfileView;
