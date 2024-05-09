import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { VariantType } from "notistack";
import {
  Button,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import RadioInput from "./RadioInput";
import { CREATE_BATCH, CreateBatchResp, UPDATE_BATCH, UpdateBatchResp } from "../../graphql";
import { useAuthContext } from "../Contexts/AuthContext";
import DeleteDialog from "../../content/dataSubmissions/DeleteDialog";
import FlowWrapper from './FlowWrapper';

const StyledUploadTypeText = styled(Typography)(() => ({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19.6px",
}));

const StyledMetadataText = styled(StyledUploadTypeText)(() => ({
  "&.MuiTypography-root": {
    color: "#000000",
  },
}));

const StyledUploadFilesButton = styled(Button)(() => ({
  minWidth: "137px",
  minHeight: "44px",
  padding: "10px",
  color: "#FFF",
  fontFamily: "'Nunito'",
  fontSize: "16px",
  fontStyle: "normal",
  lineHeight: "24px",
  letterSpacing: "0.32px",
  textTransform: "none",
  "&.MuiButtonBase-root": {
    marginLeft: "auto",
    minWidth: "137px",
  }
}));
const StyledChooseFilesButton = styled(LoadingButton)(() => ({
  minWidth: "137px",
  minHeight: "44px",
  padding: "10px",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "24px",
  textTransform: "initial",
  marginLeft: "12px",
  marginRight: "12px",
  "&.MuiButtonBase-root": {
    marginLeft: "15px",
  },
}));

const StyledFilesSelected = styled(Typography)(() => ({
  color: "#083A50",
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  fontSize: "16px",
  fontStyle: "italic",
  fontWeight: 400,
  lineHeight: "19.6px",
  minWidth: "135px",
}));

const StyledUploadActionWrapper = styled(Stack)(() => ({
  "&.MuiStack-root": {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "48px"
  }
}));

const VisuallyHiddenInput = styled("input")(() => ({
  display: "none !important",
}));

const UploadRoles: User["role"][] = ["Organization Owner"]; // and submission owner

type Props = {
  submission: Submission;
  readOnly?: boolean;
  onCreateBatch: () => void;
  onUpload: (message: string, severity: VariantType) => void;
};

const DataSubmissionUpload = ({ submission, readOnly, onCreateBatch, onUpload }: Props) => {
  const { submissionId } = useParams();
  const { user } = useAuthContext();

  const [metadataIntention, setMetadataIntention] = useState<MetadataIntention>("Add");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const uploadMetadataInputRef = useRef<HTMLInputElement>(null);
  const isSubmissionOwner = submission?.submitterID === user?._id;
  const canUpload = UploadRoles.includes(user?.role) || isSubmissionOwner;
  const isNewSubmission = !submission?.metadataValidationStatus && !submission?.fileValidationStatus;
  const acceptedExtensions = [".tsv", ".txt"];
  const metadataIntentionOptions = [
    { label: "Add", value: "Add", disabled: !canUpload },
    { label: "Add/Change", value: "Add/Change", disabled: !canUpload || isNewSubmission },
    { label: "Remove", value: "Remove", disabled: !canUpload || isNewSubmission },
  ];

  const [createBatch] = useMutation<CreateBatchResp>(CREATE_BATCH, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  const [updateBatch] = useMutation<UpdateBatchResp>(UPDATE_BATCH, {
    context: { clientName: 'backend' },
    fetchPolicy: 'no-cache'
  });

  // Intercept browser navigation actions (e.g. closing the tab) with unsaved changes
  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      if (selectedFiles?.length > 0) {
        event.preventDefault();
        event.returnValue = 'You have unsaved form changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', unloadHandler);

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  });

  const handleChooseFilesClick = () => {
    if (!canUpload || readOnly) {
      return;
    }
    uploadMetadataInputRef?.current?.click();
  };

  const handleChooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event?.target || {};

    if (!files) {
      setSelectedFiles(null);
      return;
    }

    // Filter out any file that is not an accepted file extension
    const filteredFiles = Array.from(files)?.filter((file: File) => acceptedExtensions.some((ext) => file.name?.toLowerCase()?.endsWith(ext)));
    if (!filteredFiles?.length) {
      setSelectedFiles(null);
      return;
    }

    // Add the files back to a FileList
    const dataTransfer = new DataTransfer();
    filteredFiles.forEach((file) => dataTransfer?.items?.add(file));

    setSelectedFiles(dataTransfer?.files);
  };

  const createNewBatch = async (): Promise<NewBatch> => {
    if (!selectedFiles?.length) {
      return null;
    }

    try {
      const formattedFiles: FileInput[] = Array.from(selectedFiles)?.map((file) => ({ fileName: file.name, size: file.size }));
      const { data: batch, errors } = await createBatch({
        variables: {
          submissionID: submissionId,
          type: "metadata",
          metadataIntention,
          files: formattedFiles,
        }
      });

      if (errors) {
        throw new Error("Unexpected network error");
      }

      return batch?.createBatch;
    } catch (err) {
      // Unable to initiate upload process so all failed
      onUploadFail(selectedFiles?.length);
      return null;
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles?.length || !canUpload || readOnly) {
      return;
    }

    setIsUploading(true);
    const newBatch: NewBatch = await createNewBatch();
    if (!newBatch) {
      return;
    }
    onCreateBatch();

    const uploadResult: UploadResult[] = [];

    const uploadPromises = newBatch.files?.map(async (file: FileURL) => {
      const selectedFile: File = Array.from(selectedFiles).find((f) => f.name === file.fileName);
      try {
        const res = await fetch(file.signedURL, {
          method: "PUT",
          body: selectedFile,
          headers: {
            'Content-Type': 'text/tab-separated-values',
          }
        });
        if (!res.ok) {
          throw new Error("Unexpected network error");
        }
        uploadResult.push({ fileName: file.fileName, succeeded: true, errors: null });
      } catch (err) {
        uploadResult.push({ fileName: file.fileName, succeeded: false, errors: err?.toString() });
      }
    });

    // Wait for all uploads to finish
    await Promise.allSettled(uploadPromises);
    onBucketUpload(newBatch._id, uploadResult);
  };

  const onBucketUpload = async (batchID: string, files: UploadResult[]) => {
    let failedFilesCount = 0;
    files?.forEach((file) => {
      if (!file.succeeded) {
        failedFilesCount++;
      }
    });

    try {
      const { errors } = await updateBatch({
        variables: {
          batchID,
          files
        }
      });

      if (errors) {
        throw new Error("Unexpected network error");
      }
      if (failedFilesCount > 0) {
        onUploadFail(failedFilesCount);
        return;
      }
      // Batch upload completed successfully
      onUpload(`${selectedFiles.length} ${selectedFiles.length > 1 ? "Files" : "File"} successfully ${metadataIntention === "Remove" ? "removed" : "uploaded"}`, "success");
      setIsUploading(false);
      setSelectedFiles(null);
      if (uploadMetadataInputRef.current) {
        uploadMetadataInputRef.current.value = "";
      }
    } catch (err) {
      // Unable to let BE know of upload result so all fail
      onUploadFail(selectedFiles?.length);
    }
  };

  const onUploadFail = (fileCount = 0) => {
    onUpload(`${fileCount} ${fileCount > 1 ? "Files" : "File"} failed to ${metadataIntention === "Remove" ? "remove" : "upload"}`, "error");
    setSelectedFiles(null);
    setIsUploading(false);
    if (uploadMetadataInputRef.current) {
      uploadMetadataInputRef.current.value = "";
    }
  };

  const onCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const onDeleteUpload = () => {
    setOpenDeleteDialog(false);
    handleUploadFiles();
  };

  return (
    <FlowWrapper title="Upload Data" borderColor="#8FC8D5" hoverColor="#92E7FA">
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <RadioInput
          id="data-submission-dashboard-upload-type"
          label="Upload Type:"
          value={metadataIntention}
          onChange={(_event, value: MetadataIntention) => !readOnly && setMetadataIntention(value)}
          options={metadataIntentionOptions}
          gridWidth={4}
          readOnly={readOnly}
          inline
          row
        />
        <StyledUploadActionWrapper direction="row">
          <StyledMetadataText variant="body2">Metadata Files</StyledMetadataText>
          <VisuallyHiddenInput
            ref={uploadMetadataInputRef}
            type="file"
            accept={acceptedExtensions.toString()}
            aria-label="Upload metadata files"
            onChange={handleChooseFiles}
            readOnly={readOnly}
            multiple
          />
          <StyledChooseFilesButton
            variant="contained"
            color="info"
            onClick={handleChooseFilesClick}
            disabled={readOnly || isUploading || !canUpload}
          >
            Choose Files
          </StyledChooseFilesButton>
          <StyledFilesSelected variant="body1">
            {selectedFiles?.length ? `${selectedFiles.length} ${selectedFiles.length > 1 ? "files" : "file"} selected` : "No files selected"}
          </StyledFilesSelected>
        </StyledUploadActionWrapper>
        <StyledUploadFilesButton
          variant="contained"
          color="info"
          onClick={() => (metadataIntention === "Remove" ? setOpenDeleteDialog(true) : handleUploadFiles())}
          disabled={readOnly || !selectedFiles?.length || !canUpload || isUploading}
          disableElevation
          disableRipple
          disableTouchRipple
        >
          {isUploading ? "Uploading..." : "Upload"}
        </StyledUploadFilesButton>

        <DeleteDialog
          open={openDeleteDialog}
          onClose={onCloseDeleteDialog}
          onConfirm={onDeleteUpload}
        />
      </Stack>
    </FlowWrapper>
  );
};

export default DataSubmissionUpload;
