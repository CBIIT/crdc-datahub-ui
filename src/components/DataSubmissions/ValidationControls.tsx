import { FC, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { FormControlLabel, RadioGroup, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { useAuthContext } from '../Contexts/AuthContext';
import StyledRadioButton from "../Questionnaire/StyledRadioButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from '../../graphql';
import { getDefaultValidationType, getValidationTypes } from '../../utils';

type Props = {
  /**
   * The data submission to display validation controls for.
   *
   * NOTE: Initially null during the loading state.
   */
  dataSubmission?: Submission;
  /**
   * Callback function called when the validating is initiated.
   *
   * @param success whether the validation was successfully initiated
   */
  onValidate: (success: boolean) => void;
};

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
});

const StyledRadioControl = styled(FormControlLabel)({
  fontFamily: "Nunito",
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "20px",
  letterSpacing: "0em",
  textAlign: "left",
  color: "#083A50",
  minWidth: "200px",
  marginRight: "20px",
  "&:last-child": {
    marginRight: "0px",
    minWidth: "unset",
  },
});

const ValidateRoles: User["role"][] = ["Submitter", "Data Curator", "Organization Owner", "Admin"];
const ValidateStatuses: Submission["status"][] = ["In Progress", "Withdrawn", "Rejected"];

/**
 * Provides the UI for validating a data submission's assets.
 *
 * @param {Props}
 * @returns {React.FC<Props>}
 */
const ValidationControls: FC<Props> = ({ dataSubmission, onValidate }: Props) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [validationType, setValidationType] = useState<ValidationType>(null);
  const [uploadType, setUploadType] = useState<ValidationTarget>("New");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(dataSubmission?.fileValidationStatus === "Validating"
    || dataSubmission?.metadataValidationStatus === "Validating");

  const canValidateMetadata: boolean = useMemo(() => {
    if (!user?.role || ValidateRoles.includes(user?.role) === false) {
      return false;
    }
    if (!dataSubmission?.status || ValidateStatuses.includes(dataSubmission?.status) === false) {
      return false;
    }

    return dataSubmission?.metadataValidationStatus !== null;
  }, [user?.role, dataSubmission?.metadataValidationStatus]);

  const canValidateFiles: boolean = useMemo(() => {
    if (!user?.role || ValidateRoles.includes(user?.role) === false) {
      return false;
    }
    if (!dataSubmission?.status || ValidateStatuses.includes(dataSubmission?.status) === false) {
      return false;
    }

    return dataSubmission?.fileValidationStatus !== null;
  }, [user?.role, dataSubmission?.fileValidationStatus]);

  const [validateSubmission] = useMutation<ValidateSubmissionResp>(VALIDATE_SUBMISSION, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const handleValidateFiles = async () => {
    if (isValidating || !validationType || !uploadType) {
      return;
    }
    if (!canValidateFiles && validationType === "Files") {
      return;
    }
    if (!canValidateMetadata && validationType === "Metadata") {
      return;
    }

    setIsLoading(true);

    const { data, errors } = await validateSubmission({
      variables: {
        _id: dataSubmission?._id,
        types: getValidationTypes(validationType),
        scope: uploadType === "New" ? "New" : "All",
      }
    });

    if (errors || !data?.validateSubmission?.success) {
      enqueueSnackbar("Unable to initiate validation process.", { variant: "error" });
      setIsValidating(false);
      onValidate?.(false);
    } else {
      enqueueSnackbar("Validation process is starting; this may take some time. Please wait before initiating another validation.", { variant: "success" });
      setIsValidating(true);
      onValidate?.(true);
    }

    setValidationType(getDefaultValidationType(dataSubmission));
    setUploadType("New");
    setIsLoading(false);
  };

  useEffect(() => {
    setIsValidating(dataSubmission?.fileValidationStatus === "Validating"
      || dataSubmission?.metadataValidationStatus === "Validating");
  }, [dataSubmission?.fileValidationStatus, dataSubmission?.metadataValidationStatus]);

  useEffect(() => {
    if (validationType !== null) {
      return;
    }
    if (typeof dataSubmission === "undefined") {
      return;
    }

    setValidationType(getDefaultValidationType(dataSubmission));
  }, [dataSubmission]);

  return (
    <StyledFileValidationSection>
      <div className="fileValidationLeftSide">
        <div className="fileValidationLeftSideTopRow">
          <div className="headerText">Validation Type:</div>
          <div className="fileValidationRadioButtonGroup">
            <RadioGroup value={validationType} onChange={(e, val: ValidationType) => setValidationType(val)} row>
              <StyledRadioControl
                value="Metadata"
                control={<StyledRadioButton readOnly={false} />}
                label="Validate Metadata"
                disabled={!canValidateMetadata}
              />
              <StyledRadioControl
                value="Files"
                control={<StyledRadioButton readOnly={false} />}
                label="Validate Data Files"
                disabled={!canValidateFiles}
              />
              <StyledRadioControl
                value="All"
                control={<StyledRadioButton readOnly={false} />}
                label="Both"
                disabled={!canValidateFiles || !canValidateMetadata}
              />
            </RadioGroup>
          </div>
        </div>
        <div className="fileValidationLeftSideBottomRow">
          <div className="headerText">Validation Target:</div>
          <div className="fileValidationRadioButtonGroup">
            <RadioGroup value={uploadType} onChange={(event, val: ValidationTarget) => setUploadType(val)} row>
              <StyledRadioControl
                value="New"
                control={<StyledRadioButton readOnly={false} />}
                label="New Uploaded Data"
                disabled={!canValidateFiles && !canValidateMetadata}
              />
              <StyledRadioControl
                value="All"
                control={<StyledRadioButton readOnly={false} />}
                label="All Uploaded Data"
                disabled={!canValidateFiles && !canValidateMetadata}
              />
            </RadioGroup>
          </div>
        </div>
      </div>
      <StyledValidateButton
        variant="contained"
        disableElevation
        disabled={(!canValidateFiles && !canValidateMetadata) || isValidating}
        loading={isLoading}
        onClick={handleValidateFiles}
      >
        {isValidating ? "Validating..." : "Validate"}
      </StyledValidateButton>
    </StyledFileValidationSection>
  );
};

export default ValidationControls;
