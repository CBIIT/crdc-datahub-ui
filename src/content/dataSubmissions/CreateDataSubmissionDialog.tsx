import { FC, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, Typography, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery } from "@apollo/client";
import { query as approvedStudiesQuery, Response as approvedStudiesRespone } from "../../graphql/listApprovedStudiesOfMyOrganization";
import { mutation as CREATE_SUBMISSION, Response as CreateSubmissionResp } from '../../graphql/createSubmission';
import TextInput from "../../components/Questionnaire/TextInput";
import SelectInput from "../../components/Questionnaire/SelectInput";
import RadioInput from "../../components/DataSubmissions/RadioInput";
import { DataCommons } from "../../config/DataCommons";
import { ReactComponent as CloseIconSvg } from "../../assets/icons/close_icon.svg";
import { useAuthContext } from "../../components/Contexts/AuthContext";

const CreateSubmissionDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "725px",
    height: "fit-content",
    borderRadius: "8px",
    border: "2px solid #5ab8ff",
    background: "#f2f6fa",
    maxWidth: "none",
    maxHeight: "none",
    overflow: "hidden",
  }
});

const StyledDialogTitle = styled(DialogTitle)({
  paddingTop: "39px",
  paddingLeft: "74px"
});

const StyledHeader = styled(Typography)({
  fontFamily: "'Nunito Sans'",
  fontSize: "45px",
  fontWeight: 800,
  lineHeight: "40px",
  letterSpacing: "-1.5px",
  textAlign: "left",
  color: "#1873bd",
  minHeight: "79px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const StyledSubHeader = styled(Typography)({
  fontFamily: "'Inter', 'Rubik', sans-serif",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "22px",
  letterSpacing: 0,
  textAlign: "left",
});

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: "26px"
});

const StyledButton = styled(LoadingButton)({
  height: "51px",
  width: "261px",
  padding: "14px 20px",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  letterSpacing: "2%",
  lineHeight: "20.14px",
  borderRadius: "8px",
  color: "#fff",
  textTransform: "none",
  borderColor: "#005EA2 !important",
  background: "#005EA2 !important",
  marginRight: "25px",

  "&.Mui-disabled": {
    cursor: "not-allowed",
    pointerEvents: "all",
  },
});

const StyledDialogActions = styled(DialogActions)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: "65px",
  gap: "20px"
});

const StyledDialogError = styled(Typography)({
  color: "#c93f08",
  textAlign: "center",
});

const StyledDialogButton = styled(Button)({
  display: "flex",
  width: "128px",
  height: "50.59px",
  padding: "12px 36.5px 14.59px 36.5px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  border: "1px solid #000",
  textDecoration: "none",
  color: "rgba(0, 0, 0, 0.87)",
  alignSelf: "center",
  cursor: "pointer",
  textTransform: "none",
  letterSpacing: "2%",
  fontWeight: 700,
  fontSize: "16px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
});

const StyledCloseDialogButton = styled(IconButton)(() => ({
  position: "absolute !important" as "absolute",
  right: "21px",
  top: "11px",
  padding: "10px",
  "& svg": {
    color: "#44627C"
  }
}));

const StyledFormWrapper = styled(Box)(() => ({
  alignSelf: "center",
  width: "485px",
  minHeight: "450px",
  marginTop: "24px",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: 0,
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
}));

const StyledGridContainer = styled(Grid)(() => ({
  "& .formControl": {
    marginTop: "0 !important",
    marginBottom: "0 !important",
  },
}));

const StyledRadioInput = styled(RadioInput)(() => ({
  marginLeft: "2px",
  marginTop: "5px",
  "& .MuiRadio-root": {
    padding: "4px 7px 4px 4px",
  },
  "& .MuiFormControlLabel-root": {
    marginRight: "0 !important"
  }
}));

type CreateSubmissionParams = Pick<
  Submission,
  "studyAbbreviation" | "dataCommons" | "name" | "dbGaPID" | "intention"
>;

type Props = {
  organizations: Partial<Organization>[];
  onCreate: (data: CreateSubmissionParams) => void;
};

