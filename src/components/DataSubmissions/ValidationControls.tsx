import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { FormControlLabel, RadioGroup, Stack, Typography, styled } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { useAuthContext } from "../Contexts/AuthContext";
import StyledRadioButton from "../Questionnaire/StyledRadioButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from "../../graphql";
import { getDefaultValidationType, getValidationTypes } from "../../utils";
import FlowWrapper from "./FlowWrapper";

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
  padding: "10px",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  height: "44px",
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
  const [isValidating, setIsValidating] = useState<boolean>(
    dataSubmission?.fileValidationStatus === "Validating" ||
      dataSubmission?.metadataValidationStatus === "Validating"
  );

  const canValidateMetadata: boolean = useMemo(() => {
    if (!user?.role || ValidateRoles.includes(user?.role) === false) {
      return false;
    }
    if (!dataSubmission?.status || ValidateStatuses.includes(dataSubmission?.status) === false) {
      return false;
    }

    return dataSubmission?.metadataValidationStatus !== null;
  }, [user?.role, dataSubmission?.metadataValidationStatus, dataSubmission?.status]);

  const canValidateFiles: boolean = useMemo(() => {
    if (!user?.role || ValidateRoles.includes(user?.role) === false) {
      return false;
    }
    if (!dataSubmission?.status || ValidateStatuses.includes(dataSubmission?.status) === false) {
      return false;
    }
    if (dataSubmission.intention === "Delete") {
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

    setValidationType(getDefaultValidationType(dataSubmission));
    setUploadType("New");
    setIsLoading(false);
  };

  const Actions: ReactElement = useMemo(
    () => (
      <StyledValidateButton
        variant="contained"
        color="info"
        disabled={(!canValidateFiles && !canValidateMetadata) || isValidating}
        loading={isLoading}
        onClick={handleValidateFiles}
      >
        {isValidating ? "Validating..." : "Validate"}
      </StyledValidateButton>
    ),
    [canValidateFiles, canValidateMetadata, isValidating, isLoading]
  );

  useEffect(() => {
    setIsValidating(
      dataSubmission?.fileValidationStatus === "Validating" ||
        dataSubmission?.metadataValidationStatus === "Validating"
    );
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
    <FlowWrapper index={3} title="Validate Data" actions={Actions} last>
      <>
        <StyledRow direction="row" alignItems="center" sx={{ marginBottom: "-5px" }}>
          <StyledRowTitle>Validation Type:</StyledRowTitle>
          <StyledRowContent>
            <RadioGroup
              value={validationType}
              onChange={(e, val: ValidationType) => setValidationType(val)}
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
              row
            >
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
          </StyledRowContent>
        </StyledRow>
      </>
    </FlowWrapper>
  );
};

export default ValidationControls;
