import React, { FC, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { FormControlLabel, RadioGroup, Stack, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { useAuthContext } from '../Contexts/AuthContext';
import StyledRadioButton from "../Questionnaire/StyledRadioButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from '../../graphql';
import {
  getDefaultValidationTarget,
  getDefaultValidationType,
  getValidationTypes,
} from "../../utils";
import FlowWrapper from './FlowWrapper';

const StyledValidateButton = styled(LoadingButton)({
  padding: "10px",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  "&.MuiButtonBase-root": {
    height: "fit-content",
    minHeight: "44px",
    marginLeft: "auto",
    minWidth: "137px",
  },
});

const StyledFileValidationSection = styled(Stack)({
  marginTop: "5px",
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

/**
 * Base set of user roles that can validate a submission.
 */
const BaseValidateRoles: User["role"][] = [
  "Submitter",
  "Data Curator",
  "Organization Owner",
  "Admin",
];

/**
 * A map from Submission Status to the user roles that can validate the submission for that status.
 *
 * @note All of the permission logic really should be refactored into a hook or otherwise.
 */
const ValidateMap: Partial<Record<Submission["status"], User["role"][]>> = {
  "In Progress": BaseValidateRoles,
  Withdrawn: BaseValidateRoles,
  Rejected: BaseValidateRoles,
  Submitted: ["Data Curator", "Admin"],
};

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
  const [uploadType, setUploadType] = useState<ValidationTarget>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(dataSubmission?.fileValidationStatus === "Validating"
    || dataSubmission?.metadataValidationStatus === "Validating");

  const canValidateMetadata: boolean = useMemo(() => {
    const permissionMap = ValidateMap[dataSubmission?.status];
    if (!user?.role || !dataSubmission?.status || !permissionMap) {
      return false;
    }
    if (permissionMap.includes(user.role) === false) {
      return false;
    }

    return dataSubmission?.metadataValidationStatus !== null;
  }, [user?.role, dataSubmission?.metadataValidationStatus, dataSubmission?.status]);

  const canValidateFiles: boolean = useMemo(() => {
    const permissionMap = ValidateMap[dataSubmission?.status];
    if (!user?.role || !dataSubmission?.status || !permissionMap) {
      return false;
    }
    if (permissionMap.includes(user.role) === false) {
      return false;
    }

    return dataSubmission?.fileValidationStatus !== null;
  }, [user?.role, dataSubmission?.fileValidationStatus, dataSubmission?.status]);

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
    }).catch((e) => ({ errors: e?.message, data: null }));

    if (errors || !data?.validateSubmission?.success) {
      enqueueSnackbar("Unable to initiate validation process.", { variant: "error" });
      setIsValidating(false);
      onValidate?.(false);
    } else {
      enqueueSnackbar("Validation process is starting; this may take some time. Please wait before initiating another validation.", { variant: "success" });
      setIsValidating(true);
      onValidate?.(true);
    }

    setValidationType(getDefaultValidationType(dataSubmission, user, ValidateMap));
    setUploadType(getDefaultValidationTarget(dataSubmission, user, ValidateMap));
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

    setValidationType(getDefaultValidationType(dataSubmission, user, ValidateMap));
  }, [dataSubmission, user]);

  useEffect(() => {
    if (uploadType !== null) {
      return;
    }
    if (typeof dataSubmission === "undefined") {
      return;
    }

    setUploadType(getDefaultValidationTarget(dataSubmission, user, ValidateMap));
  }, [dataSubmission]);

  return (
    <FlowWrapper title="Validate Data" borderColor="#8E9AD5" hoverColor="#869AFF">
      <StyledFileValidationSection direction="row" alignItems="center">
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
                  disabled={
                    (!canValidateFiles && !canValidateMetadata)
                    // NOTE: No new data to validate if the submission is already submitted
                    || dataSubmission?.status === "Submitted"
                  }
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
          color="info"
          disabled={(!canValidateFiles && !canValidateMetadata) || isValidating}
          loading={isLoading}
          onClick={handleValidateFiles}
        >
          {isValidating ? "Validating..." : "Validate"}
        </StyledValidateButton>
      </StyledFileValidationSection>
    </FlowWrapper>
  );
};

export default React.memo<Props>(ValidationControls, (prevProps, nextProps) => isEqual(prevProps, nextProps));
