import { FC, useEffect, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import {
  Alert, Box, Container, MenuItem,
  OutlinedInput, Select, Stack, Typography,
  styled,
} from '@mui/material';
import { cloneDeep } from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import bannerSvg from '../../assets/banner/profile_banner.png';
import profileIcon from '../../assets/icons/profile_icon.svg';
import GenericAlert from '../../components/GenericAlert';
import SuspenseLoader from '../../components/SuspenseLoader';
import { EDIT_ORG, EditOrgResp, GET_ORG, GetOrgResp, LIST_APPROVED_STUDIES, LIST_CURATORS, ListApprovedStudiesResp, ListCuratorsResp } from '../../graphql';

type Props = {
  _id: Organization["_id"] | "new"; // PREP for CRDCDH-402
};

type FormInput = EditOrganizationInput;

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
  fontSize: '18px',
});

const StyledLabel = styled('span')({
  color: '#356AAD',
  fontWeight: '700',
  marginRight: '20px',
  minWidth: '135px',
});

const BaseInputStyling = {
  width: "363px",
  borderRadius: "8px",
  backgroundColor: "#fff",
  color: "#083A50",
  "& .MuiInputBase-input": {
    fontWeight: 400,
    fontSize: "18px",
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
  "& .MuiList-root": {
    padding: 0,
  },
  "& .MuiMenuItem-root.Mui-selected": {
    background: "#D5EDE5",
  },
};

const StyledTextField = styled(OutlinedInput)(BaseInputStyling);

const StyledSelect = styled(Select)(BaseInputStyling);

const StyledButtonStack = styled(Stack)({
  marginTop: "50px",
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
  marginTop: "-118px",
  marginBottom: "120px",
  width: "100%",
});

/**
 * Edit/Create Organization View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const OrganizationView: FC<Props> = ({ _id }: Props) => {
  const navigate = useNavigate();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [changesAlert, setChangesAlert] = useState<string>("");

  const { handleSubmit, register, reset, control } = useForm<FormInput>();
  const editableFields: (keyof FormInput)[] = [
    "name",
    "conciergeID",
    "studies",
    "status",
  ];

  const { data: activeCurators } = useQuery<ListCuratorsResp>(LIST_CURATORS, {
    context: { clientName: 'userService' },
    fetchPolicy: "no-cache",
  });

  const { data: approvedStudies } = useQuery<ListApprovedStudiesResp>(LIST_APPROVED_STUDIES, {
    context: { clientName: 'backend' },
    fetchPolicy: "no-cache",
  });

  const [getOrganization] = useLazyQuery<GetOrgResp>(GET_ORG, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const [editOrganization] = useMutation<EditOrgResp>(EDIT_ORG, {
    context: { clientName: 'userService' },
    fetchPolicy: 'no-cache'
  });

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    const { data: d, errors } = await editOrganization({
      variables: {
        orgID: _id,
        ...data,
        studies: null, // TODO: Map study _id to approvedStudies with { studyName, studyAbbreviation }
      }
    }).catch((e) => ({ errors: e?.message, data: null }));
    setSaving(false);

    if (errors || !d?.editOrganization) {
      setError(errors || "Unable to save changes");
      return;
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
  const setFormValues = (data: FormInput, fields = editableFields) => {
    const resetData = {};

    fields.forEach((field) => {
      resetData[field] = cloneDeep(data[field]);
    });

    reset(resetData);
  };

  useEffect(() => {
    setError(null);

    (async () => {
      const { data, error } = await getOrganization({ variables: { orgID: _id } });

      if (error || !data?.getOrganization) {
        navigate("/organizations", { state: { error: "Unable to fetch user data" } });
        return;
      }

      setOrganization(data?.getOrganization);
      setFormValues(data?.getOrganization);
    })();
  }, [_id]);

  if (!organization) {
    return <SuspenseLoader />;
  }

  return (
    <>
      <GenericAlert open={!!changesAlert} key="organization-changes-alert">
        <span>
          {changesAlert}
        </span>
      </GenericAlert>
      <StyledBanner />
      <StyledContainer maxWidth="lg">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          spacing={2}
        >
          <StyledProfileIcon>
            {/* TODO: we need an organization icon */}
            <img src={profileIcon} alt="organization icon" />
          </StyledProfileIcon>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h4">
                {_id !== "new" ? "Edit" : "Create"}
                {" "}
                Organization
              </StyledPageTitle>
            </StyledTitleBox>
            <StyledHeader>
              <StyledHeaderText variant="h1">
                {organization.name}
              </StyledHeaderText>
            </StyledHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert sx={{ mb: 2, p: 2, width: "100%" }} severity="error">
                  {error || "An unknown API error occurred."}
                </Alert>
              )}

              <StyledField>
                {/* TODO: "name" or "organization"? */}
                <StyledLabel>Organization</StyledLabel>
                <StyledTextField {...register("name", { required: true })} size="small" required />
              </StyledField>
              <StyledField>
                <StyledLabel>Primary Contact</StyledLabel>
                <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
                  <Controller
                    name="conciergeID"
                    control={control}
                    rules={{ required: false }}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        size="small"
                        value={field.value || ""}
                        MenuProps={{ disablePortal: true }}
                      >
                        <MenuItem value="">{"<Not Set>"}</MenuItem>
                        {activeCurators?.listActiveCurators?.map(({ userID, firstName, lastName }) => (
                          <MenuItem value={userID}>{(`${firstName} ${lastName}`).trim()}</MenuItem>
                        ))}
                      </StyledSelect>
                    )}
                  />
                </Stack>
              </StyledField>
              <StyledField>
                <StyledLabel>Studies</StyledLabel>
                <Controller
                  name="studies"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      size="small"
                      value={field.value || []}
                      MenuProps={{ disablePortal: true }}
                      multiple
                    >
                      {approvedStudies?.listApprovedStudies?.map(({ studyName, studyAbbreviation }) => (
                        <MenuItem value={_id}>
                          {studyName}
                          {" ("}
                          {studyAbbreviation}
                          {") "}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  )}
                />
              </StyledField>
              <StyledField>
                <StyledLabel>Status</StyledLabel>
                <Controller
                  name="status"
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
              </StyledField>

              <StyledButtonStack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <StyledButton type="submit" loading={saving} txt="#22A584" border="#26B893">Save</StyledButton>
                <StyledButton type="button" onClick={() => navigate("/organizations")} txt="#949494" border="#828282">Cancel</StyledButton>
              </StyledButtonStack>
            </form>
          </Stack>
        </Stack>
      </StyledContainer>
    </>
  );
};

export default OrganizationView;
