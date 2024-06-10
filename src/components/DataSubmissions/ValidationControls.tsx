import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { FormControlLabel, RadioGroup, Stack, Typography, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import { useAuthContext } from "../Contexts/AuthContext";
import StyledRadioButton from "../Questionnaire/StyledRadioButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from "../../graphql";
import {
  getDefaultValidationTarget,
  getDefaultValidationType,
  getValidationTypes,
} from "../../utils";
import FlowWrapper from "./FlowWrapper";
import { CrossValidationButton } from "./CrossValidationButton";

const StyledValidateButton = styled(LoadingButton)({
  padding: "10px",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  "&.MuiButtonBase-root": {
    marginLeft: "auto",
    minWidth: "137px",
  },
});

const StyledRow = styled(Stack)({
  fontFamily: "Nunito",
});

const StyledRowTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: "16px",
  color: "#083A50",
  minWidth: "170px",
});

const StyledRowContent = styled(Stack)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "650px",
});

const StyledRadioControl = styled(FormControlLabel)({
  fontFamily: "Nunito",
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "20px",
  textAlign: "left",
  color: "#083A50",
  minWidth: "230px",
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
  const [isValidating, setIsValidating] = useState<boolean>(
    dataSubmission?.fileValidationStatus === "Validating" ||
      dataSubmission?.metadataValidationStatus === "Validating"
  );
  const prevIsValidating = useRef<boolean>(isValidating);

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
    if (dataSubmission.intention === "Delete" || dataSubmission.dataType === "Metadata Only") {
      return false;
    }

    return dataSubmission?.fileValidationStatus !== null;
  }, [user?.role, dataSubmission?.fileValidationStatus, dataSubmission?.status]);

  const [validateSubmission] = useMutation<ValidateSubmissionResp>(VALIDATE_SUBMISSION, {
    context: { clientName: "backend" },
    fetchPolicy: "no-cache",
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
      },
    }).catch((e) => ({ errors: e?.message, data: null }));

    if (errors || !data?.validateSubmission?.success) {
      enqueueSnackbar("Unable to initiate validation process.", {
        variant: "error",
      });
      setIsValidating(false);
      onValidate?.(false);
    } else {
      enqueueSnackbar(
        "Validation process is starting; this may take some time. Please wait before initiating another validation.",
        { variant: "success" }
      );
      setIsValidating(true);
      onValidate?.(true);
    }

    setIsLoading(false);
  };

  const Actions: ReactElement = useMemo(
    () => (
      <>
        <StyledValidateButton
          variant="contained"
          color="info"
          disabled={(!canValidateFiles && !canValidateMetadata) || isValidating}
          loading={isLoading}
          onClick={handleValidateFiles}
          data-testid="validate-controls-validate-button"
        >
          {isValidating ? "Validating..." : "Validate"}
        </StyledValidateButton>
        <CrossValidationButton
          submission={dataSubmission}
          variant="contained"
          color="info"
          onValidate={onValidate}
        />
      </>
    ),
    [
      handleValidateFiles,
      dataSubmission,
      canValidateFiles,
      canValidateMetadata,
      isValidating,
      isLoading,
    ]
  );

  useEffect(() => {
    const validating =
      dataSubmission?.fileValidationStatus === "Validating" ||
      dataSubmission?.metadataValidationStatus === "Validating";

    setIsValidating(validating);

    // Reset the validation type and target only if the validation process finished
    if (!validating && prevIsValidating.current === true) {
      setValidationType(getDefaultValidationType(dataSubmission, user, ValidateMap));
      setUploadType(getDefaultValidationTarget(dataSubmission, user, ValidateMap));
    }

    prevIsValidating.current = validating;
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
    <FlowWrapper index={3} title="Validate Data" actions={Actions} last>
      <>
        <StyledRow direction="row" alignItems="center" sx={{ marginBottom: "-5px" }}>
          <StyledRowTitle>Validation Type:</StyledRowTitle>
          <StyledRowContent>
            <RadioGroup
              value={validationType}
              onChange={(e, val: ValidationType) => setValidationType(val)}
              data-testid="validate-controls-validation-type"
              row
            >
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
          </StyledRowContent>
        </StyledRow>
        <StyledRow direction="row" alignItems="center" sx={{ marginTop: "-5px" }}>
          <StyledRowTitle>Validation Target:</StyledRowTitle>
          <StyledRowContent>
            <RadioGroup
              value={uploadType}
              onChange={(event, val: ValidationTarget) => setUploadType(val)}
              data-testid="validate-controls-validation-target"
              row
            >
              <StyledRadioControl
                value="New"
                control={<StyledRadioButton readOnly={false} />}
                label="New Uploaded Data"
                disabled={
                  (!canValidateFiles && !canValidateMetadata) ||
                  // NOTE: No new data to validate if the submission is already submitted
                  dataSubmission?.status === "Submitted"
                }
              />
              <StyledRadioControl
                value="All"
                control={<StyledRadioButton readOnly={false} />}
                label="All Uploaded Data"
                disabled={!canValidateFiles && !canValidateMetadata}
              />
            </RadioGroup>
          </StyledRowContent>
        </StyledRow>
      </>
    </FlowWrapper>
  );
};

export default React.memo<Props>(ValidationControls, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps)
);
