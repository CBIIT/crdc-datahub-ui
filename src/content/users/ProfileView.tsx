import { FC, useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  Alert, Button, Container, IconButton,
  OutlinedInput, Stack, Typography, styled,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Controller, useForm } from 'react-hook-form';
import bannerSvg from '../../assets/banner/profile_banner.svg';
import profileIcon from '../../assets/icons/profile_icon.svg';
import { UPDATE_MY_USER, UpdateMyUserResp } from '../../graphql';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import SuspenseLoader from '../../components/SuspenseLoader';

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

const StyledProfileIcon = styled("img")({
  marginTop: "-70px",
  marginRight: "35px",
  borderRadius: "50%",
});

const StyledHeader = styled("div")({
  textAlign: "left",
  width: "100%",
  marginTop: "30px",
  marginBottom: "50px",
});

const StyledHeaderText = styled(Typography)({
  fontSize: "26px",
  lineHeight: "35px",
  color: "#083A50",
  fontWeight: 700
});

const StyledField = styled('div')({
  margin: '0px 0px 20px 0px',
});

const StyledLabel = styled('span')({
  color: '#356AAD',
  fontWeight: '700',
  lineHeight: '19.6px',
  margin: '0px 20px 0px 0px',
  size: '16px',
});

const StyledIconBtn = styled(IconButton)({
  color: "#119472",
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
  "& ::placeholder": {
    color: "#929296",
    fontWeight: 400,
    opacity: 1
  },
});

/**
 * User Profile View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProfileView: FC<Props> = ({ _id } : Props) => {
  const { user: currentUser, setData } = useAuthContext();
  const user: User = _id === currentUser._id ? currentUser : null; // NOTE: This is prep for MVP-2
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, control, reset } = useForm<UserInput>({
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
    const { errors } = await updateMyUser({ variables: { userInfo: data } });

    if (errors) {
      setError("Unable to save profile changes");
      return;
    }

    if (_id === currentUser._id) {
      setData(data);
    }
  };

  const onReset = () => reset();

  if (!user) {
    return <SuspenseLoader />;
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
          {/* TODO: Drop shadow missing */}
          <StyledProfileIcon src={profileIcon} alt="profile icon" />

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            {error && (
              <Alert sx={{ m: 2, p: 2, width: "100%" }} severity="error">
                {error || "An error occurred while loading the data."}
              </Alert>
            )}
            <StyledHeader>
              <StyledHeaderText variant="h4">
                {user.email}
              </StyledHeaderText>
            </StyledHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <StyledField>
                <StyledLabel>Account Type</StyledLabel>
                {user.IDP.toUpperCase()}
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
                  render={({ field }) => <StyledTextField {...field} size="small" />}
                />
                <StyledIconBtn>
                  <EditIcon />
                </StyledIconBtn>
              </StyledField>
              <StyledField>
                <StyledLabel>Last name</StyledLabel>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => <StyledTextField {...field} size="small" />}
                />
                <StyledIconBtn>
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
                {user?.organization?.orgName ?? 'N/A'}
              </StyledField>

              {/* TODO: centered in form */}
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <Button type="submit">Save</Button>
                <Button type="button" onClick={onReset}>Cancel</Button>
              </Stack>
            </form>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default ProfileView;
