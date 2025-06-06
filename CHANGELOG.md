# Release Notes

## 3.4.0

N/A

## 3.3.0

N/A

## 3.2.2 (Released 05/13/2025)

This production patch includes a critical fix to resolve a timeout and crash issue that occurred when users accessed the Data Submission page containing a large number of submission batches.

#### Bug Fixes

- **Resolved Website Crash on Data Submission Page**\
  Optimized backend queries to prevent request timeouts and crashes when accessing submissions with high batch volumes.

## 3.2.1 (Released 04/09/2025)

#### CDS Rebranding

- The CDS Data Commons has been rebranded from **"CDS"** to **"General Commons"** across the user interface and supporting documentation.


#### Bug Fixes

- **CLI Upload Permissions for Collaborators**\
  Resolved an issue where users added as collaborators on a Data Submission were unable to upload files using the CLI uploader tool. Collaborators now have the correct permissions to perform CLI uploads.
- **Incorrect Email Notifications on Submission Release**\
  Fixed an issue where email notifications sent upon data submission release were incorrectly sent to unrelated submitters. Notifications are now properly limited to the original submitter and designated collaborators only.

## 3.2.0 (Released 03/28/2025)

#### Submission Request Enhancements

- Added Submission Request Version Support to ensure backward compatibility.
- Released Submission Request Form 3.0 with added question and UI improvements
- Provided filtering capability on the Submission Request List Page.
- Users can now cancel and restore Submission Requests.
- Added support for conditionally approved studies.
- Study Primary Contacts and PIs will now receive Submission Request email notifications for their study
- New email notifications:
  - When a Submission Request is expiring.
  - When a Submission Request is canceled or restored.
  - For conditionally approved Submission Requests.

#### Data Submission Enhancements

- Studies are now associated with Programs instead of Organizations.
- Submitters can create data submissions only for their assigned studies.
- Submitters can view existing data before overriding a previous submission.
- Data Hub now retrieves caDSR PVs and NCIt synonyms from MDB.
- Metadata validation suggests a permissive value if the entered value matches NCIt synonyms.
- Submitters can view other users' data submissions for their assigned studies.
- Data files are now auto-deleted when a DELETE data submission is completed.
- Validation results now provide an aggregated view for better analysis.
- Added support for Study-level Primary Contact assignments.
- New email notification sent when a Data Submission is deleted.

#### Data Model Navigator Enhancements

- Model Navigator now displays older model versions for reference.
- Model version history is now accessible within the Model Navigator.
- Added additional options for Dictionary Download.

#### Uploader CLI Tool Updates

- Uploader CLI now supports versioning to ensure compatibility.
- Upload progress is now displayed in CLI output for better tracking.
- Local file validation process improved for faster and more accurate uploads.
- Removed redundant CLI parameters for a streamlined experience.

#### User Account & Access Management

- Admins can configure and customize user permissions for system access.
- Admins can configure and customize user accounts to receive email notifications.
- Users must specify the studies they need access to when submitting an access request.
- New email notification sent when user account access is changed.

#### Data Submissions Operation Dashboard

- Added Data Submission metrics by Program.
- Users can now export the Operation Dashboard to PDF for reporting and analysis.

## 3.1.0 (Released 12/20/2024)

- **caDSR Integration**: Submitted metadata is now validated against Common Data Element (CDE) Permissible Values.
- **Operations Dashboard**: Introduced a new dashboard for internal staff to monitor data submissions and operations effectively.
- **CLI Binary Distribution**: The Uploader CLI now supports binary downloads for quicker setup.
- **Automated Data Archiving**: All submitted data in Data Submissions are automatically archived upon completion.
- **CRDC_ID Uniqueness Checks**: Verifies that CRDC_IDs are unique within the Submission Portal, preventing duplication.
- **Manage Study Admin Tool**: Administrators can now view, add, and edit registered studies directly within the Submission Portal.
- **Enhanced Data Upload CLI Tool**: The Uploader CLI now supports AWS bucket-to-bucket data uploads.
- **Data Submission Collaborators**: Submitters can now add collaborators to work on their data submissions.
- **Federal Monitor Role**: Add a new role for federal staff, allowing them to monitor and oversee data submissions within their assigned studies.
- **Data Commons Data Curators**: Data Curators are now associated with specific Data Commons
- **Submission Access Requests**: Authenticated users can now request data submission access for their associated organization.
- **DCF Manifest File Integration**: The metadata release package now includes the DCF manifest file, facilitating automatic transfer to the Data Commons.
- **Submission Request PDF Export**: Users can now export submission requests as PDFs.
- **Data Submissions Table Improvements**: Supports configurable display columns and a compact table view for improved user experience
- **Support for Multiple Data Model Files**: The system now accommodates an arbitrary number of model files for each data model, offering enhanced flexibility.

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