const CreateDataSubmissionDialog: FC<Props> = ({ organizations, onCreate }) => {
  const { user } = useAuthContext();
  const [creatingSubmission, setCreatingSubmission] = useState<boolean>(false);
  const [dataCommons, setDataCommons] = useState<string>("CDS");
  const [studyAbbreviation, setStudyAbbreviation] = useState<string>("All");
  const [dbGaPID, setdbGaPID] = useState<string>(null);
  const [name, setName] = useState<string>(null);
  const [intention, setIntention] = useState<SubmissionIntention>("New");
  const [error, setError] = useState<boolean>(false);
  const createSubmissionDialogFormRef = useRef<HTMLFormElement>();
  const [createDataSubmission] = useMutation<CreateSubmissionResp, { studyAbbreviation: string, dataCommons: string, name: string, dbGaPID: string, intention: SubmissionIntention }>(CREATE_SUBMISSION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });
  const { data: approvedStudiesData } = useQuery<approvedStudiesRespone>(approvedStudiesQuery, {
    variables: {
    },
    context: { clientName: 'backend' },
    fetchPolicy: "no-cache",
  });

  const orgOwnerOrSubmitter = (user?.role === "Organization Owner" || user?.role === "Submitter");
  const hasOrganizationAssigned = (user?.organization !== null && user?.organization?.orgID !== null);
  const organizationNames: SelectOption[] = organizations?.map((org) => ({ label: org.name, value: org.name }));
  organizationNames?.unshift({ label: "All", value: "All" });
  const approvedStudiesAbbrvList = approvedStudiesData?.listApprovedStudiesOfMyOrganization?.map((v) => ({ label: v.studyAbbreviation, value: v.studyAbbreviation }));
  const approvedStudiesMapToDbGaPID = {};
  approvedStudiesData?.listApprovedStudiesOfMyOrganization?.map((v) => (approvedStudiesMapToDbGaPID[v.studyAbbreviation] = v.dbGaPID));
  const submissionTypeOptions = [
    { label: "New", value: "New", disabled: false },
    { label: "Update", value: "Update", disabled: false },
    { label: "Delete", value: "Delete", disabled: false },
  ];

  const initializeValues = () => {
    setDataCommons("CDS");
    setStudyAbbreviation("");
    setName("");
    setdbGaPID("");
    setIntention("New");
  };

  const handleOpenDialog = () => {
    setCreatingSubmission(true);
    initializeValues();
  };

  const handleOnCreate = () => {
    const valid = createSubmissionDialogFormRef.current.checkValidity();
    if (!valid) {
      return;
    }

    const params: CreateSubmissionParams = {
      studyAbbreviation,
      dataCommons,
      name,
      dbGaPID,
      intention,
    };

    createSubmission(params);
  };

  const createSubmission = async ({ studyAbbreviation, dataCommons, name, dbGaPID, intention }) => {
    await createDataSubmission({
      variables: {
        studyAbbreviation,
        dataCommons,
        name,
        dbGaPID,
        intention
      }
    }).then(() => {
      setCreatingSubmission(false);
      setError(false);
      if (onCreate) {
        onCreate({ studyAbbreviation, dataCommons, name, dbGaPID, intention });
      }
    })
    .catch(() => {
      setError(true);
    });
  };

  return (
    <>
      <CreateSubmissionDialog open={creatingSubmission}>
        <StyledDialogTitle>
          <StyledCloseDialogButton
            aria-label="close"
            onClick={() => setCreatingSubmission(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCreatingSubmission(false);
              }
            }}
          >
            <CloseIconSvg />
          </StyledCloseDialogButton>
          <Stack direction="column" justifyContent="center" alignItems="flex-start">
            <StyledHeader variant="h3" id="create-a-submission-title">Create a Data Submission</StyledHeader>
            <StyledSubHeader>
              Please fill out the form below to start your data submission
            </StyledSubHeader>
          </Stack>
        </StyledDialogTitle>
        <StyledDialogContent>
          <StyledFormWrapper>
            <form ref={createSubmissionDialogFormRef}>
              <StyledGridContainer container rowSpacing={0} columnSpacing={1.5}>
                <TextInput
                  value={user.organization?.orgName}
                  label="Organization"
                  gridWidth={12}
                  readOnly
                />
                <SelectInput
                  options={DataCommons.map((dc) => ({
                    label: dc.name,
                    value: dc.name,
                  }))}
                  label="Data Commons"
                  required
                  value={dataCommons}
                  onChange={(value: string) => setDataCommons(value)}
                  gridWidth={12}
                />
                <SelectInput
                  options={approvedStudiesAbbrvList}
                  label="Study"
                  required
                  value={studyAbbreviation}
                  onChange={(value: string) => {
                    setStudyAbbreviation(value);
                    setdbGaPID(approvedStudiesMapToDbGaPID[value]);
                  }}
                  gridWidth={12}
                />
                <TextInput
                  value={dbGaPID}
                  parentStateSetter={(newVal) => setdbGaPID(newVal)}
                  maxLength={50}
                  label="dbGaP ID"
                  placeholder="Input dbGaP ID"
                  gridWidth={12}
                />
                <TextInput
                  value={name}
                  parentStateSetter={(newVal) => setName(newVal)}
                  maxLength={25}
                  multiline
                  rows={3}
                  required
                  label="Submission Name"
                  placeholder="25 characters allowed"
                  gridWidth={12}
                />
                <StyledRadioInput
                  id="create-data-submission-dialog-submission-type"
                  label="Submission Type"
                  value={intention}
                  onChange={(_event, value: MetadataIntention) => setIntention(value)}
                  options={submissionTypeOptions}
                  gridWidth={12}
                  row
                  required
                />
              </StyledGridContainer>
            </form>
          </StyledFormWrapper>
        </StyledDialogContent>
        <StyledDialogActions>
          <StyledDialogButton
            role="button"
            tabIndex={0}
            id="createSubmissionDialogCreateButton"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleOnCreate();
              }
            }}
            onClick={() => handleOnCreate()}
          >
            Create
          </StyledDialogButton>
          {error && (
            <StyledDialogError variant="body1">
              Unable to create this data submission. If the problem persists please
              contact
              <br />
              <a href="mailto:ncicrdchelpdesk@mail.nih.gov">
                ncicrdchelpdesk@mail.nih.gov
              </a>
            </StyledDialogError>
          )}

        </StyledDialogActions>
      </CreateSubmissionDialog>

      {orgOwnerOrSubmitter && (
        <StyledButton
          type="button"
          onClick={handleOpenDialog}
          loading={creatingSubmission}
          sx={{ bottom: "30px", right: "50px" }}
          disabled={!hasOrganizationAssigned}
        >
          Create a Data Submission
        </StyledButton>
      )}
    </>
  );
};

export default CreateDataSubmissionDialog;
