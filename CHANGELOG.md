# Release Notes

## 3.1.0 (Released 12/20/2024)

- Integration with CDE/caDSR
- Validate metadata against CDE Permissible Values
- Data Hub Operations Dashboard using QuickSight
- Support Uploader CLI binary distribution downloads
- Support for CCDI Data Models and Submissions
- Automated archiving of data submissions
- CRDC_ID uniqueness identification in Data Hub
- New Fed Monitor Role added
- Support for the Standard MDF Model
- Admin tool to manage studies
- Uploader CLI bucket-to-bucket data upload
- Make Data curators to be Data Commons associated
- Collaborator support for data submissions
- Submitter/Org Owner can request access

## 3.0.0 (Released 09/30/2024)

- Support for ICDC and CTDC Data Models and Submissions
- Data View feature to explore content within data submissions
- Cross-validation support for multiple submissions under the same study
- Automatic transfer of curated submissions to Data Commons repositories
- Auto-sync of the latest data model with Data Commons
- Support for DELETE-type submissions to remove previously released data
- Default configuration file for the Uploader CLI tool
- Submitters can submit data using APIs
- Generate CRDC_ID for selected nodes

## 2.1.0 (Released 06/25/2024)

- Support for individual submission templates (one per node type)
- Data Activity view to monitor data upload activities
- Submitters can perform data validations and view results through the web interface
- Visual display of submission nodes, data counts, and validation status
- Release data submission packages to downstream Data Commons repositories
- Enhanced the existing Data Loader to process released data submission packages for downstream Data Commons

## 2.0.0 (Released 02/26/2024)

- Data Model Navigator to review and download submission templates
- Support for CDS Data Models and Submissions
- Data Submission dashboard for submitters to submit study metadata and data files
- End-to-end workflow for data submission (from New to Complete)
- Automated email notifications during each data submission status change
- Data Uploader CLI tool for updating data files and metadata
- Admin tool to manage organizations
- Submitters can download validation results from the standalone Data Loader

## 1.1.0 (Released 11/16/2023)

- Enhanced existing CRDC Data Loader for the down-streamed Data Commons to process the released package from Data Hub using Prefect
- Implement Government Shutdown banner using Adobe Launch

## 1.0.0 (Released 10/23/2023)

- Support for NIH and Login.gov authentication
- Role-based access controls
- Online form for CRDC Submission Requests
- Workflow to review submission requests (from New to Approved/Rejected)
- Admin tools to manage users and their access
- Auto-delete submission requests after 45 days of inactivity
- System-triggered email notifications for approved, rejected, or deleted requests
