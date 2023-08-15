import { FC, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {
  Alert, Container, IconButton,
  OutlinedInput, Stack, Typography, styled,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import EditIcon from '@mui/icons-material/Edit';
import { Controller, useForm } from 'react-hook-form';
import bannerSvg from '../../assets/banner/profile_banner.svg';
import profileIcon from '../../assets/icons/profile_icon.svg';
import profileIconShadow from '../../assets/icons/profile_icon_shadow.svg';
import { UPDATE_MY_USER, UpdateMyUserResp } from '../../graphql';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import { formatIDP } from '../../utils';

type Props = {
  _id: User["_id"];
};

const StyledBanner = styled("div")({
  background: `url(${bannerSvg})`,
  backgroundBlendMode: "luminosity, normal",
  backgroundSize: "cover",
  backgroundPosition: "center",
  width: "100%",
  height: "146px",
});

const StyledProfileIcon = styled("div")({
  position: "relative",
  transform: "translate(-219px, -75px)",
  "& img": {
    position: "absolute",
  },
  "& img:nth-of-type(1)": {
    zIndex: 2,
  },
  "& img:nth-of-type(2)": {
    zIndex: 1,
    transform: "translate(11px, 8px)",
  }
});

const StyledHeader = styled("div")({
  textAlign: "left",
  width: "100%",
  marginTop: "30px",
  marginBottom: "34px",
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
  size: '16px',
});

const StyledIconBtn = styled(IconButton)({
  color: "#119472",
  cursor: "inherit",
});

const StyledTextField = styled(OutlinedInput)({
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
});

const StyledButtonStack = styled(Stack)({
  margin: "50px 0",
});

const StyledButton = styled(LoadingButton)(({ txt, border } : { txt: string, border: string }) => ({
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

/**
 * User Profile View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProfileView: FC<Props> = ({ _id } : Props) => {
  const { user: currentUser, setData } = useAuthContext();
  const user: User = _id === currentUser._id ? { ...currentUser } : null; // NOTE: This is prep for MVP-2
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const { handleSubmit, control, formState, reset } = useForm<UserInput>({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
    },
  });

  const [updateMyUser] = useMutation<UpdateMyUserResp, { userInfo: UserInput }>(UPDATE_MY_USER, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const onSubmit = async (data : UserInput) => {
    if (!formState.isDirty) return;

    setSaving(true);
    const { errors } = await updateMyUser({ variables: { userInfo: data } });
    setSaving(false);

    if (errors) {
      setError("Unable to save profile changes");
      return;
    }
    if (_id === currentUser._id) {
      setData(data);
    }

    reset({ ...data });
  };

  const onReset = () => {
    if (!formState.isDirty) return;

    reset();
  };

  if (!user) {
    // NOTE for MVP-2: This is the loading indicator when fetching user data
    // Disabled because it will load forever if currentUser._id is not _id ATM
    return <Navigate to={`/users/${currentUser?._id}`} />;
  }

  return (
    <>
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
            <img src={profileIconShadow} alt="profile icon shadow" />
          </StyledProfileIcon>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
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
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <StyledTextField {...field} size="small" required />}
                />
                <StyledIconBtn disableRipple>
                  <EditIcon />
                </StyledIconBtn>
              </StyledField>
              <StyledField>
                <StyledLabel>Last name</StyledLabel>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <StyledTextField {...field} size="small" required />}
                />
                <StyledIconBtn disableRipple>
                  <EditIcon />
                </StyledIconBtn>
              </StyledField>
              <StyledField>
                <StyledLabel>Role</StyledLabel>
                {user?.organization?.orgRole ?? user?.role}
              </StyledField>
              <StyledField>
                <StyledLabel>Account Status</StyledLabel>
                {user.userStatus}
              </StyledField>
              <StyledField>
                <StyledLabel>Organization</StyledLabel>
                {user?.organization?.orgName}
              </StyledField>

              <StyledButtonStack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <StyledButton type="submit" loading={saving} txt="#22A584" border="#26B893">Save</StyledButton>
                <StyledButton type="button" onClick={onReset} txt="#949494" border="#828282">Cancel</StyledButton>
              </StyledButtonStack>
            </form>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default ProfileView;
