import { FC, useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Container,
  MenuItem,
  Popper,
  Stack,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { cloneDeep } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import bannerSvg from "../../assets/banner/profile_banner.png";
import programIcon from "../../assets/icons/program_icon.svg";
import SuspenseLoader from "../../components/SuspenseLoader";
import {
  CREATE_ORG,
  CreateOrgResp,
  EDIT_ORG,
  EditOrgResp,
  GET_ORG,
  GetOrgResp,
  LIST_APPROVED_STUDIES,
  ListApprovedStudiesResp,
  LIST_ACTIVE_DCPS,
  ListActiveDCPsResp,
  EditOrgInput,
  CreateOrgInput,
  ListApprovedStudiesInput,
} from "../../graphql";
import ConfirmDialog from "../../components/AdminPortal/Organizations/ConfirmDialog";
import usePageTitle from "../../hooks/usePageTitle";
import {
  filterAlphaNumeric,
  formatFullStudyName,
  mapOrganizationStudyToId,
  validateUTF8,
} from "../../utils";
import { useSearchParamsContext } from "../../components/Contexts/SearchParamsContext";
import BaseAsterisk from "../../components/StyledFormComponents/StyledAsterisk";
import BaseSelect from "../../components/StyledFormComponents/StyledSelect";
import BaseOutlinedInput from "../../components/StyledFormComponents/StyledOutlinedInput";
import BaseAutocomplete, {
  StyledPaper as BasePaper,
} from "../../components/StyledFormComponents/StyledAutocomplete";

type Props = {
  /**
   * @see Organization["_id"] | "new"
   */
  _id: string;
};

type FormInput = Omit<EditOrgInput, "orgID" | "studies"> & {
  studies: string[];
};

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
  justifyContent: "flex-start",
  fontSize: "18px",
});

const StyledLabel = styled("span")({
  color: "#356AAD",
  fontWeight: "700",
  marginRight: "40px",
  minWidth: "135px",
});

const BaseInputStyling = {
  width: "363px",
};

const StyledTextField = styled(BaseOutlinedInput)({
  ...BaseInputStyling,
  "& .MuiInputBase-inputMultiline": {
    resize: "vertical",
    minHeight: "44px",
  },
});
const StyledSelect = styled(BaseSelect)(BaseInputStyling);
const StyledAutocomplete = styled(BaseAutocomplete)(BaseInputStyling);

const StyledPaper = styled(BasePaper)({
  maxHeight: "300px",
  "& .MuiAutocomplete-listbox": { width: "fit-content", minWidth: "100%", maxHeight: "unset" },
  "& .MuiAutocomplete-option": { whiteSpace: "nowrap" },
});

const StyledPopper = styled(Popper)({
  width: "463px !important",
});

const StyledTag = styled("div")({
  position: "absolute",
  paddingLeft: "12px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  maxWidth: "calc(100% - 24px)",
  textOverflow: "ellipsis",
});

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
  marginLeft: "-2px !important",
});

const StyledTitleBox = styled(Box)({
  marginTop: "-86px",
  marginBottom: "88px",
  width: "100%",
});

/**
 * Data Submission statuses that reflect an inactive submission
 */
const inactiveSubmissionStatus: SubmissionStatus[] = ["Completed"];

