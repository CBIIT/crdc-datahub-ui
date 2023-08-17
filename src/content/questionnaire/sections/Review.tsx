import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { Divider, Grid, Stack, styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import { KeyedFunding, KeyedPlannedPublication, KeyedPublication, KeyedRepository } from "./B";
import { KeyedContact } from "./A";
import { KeyedFileTypeData } from "./D";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import ReviewSection from "../../../components/Questionnaire/ReviewSection";
import ReviewDataListing from "../../../components/Questionnaire/ReviewDataListing";
import ReviewDataListingProperty, { StyledValue } from "../../../components/Questionnaire/ReviewDataListingProperty";
import ReviewFileTypeTable from "../../../components/Questionnaire/ReviewFileTypeTable";
import { mapObjectWithKey, formatPhoneNumber, findProgram } from "../../../utils";
import useFormMode from "./hooks/useFormMode";
import DataTypes from "../../../config/DataTypesConfig";
import SectionMetadata from "../../../config/SectionMetadata";
import { repositoryDataTypesOptions } from "../../../components/Questionnaire/Repository";

const StyledAddress = styled(Stack)(() => ({
  display: "flex",
  flexDirection: "column",
  flexShrink: "0",
  justifyContent: "start",
  "& span": {
    lineHeight: "18px",
  },
}));

const StyledDivider = styled(Divider)(() => ({
  color: "#34A286",
  marginTop: "34px",
  marginBottom: "8px",
}));

const BlankGrid = styled(Grid)(() => ({
  "&.MuiGrid-item": {
    paddingTop: 0
  }
}));

/**
 * Form Section Review View
 *
 * @param {FormSectionProps} props
 * @returns {JSX.Element}
 */
const FormSectionReview: FC<FormSectionProps> = ({
  SectionOption,
  refs,
}: FormSectionProps) => {
  const { data: { questionnaireData: data } } = useFormContext();
  const { formMode } = useFormMode();
  const { pi, primaryContact, piAsPrimaryContact, program, study } = data;
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, nextButtonRef, approveFormRef, rejectFormRef, getFormObjectRef } = refs;

  const [additionalContacts] = useState<KeyedContact[]>(data.additionalContacts?.map(mapObjectWithKey) || []);
  const [fundingAgencies] = useState<KeyedFunding[]>(data.study?.funding?.map(mapObjectWithKey) || []);
  const [publications] = useState<KeyedPublication[]>(data.study?.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications] = useState<KeyedPlannedPublication[]>(data.study?.plannedPublications?.map(mapObjectWithKey) || []);
  const [repositories] = useState<KeyedRepository[]>(data.study?.repositories?.map(mapObjectWithKey) || []);
  const [fileTypes] = useState<KeyedFileTypeData[]>(data.files?.map(mapObjectWithKey) || []);
  const [piAddressPart1, ...piAddressPart2] = pi?.address?.split(",") || [];
  const [programOption] = useState<ProgramOption>(findProgram(data.program));
  const predefinedProgram = programOption && !programOption.editable && !programOption.notApplicable;
  const showReviewTitle = formMode === "View Only" || formMode === "Review";

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    saveFormRef.current.style.display = "none";
    nextButtonRef.current.style.display = "none";

    if (formMode === "Review") {
      approveFormRef.current.style.display = "initial";
      rejectFormRef.current.style.display = "initial";
      submitFormRef.current.style.display = "none";
    } else {
      approveFormRef.current.style.display = "none";
      rejectFormRef.current.style.display = "none";
      submitFormRef.current.style.display = "initial";
    }

    getFormObjectRef.current = getFormObject;
  }, [refs, formMode]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    return { ref: formRef, data: combinedData };
  };

  return (
    <FormContainer description={showReviewTitle ? "Review" : SectionOption.title} formRef={formRef} hideReturnToSubmissions={false}>
      {/* Principal Investigator and Contact Information Section */}
      <ReviewSection title={SectionMetadata.A.title}>
        <ReviewDataListing
          title={SectionMetadata.A.sections.PRINCIPAL_INVESTIGATOR.title}
          description={SectionMetadata.A.sections.PRINCIPAL_INVESTIGATOR.description}
        >
          <ReviewDataListingProperty label="Name" value={`${pi.lastName}, ${pi.firstName}`} />
          <ReviewDataListingProperty label="Position" value={pi.position} />
          <ReviewDataListingProperty label="Email Address" value={pi.email} />
          <ReviewDataListingProperty label="Institution Name" value={pi.institution} />
          <BlankGrid md={6} xs={12} item />
          <ReviewDataListingProperty
            label="Institution Address"
            value={(
              <StyledAddress>
                <StyledValue>{`${piAddressPart1}${piAddressPart2?.length ? "," : ""}`}</StyledValue>
                <StyledValue>{piAddressPart2.join(",")}</StyledValue>
              </StyledAddress>
            )}
          />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.A.sections.PRIMARY_CONTACT.title}
          description={SectionMetadata.A.sections.PRIMARY_CONTACT.description}
        >
          {piAsPrimaryContact ? (
            <>
              <ReviewDataListingProperty label="Primary Contact Name" value={`${pi.lastName}, ${pi.firstName}`} />
              <ReviewDataListingProperty label="Position" value={pi.position} />
              <ReviewDataListingProperty label="Email Address" value={pi.email} />
              <ReviewDataListingProperty label="Institution Name" value={pi.institution} />
              <ReviewDataListingProperty label="Phone Number" value="" />
            </>
          ) : (
            <>
              <ReviewDataListingProperty label="Primary Contact Name" value={`${primaryContact?.lastName}, ${primaryContact?.firstName}`} />
              <ReviewDataListingProperty label="Position" value={primaryContact?.position} />
              <ReviewDataListingProperty label="Email Address" value={primaryContact?.email} />
              <ReviewDataListingProperty label="Institution Name" value={primaryContact?.institution} />
              <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(primaryContact?.phone)} />
            </>
          )}
        </ReviewDataListing>

        {additionalContacts?.map((additionalContact: KeyedContact, idx: number) => (
          <ReviewDataListing
            key={additionalContact.key}
            title={idx === 0 ? SectionMetadata.A.sections.ADDITIONAL_CONTACTS.title : null}
            description={idx === 0 ? SectionMetadata.A.sections.ADDITIONAL_CONTACTS.description : null}
          >
            <ReviewDataListingProperty label="Contact Name" value={`${additionalContact.lastName}, ${additionalContact.firstName}`} />
            <ReviewDataListingProperty label="Position" value={additionalContact.position} />
            <ReviewDataListingProperty label="Email Address" value={additionalContact.email} />
            <ReviewDataListingProperty label="Institution Name" value={additionalContact.institution} />
            <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(additionalContact.phone)} />
          </ReviewDataListing>
        ))}

      </ReviewSection>

      {/* Program and study information Section */}
      <ReviewSection title={SectionMetadata.B.title}>
        <ReviewDataListing
          title={SectionMetadata.B.sections.PROGRAM_INFORMATION.title}
          description={SectionMetadata.B.sections.PROGRAM_INFORMATION.description}
        >
          <ReviewDataListingProperty label="Program Title" value={predefinedProgram ? programOption.name : program?.name} />
          <ReviewDataListingProperty label="Program Abbreviation" value={predefinedProgram ? programOption.abbreviation : program?.abbreviation} />
          <ReviewDataListingProperty gridWidth={12} label="Program Description" value={predefinedProgram ? programOption.description : program?.description} valuePlacement="bottom" />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.B.sections.STUDY_INFORMATION.title}
          description={SectionMetadata.B.sections.STUDY_INFORMATION.description}
        >
          <ReviewDataListingProperty label="Study Title" value={study.name} />
          <ReviewDataListingProperty label="Study Abbreviation" value={study.abbreviation} />
          <ReviewDataListingProperty gridWidth={12} label="Study Description" value={study.description} valuePlacement="bottom" />
        </ReviewDataListing>

        {fundingAgencies?.map((fundingAgency: KeyedFunding, idx: number) => (
          <ReviewDataListing
            key={fundingAgency.key}
            title={idx === 0 ? SectionMetadata.B.sections.FUNDING_AGENCY.title : null}
            description={idx === 0 ? SectionMetadata.B.sections.FUNDING_AGENCY.description : null}
          >
            <ReviewDataListingProperty label="Funding Agency/Organization" value={fundingAgency.agency} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Grant or Contract Number(s)" value={fundingAgency.grantNumbers} valuePlacement="bottom" />
            <ReviewDataListingProperty label="NCI Program Officer" value={fundingAgency.nciProgramOfficer} valuePlacement="bottom" />
            <ReviewDataListingProperty label="NCI Genomic Program Administrator" value={fundingAgency.nciGPA} valuePlacement="bottom" />
          </ReviewDataListing>
        ))}

        <ReviewDataListing
          title={SectionMetadata.B.sections.DBGAP_REGISTRATION.title}
          description={SectionMetadata.B.sections.DBGAP_REGISTRATION.description}
        >
          <ReviewDataListingProperty label="dbGaP REGISTRATION" value={study.isDbGapRegistered ? "Yes" : "No"} />
          <ReviewDataListingProperty label="dbGaP PHS number" value={study.dbGaPPPHSNumber} />
        </ReviewDataListing>

        {publications?.map((publication: KeyedPublication, idx: number) => (
          <ReviewDataListing
            key={publication.key}
            title={idx === 0 ? SectionMetadata.B.sections.EXISTING_PUBLICATIONS.title : null}
            description={idx === 0 ? SectionMetadata.B.sections.EXISTING_PUBLICATIONS.description : null}
          >
            <ReviewDataListingProperty gridWidth={12} label="Publication Title" value={publication.title} valuePlacement="bottom" />
            <ReviewDataListingProperty label="PubMed ID (PMID)" value={publication.pubmedID} />
            <ReviewDataListingProperty label="DOI" value={publication.DOI} />
          </ReviewDataListing>
        ))}

        {plannedPublications?.map((plannedPublication: KeyedPlannedPublication, idx: number) => (
          <ReviewDataListing
            key={plannedPublication.key}
            title={idx === 0 ? SectionMetadata.B.sections.PLANNED_PUBLICATIONS.title : null}
            description={idx === 0 ? SectionMetadata.B.sections.PLANNED_PUBLICATIONS.description : null}
          >
            <ReviewDataListingProperty gridWidth={12} label="Planned Publication Title" value={plannedPublication.title} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Expected Publication Date" value={plannedPublication.expectedDate} />
          </ReviewDataListing>
        ))}

        {repositories?.map((repository: KeyedRepository, idx: number) => (
          <ReviewDataListing
            key={repository.key}
            title={idx === 0 ? SectionMetadata.B.sections.REPOSITORY.title : null}
            description={idx === 0 ? SectionMetadata.B.sections.REPOSITORY.description : null}
          >
            <ReviewDataListingProperty label="Repository Name" value={repository.name} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Study ID" value={repository.studyID} valuePlacement="bottom" />
            <ReviewDataListingProperty
              label="Data Type(s) Submitted"
              value={repository.dataTypesSubmitted?.map((dataType) => repositoryDataTypesOptions.find((option) => option.name === dataType)?.label)}
              valuePlacement="bottom"
              isList
            />
            <ReviewDataListingProperty label="Other Data Type(s)" value={repository.otherDataTypesSubmitted} valuePlacement="bottom" isList />
          </ReviewDataListing>
        ))}
      </ReviewSection>

      {/* Data Access and Disease Information Section */}
      <ReviewSection title={SectionMetadata.C.title}>
        <ReviewDataListing
          title={SectionMetadata.C.sections.DATA_ACCESS.title}
          description={SectionMetadata.C.sections.DATA_ACCESS.description}
        >
          <ReviewDataListingProperty label="Access Types" value={data.accessTypes} valuePlacement="bottom" isList />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.C.sections.CANCER_TYPES.title}
          description={SectionMetadata.C.sections.CANCER_TYPES.description}
        >
          <ReviewDataListingProperty label="Cancer types" value={data.cancerTypes} valuePlacement="bottom" isList />
          <ReviewDataListingProperty label="Other cancer type(s)" value={data.otherCancerTypes?.split(",")} valuePlacement="bottom" isList />
          <ReviewDataListingProperty label="Pre-cancer types" value={data.preCancerTypes} valuePlacement="bottom" isList />
          <ReviewDataListingProperty label="Other pre-cancer type(s)" value={data.otherPreCancerTypes?.split(",")} valuePlacement="bottom" isList />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.C.sections.SUBJECTS.title}
        >
          <ReviewDataListingProperty label="Species of subjects" value={data.species} valuePlacement="bottom" isList />
          <ReviewDataListingProperty label="Number of subjects included in the submission" value={data.numberOfParticipants?.toString()} valuePlacement="bottom" />
          <ReviewDataListingProperty label="Cell lines" value={data.cellLines ? "Yes" : "No"} />
          <ReviewDataListingProperty label="Model systems" value={data.modelSystems ? "Yes" : "No"} />
          <ReviewDataListingProperty label="Data de-identified" value={data.dataDeIdentified ? "Yes" : "No"} />
        </ReviewDataListing>
      </ReviewSection>

      {/* Data Types Section */}
      <ReviewSection title={SectionMetadata.D.title}>
        <ReviewDataListing
          title={SectionMetadata.D.sections.DATA_DELIVERY_AND_RELEASE_DATES.title}
        >
          <ReviewDataListingProperty label="Targeted Data Submission Delivery Date" value={data.targetedSubmissionDate} />
          <ReviewDataListingProperty label="Expected Publication Date" value={data.targetedReleaseDate} />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.D.sections.DATA_TYPES.title}
          description={SectionMetadata.D.sections.DATA_TYPES.description}
        >
          <ReviewDataListingProperty label={DataTypes.clinicalTrial.label} value={data.dataTypes?.includes(DataTypes.clinicalTrial.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.immunology.label} value={data.dataTypes?.includes(DataTypes.immunology.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.genomics.label} value={data.dataTypes?.includes(DataTypes.genomics.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.proteomics.label} value={data.dataTypes?.includes(DataTypes.proteomics.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.imaging.label} value={data.dataTypes?.includes(DataTypes.imaging.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.epidemiologicOrCohort.label} value={data.dataTypes?.includes(DataTypes.epidemiologicOrCohort.name) ? "Yes" : "No"} />
          {data.dataTypes?.includes(DataTypes.imaging.name) && data.imagingDataDeIdentified !== null && <ReviewDataListingProperty label="Imaging Data de-identified" value={data.imagingDataDeIdentified ? "Yes" : "No"} />}
          <ReviewDataListingProperty gridWidth={12} label="Other Data types" value={data.otherDataTypes} valuePlacement="bottom" isList />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.D.sections.CLINICAL_DATA_TYPES.title}
          description={SectionMetadata.D.sections.CLINICAL_DATA_TYPES.description}
        >
          <ReviewDataListingProperty label={DataTypes.demographicData.label} value={data.dataTypes?.includes(DataTypes.demographicData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.relapseRecurrenceData.label} value={data.dataTypes?.includes(DataTypes.relapseRecurrenceData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.diagnosisData.label} value={data.dataTypes?.includes(DataTypes.diagnosisData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.outcomeData.label} value={data.dataTypes?.includes(DataTypes.outcomeData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.treatmentData.label} value={data.dataTypes?.includes(DataTypes.treatmentData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty label={DataTypes.biospecimenData.label} value={data.dataTypes?.includes(DataTypes.biospecimenData.name) ? "Yes" : "No"} />
          <ReviewDataListingProperty gridWidth={12} label="Other Clinical Data types" value={data.clinicalData?.otherDataTypes?.split(",")} valuePlacement="bottom" isList />
          <ReviewDataListingProperty label="Additional Data in future" value={data.clinicalData?.futureDataTypes ? "Yes" : "No"} />
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.D.sections.FILE_TYPES.title}
          description={SectionMetadata.D.sections.FILE_TYPES.description}
        >
          <Grid xs={12} item>
            <ReviewFileTypeTable files={fileTypes} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing
          title={SectionMetadata.D.sections.ADDITIONAL_COMMENTS.title}
          description={SectionMetadata.D.sections.ADDITIONAL_COMMENTS.description}
        >
          <ReviewDataListingProperty gridWidth={12} value={data.submitterComment} valuePlacement="bottom" />
        </ReviewDataListing>
      </ReviewSection>

      <StyledDivider />
    </FormContainer>
  );
};

export default FormSectionReview;
