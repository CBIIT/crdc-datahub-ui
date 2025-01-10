# Documentation

This document provides insight into specifics of the CRDC Submission Portal project.

## Data Submissions

Refer to this section for information on the Data Submission functionality.

### Submit Action Requirements

The following table outlines the conditions for which a Data Submission must meet in order to be submitted. Key:

- ❌: If the condition is not met, the submission cannot be submitted.
- ✅: If the condition is not met, the submission can be submitted still.

| Requirement | Description | Admin Submit | Regular Submit |
| --- | --- | --- | --- |
|Submission Status|The submission status must be one of: `In Progress`, `Withdrawn`, or `Rejected` to submit the data.|❌|❌|
|No uploading batches|There should be no batches with status `Uploading` for the submission|❌|❌|
|Validation must not be running|The `metadataValidationStatus` and `fileValidationStatus` should not be `In Progress`|❌|❌|
|Validation must have been run|The `metadataValidationStatus` and `fileValidationStatus` should not be `New`|❌|❌|
|Validation must have passed|The `metadataValidationStatus` and `fileValidationStatus` should not be `Error`|✅|❌|
|Submission must not have orphaned files|No `QCResult` should contain the error message `Orphaned file found`|❌|❌|
