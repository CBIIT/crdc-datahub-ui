import { FC, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { FormControlLabel, RadioGroup, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAuthContext } from '../Contexts/AuthContext';
import StyledRadioButton from "../Questionnaire/StyledRadioButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from '../../graphql';

type Props = {
  /**
   * The data submission to display validation controls for.
   *
   * NOTE: Initially null during the loading state.
   */
  dataSubmission?: Submission;
};

type ValidationType = "Metadata" | "Files" | "All";
type UploadType = "New" | "All";

const StyledValidateButton = styled(LoadingButton)({
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  padding: "12px 20px",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  background: "#1A7B90",
  color: "#FFF",
  textAlign: "center",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "16px",
  letterSpacing: "0.32px",
  textTransform: "none",
  border: "1.5px solid #136071",
  "&.MuiButtonBase-root": {
    height: "fit-content",
    marginLeft: "auto",
    marginRight: "21.5px",
    minWidth: "137px",
  },
  "&.MuiButtonBase-root:disabled": {
    height: "fit-content",
    marginLeft: "auto",
    marginRight: "21.5px",
    minWidth: "137px",
    background: "#949494",
    color: "#CBCBCB",
  },
  "&.MuiButtonBase-root:hover": {
    background: "#496065",
    height: "fit-content",
    marginLeft: "auto",
    marginRight: "21.5px",
    minWidth: "137px",
  }
});

const StyledFileValidationSection = styled("div")({
  borderRadius: 0,
  minHeight: "147px",
  padding: "21px 40px 0",
  borderTop: "solid 1.5px #6CACDA",
  background: "#F0FBFD",
  gridAutoFlow: "row",
  gridTemplateColumns: "2.5fr 0.5fr",
  display: "grid",
  ".headerText": {
    fontFamily: "Nunito",
    color: "#083A50",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: "20px",
    letterSpacing: "0em",
    textAlign: "left",
    minWidth: "270px"
  },
  ".fileValidationLeftSide": {
    display: "flex",
    flexDirection: "column",
  },
  ".fileValidationLeftSideTopRow": {
    display: "grid",
    gridTemplateColumns: "1fr 3fr",
    height: "50px",
    alignItems: "center",
    borderBottom: "1px solid #0B7F99",
    width: "800px",
  },
  ".fileValidationLeftSideBottomRow": {
    display: "grid",
    gridTemplateColumns: "1fr 3fr",
    height: "50px",
    alignItems: "center",
    width: "800px",
  },
  ".fileValidationRadioButtonGroup": {
    marginLeft: "20px",
  },
  "& .MuiFormControlLabel-label": {
    fontFamily: "Nunito",
    fontSize: "16px",
    fontWeight: "500",
    lineHeight: "20px",
    letterSpacing: "0em",
    textAlign: "left",
  }
});

const ValidateRoles: User["role"][] = ["Submitter", "Data Curator", "Organization Owner", "Admin"];
const ValidateStatuses: Submission["status"][] = ["In Progress", "Withdrawn", "Rejected"];

/**
 * Provides the UI for validating a data submission's assets.
 *
 * @param {Props}
 * @returns {React.FC<Props>}
 */
const ValidationControls: FC<Props> = ({ dataSubmission }: Props) => {
  const { user } = useAuthContext();
  const [validationType, setValidationType] = useState<ValidationType>("Metadata");
  const [uploadType, setUploadType] = useState<UploadType>("New");
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const canValidateData: boolean = useMemo(() => ValidateRoles.includes(user?.role), [user?.role]);
  const validateButtonEnabled: boolean = useMemo(() => ValidateStatuses.includes(dataSubmission?.status), [dataSubmission?.status]);

  const [validateSubmission] = useMutation<ValidateSubmissionResp>(VALIDATE_SUBMISSION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleValidateFiles = async () => {
    setIsValidating(true);

    await validateSubmission({
      variables: {
        _id: dataSubmission?._id,
        types: getTypes(validationType),
        scope: uploadType === "New" ? "New" : "All",
      }
    });

    // Reset form to default values
    setValidationType("Metadata");
    setUploadType("New");
    setIsValidating(false);
  };

  const getTypes = (validationType: ValidationType): string[] => {
    switch (validationType) {
      case "Metadata":
        return ["metadata"];
      case "Files":
        return ["file"];
      default:
        return ["metadata", "file"];
    }
  };

  return (
    <StyledFileValidationSection>
      <div className="fileValidationLeftSide">
        <div className="fileValidationLeftSideTopRow">
          <div className="headerText">Validation Type:</div>
          <div className="fileValidationRadioButtonGroup">
            <RadioGroup value={validationType} onChange={(event, val: ValidationType) => setValidationType(val)} row>
              <FormControlLabel
                sx={{ minWidth: "200px", marginRight: "20px", }}
                value="Metadata"
                color="#1D91AB"
                control={<StyledRadioButton readOnly={false} />}
                label="Validate Metadata"
                disabled={!canValidateData}
              />
              <FormControlLabel
                sx={{ minWidth: "200px", marginRight: "20px", }}
                value="Files"
                color="#1D91AB"
                control={<StyledRadioButton readOnly={false} />}
                label="Validate Data Files"
                disabled={!canValidateData}
              />
              <FormControlLabel
                sx={{ marginRight: "0px", }}
                value="All"
                color="#1D91AB"
                control={<StyledRadioButton readOnly={false} />}
                label="Both"
                disabled={!canValidateData}
              />
            </RadioGroup>
          </div>
        </div>
        <div className="fileValidationLeftSideBottomRow">
          <div className="headerText">Validation Target:</div>
          <div className="fileValidationRadioButtonGroup">
            <RadioGroup value={uploadType} onChange={(event, val: UploadType) => setUploadType(val)} row>
              <FormControlLabel
                sx={{ minWidth: "200px", marginRight: "20px", }}
                value="New"
                color="#1D91AB"
                control={<StyledRadioButton readOnly={false} />}
                label="New Uploaded Data"
                disabled={!canValidateData}
              />
              <FormControlLabel
                sx={{ minWidth: "200px", marginRight: "20px", }}
                value="All"
                color="#1D91AB"
                control={<StyledRadioButton readOnly={false} />}
                label="All Uploaded Data"
                disabled={!canValidateData}
              />
            </RadioGroup>
          </div>
        </div>
      </div>
      <StyledValidateButton
        variant="contained"
        disableElevation
        disabled={!canValidateData || !validateButtonEnabled}
        loading={isValidating}
        onClick={handleValidateFiles}
      >
        Validate
      </StyledValidateButton>
    </StyledFileValidationSection>
  );
};

export default ValidationControls;