/**
 * Edit/Create Organization View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const OrganizationView: FC<Props> = ({ _id }: Props) => {
  const isNew = _id && _id === "new";
  usePageTitle(`${!isNew && _id ? "Edit" : "Add"} Program ${!isNew && _id ? _id : ""}`.trim());

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { lastSearchParams } = useSearchParamsContext();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dataSubmissions, setDataSubmissions] = useState<Partial<Submission>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [studyOptions, setStudyOptions] = useState<string[]>([]);

  const manageOrgPageUrl = `/programs${lastSearchParams?.["/programs"] ?? ""}`;

  const assignedStudies: string[] = useMemo(() => {
    const activeStudies = {};
    const activeSubs = dataSubmissions?.filter(
      (ds) => !inactiveSubmissionStatus.includes(ds?.status)
    );

    organization?.studies?.forEach((s) => {
      // NOTE: The `Submission` type only has `studyAbbreviation`, we cannot compare IDs
      if (activeSubs?.some((ds) => ds?.studyAbbreviation === s?.studyAbbreviation)) {
        activeStudies[s?.studyAbbreviation] = true;
      }
    });

    return Object.keys(activeStudies) || [];
  }, [organization, dataSubmissions]);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm<FormInput>();
  const studiesField = watch("studies");

  const { data: activeDCPs } = useQuery<ListActiveDCPsResp>(LIST_ACTIVE_DCPS, {
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const {
    data: approvedStudies,
    loading: approvedStudiesLoading,
    refetch: refetchStudies,
  } = useQuery<ListApprovedStudiesResp, ListApprovedStudiesInput>(LIST_APPROVED_STUDIES, {
    variables: { first: -1, orderBy: "studyName", sortDirection: "asc" },
    context: { clientName: "backend" },
    fetchPolicy: "cache-and-network",
  });

  const [getOrganization] = useLazyQuery<GetOrgResp>(GET_ORG, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [editOrganization] = useMutation<EditOrgResp, EditOrgInput>(EDIT_ORG, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const [createOrganization] = useMutation<CreateOrgResp, CreateOrgInput>(CREATE_ORG, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
  });

  const formattedStudyMap = useMemo<Record<string, string>>(() => {
    if (!approvedStudies?.listApprovedStudies?.studies) {
      return {};
    }

    const studyIdMap = approvedStudies.listApprovedStudies.studies.reduce(
      (acc, { _id, studyName, studyAbbreviation }) => ({
        ...acc,
        [_id]: formatFullStudyName(studyName, studyAbbreviation),
      }),
      {}
    );

    return studyIdMap;
  }, [approvedStudies?.listApprovedStudies?.studies]);

  const sortStudyOptions = () => {
    const options = Object.keys(formattedStudyMap);

    const selectedOptions =
      studiesField
        ?.filter((v) => options.includes(v))
        ?.sort((a, b) => formattedStudyMap[a]?.localeCompare(formattedStudyMap?.[b])) || [];
    const unselectedOptions = options
      .filter((o) => !selectedOptions.includes(o))
      .sort((a, b) => formattedStudyMap[a]?.localeCompare(formattedStudyMap?.[b]));

    setStudyOptions([...selectedOptions, ...unselectedOptions]);
  };

  /**
   * Updates the default form values after save or initial fetch
   *
   * @param data FormInput
   */
  const setFormValues = (data: FormInput) => {
    const fields: (keyof FormInput)[] = [
      "name",
      "abbreviation",
      "description",
      "conciergeID",
      "studies",
      "status",
    ];
    const resetData = {};

    fields.forEach((field) => {
      resetData[field] = cloneDeep(data[field]);
    });

    reset(resetData);
  };

  const onSubmit = async (data: FormInput) => {
    setSaving(true);

    const variables = {
      ...data,
      studies: data.studies.map((studyID) => ({ studyID })),
    };

    if (_id === "new" && !organization?._id) {
      const { data: d, errors } = await createOrganization({ variables }).catch((e) => ({
        errors: e?.message,
        data: null,
      }));
      setSaving(false);

      if (errors || !d?.createOrganization?._id) {
        setError(errors || "Unable to create program");
        return;
      }

      setOrganization(null);
      setDataSubmissions(null);
      enqueueSnackbar("This program has been successfully added.", {
        variant: "default",
      });
      reset();
    } else {
      const { data: d, errors } = await editOrganization({
        variables: { orgID: organization._id, ...variables },
      }).catch((e) => ({ errors: e?.message, data: null }));
      setSaving(false);

      if (errors || !d?.editOrganization) {
        setError(errors || "Unable to save changes");
        return;
      }

      enqueueSnackbar("All changes have been saved", { variant: "default" });
      setFormValues(data);
      setOrganization((prev: Organization) => ({
        ...prev,
        studies: d.editOrganization.studies,
      }));
    }

    setError(null);
    navigate(manageOrgPageUrl);
  };

  const handleBypassWarning = () => {
    setConfirmOpen(false);
    handleSubmit(onSubmit)();
  };

  const handlePreSubmit = (data: FormInput) => {
    if (_id !== "new") {
      const studyMap: { [_id: string]: ApprovedStudy["studyAbbreviation"] } = {};
      approvedStudies?.listApprovedStudies?.studies?.forEach(({ _id, studyAbbreviation }) => {
        studyMap[_id] = studyAbbreviation;
      });

      const newStudies = data.studies.map((_id) => studyMap[_id]);
      const previousStudies = organization?.studies?.map((s) => s?.studyAbbreviation) || [];
      const removedActiveStudies = previousStudies
        .filter((studyAbbr) => !newStudies?.includes(studyAbbr))
        .filter((studyAbbr) => assignedStudies.includes(studyAbbr)).length;

      // If there are active submissions for a study being removed, show a warning
      if (removedActiveStudies) {
        setConfirmOpen(true);
        return;
      }
    }

    onSubmit(data);
  };

  useEffect(() => {
    setError(null);

    if (_id === "new") {
      setOrganization(null);
      setDataSubmissions(null);
      setFormValues({
        name: "",
        abbreviation: "",
        description: "",
        conciergeID: "",
        studies: [],
        status: "Active",
      });
      return;
    }

    (async () => {
      const { data, error } = await getOrganization({
        variables: { orgID: _id, organization: _id },
      });
      if (error || !data?.getOrganization) {
        navigate(manageOrgPageUrl, {
          state: { error: "Unable to fetch program" },
        });
        return;
      }

      // No studies or original request did not complete. Refetch
      let studyList: ApprovedStudy[] = approvedStudies?.listApprovedStudies?.studies;
      if (!studyList?.length) {
        const { data } = await refetchStudies();
        studyList = data?.listApprovedStudies?.studies;
      }

      setOrganization(data?.getOrganization);
      setDataSubmissions(data?.listSubmissions?.submissions);
      setFormValues({
        ...data?.getOrganization,
        studies:
          data?.getOrganization?.studies
            ?.map((s) => mapOrganizationStudyToId(s, studyList || []))
            ?.filter((_id) => !!_id) || [],
      });
    })();
  }, [_id]);

  useEffect(() => {
    sortStudyOptions();
  }, [formattedStudyMap, organization?.studies]);

  if (!organization && _id !== "new") {
    return <SuspenseLoader />;
  }

  return (
    <>
      <StyledBanner />
      <StyledContainer maxWidth="lg">
        <Stack direction="row" justifyContent="center" alignItems="flex-start" spacing={2}>
          <StyledProfileIcon>
            <img src={programIcon} alt="program icon" />
          </StyledProfileIcon>
          <StyledContentStack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <StyledTitleBox>
              <StyledPageTitle variant="h1">
                {_id !== "new" ? "Edit" : "Add"} Program
              </StyledPageTitle>
            </StyledTitleBox>

            <form onSubmit={handleSubmit(handlePreSubmit)}>
              {error && (
                <Alert sx={{ mb: 2, p: 2, width: "100%" }} severity="error">
                  {error || "An unknown API error occurred."}
                </Alert>
              )}

              <StyledField>
                <StyledLabel id="organizationName">
                  Program <BaseAsterisk />
                </StyledLabel>
                <StyledTextField
                  {...register("name", {
                    required: true,
                    setValueAs: (val) => val?.trim(),
                    validate: { utf8: validateUTF8 },
                  })}
                  inputProps={{ "aria-labelledby": "organizationName" }}
                  error={!!errors.name}
                  required
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="abbreviationLabel">
                  Abbreviation <BaseAsterisk />
                </StyledLabel>
                <Controller
                  name="abbreviation"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <StyledTextField
                      {...field}
                      onChange={(e) => {
                        field.onChange(filterAlphaNumeric(e.target.value?.toUpperCase(), "- "));
                      }}
                      inputProps={{
                        "aria-labelledby": "abbreviationLabel",
                        maxLength: 100,
                      }}
                      placeholder="100 characters allowed"
                      error={!!errors.abbreviation}
                      required
                    />
                  )}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="descriptionLabel">Description</StyledLabel>
                <StyledTextField
                  {...register("description", { required: false })}
                  inputProps={{
                    "aria-labelledby": "descriptionLabel",
                    maxLength: 500,
                  }}
                  error={!!errors.description}
                  placeholder="500 characters allowed"
                  rows={2}
                  multiline
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="primaryContactLabel">Primary Contact</StyledLabel>
                <Controller
                  name="conciergeID"
                  control={control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      value={field.value || ""}
                      MenuProps={{ disablePortal: true }}
                      inputProps={{
                        "aria-labelledby": "primaryContactLabel",
                      }}
                      error={!!errors.conciergeID}
                    >
                      <MenuItem value={null}>{"<Not Set>"}</MenuItem>
                      {activeDCPs?.listActiveDCPs?.map(({ userID, firstName, lastName }) => (
                        <MenuItem key={userID} value={userID}>
                          {`${firstName} ${lastName}`.trim()}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  )}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="studiesLabel">Studies</StyledLabel>
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
                          placeholder={studiesField?.length > 0 ? undefined : "Select studies"}
                          inputProps={{ "aria-labelledby": "studiesLabel", ...inputProps }}
                          onBlur={sortStudyOptions}
                        />
                      )}
                      renderTags={(value: string[], _, state) => {
                        if (value?.length === 0 || state.focused) {
                          return null;
                        }

                        if (value?.length === 1) {
                          return <StyledTag>{formattedStudyMap[value[0]]}</StyledTag>;
                        }

                        return <StyledTag>{value?.length} studies selected</StyledTag>;
                      }}
                      options={studyOptions}
                      getOptionLabel={(option: string) => formattedStudyMap[option]}
                      onChange={(_, data: string[]) => field.onChange(data)}
                      loading={approvedStudiesLoading}
                      PaperComponent={StyledPaper}
                      PopperComponent={StyledPopper}
                      disableCloseOnSelect
                      multiple
                    />
                  )}
                />
              </StyledField>
              <StyledField>
                <StyledLabel id="statusLabel">
                  Status <BaseAsterisk />
                </StyledLabel>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      value={field.value || ""}
                      disabled={_id === "new"}
                      MenuProps={{ disablePortal: true }}
                      inputProps={{ "aria-labelledby": "statusLabel" }}
                      error={!!errors.status}
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
                <StyledButton type="submit" loading={saving} txt="#14634F" border="#26B893">
                  Save
                </StyledButton>
                <StyledButton
                  type="button"
                  onClick={() => navigate(manageOrgPageUrl)}
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
      <ConfirmDialog
        open={confirmOpen}
        onSubmit={handleBypassWarning}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default OrganizationView;
