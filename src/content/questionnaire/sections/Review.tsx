import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { Divider, Grid, Stack, Typography, styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import { KeyedPlannedPublication, KeyedPublication } from "./B";
import { mapObjectWithKey } from "../utils";
import { KeyedContact } from "./A";
import { KeyedFileTypeData } from "./D";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import ReviewSection from "../../../components/Questionnaire/ReviewSection";
import ReviewDataListing from "../../../components/Questionnaire/ReviewDataListing";
import ReviewDataListingProperty, { StyledValue } from "../../../components/Questionnaire/ReviewDataListingProperty";
import ReviewFileTypeTable from "../../../components/Questionnaire/ReviewFileTypeTable";
import { formatPhoneNumber } from "../../../utils";
import { KeyedTimeConstraint } from "./C";
import DataTypes from "../../../config/DataTypesConfig";

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

const StyledSectionInfoText = styled(Typography)(() => ({
  fontWeight: 700,
  fontFamily: "'Nunito', 'Rubik', sans-serif",
  lineHeight: "19.6px",
  color: "#34A286",
  fontSize: "16px",
  "& span": {
    fontWeight: 400
  }
}));

const GridCondensed = styled(Grid)(() => ({
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
  refs,
}: FormSectionProps) => {
  const { data } = useFormContext();
  const { pi, primaryContact, piAsPrimaryContact, program, study } = data;
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, nextButtonRef, getFormObjectRef } = refs;

  const [additionalContacts] = useState<KeyedContact[]>(data.additionalContacts?.map(mapObjectWithKey) || []);
  const [publications] = useState<KeyedPublication[]>(data.study?.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications] = useState<KeyedPlannedPublication[]>(data.study?.plannedPublications?.map(mapObjectWithKey) || []);
  const [timeConstraints] = useState<KeyedTimeConstraint[]>(data.timeConstraints?.map(mapObjectWithKey) || []);
  const [fileTypes] = useState<KeyedFileTypeData[]>(data.files?.map(mapObjectWithKey) || []);

  const [piAddressPart1, ...piAddressPart2] = pi?.address?.split(",") || [];

  useEffect(() => {
    if (!saveFormRef.current || !submitFormRef.current) {
      return;
    }

    saveFormRef.current.style.display = "none";
    nextButtonRef.current.style.display = "none";
    submitFormRef.current.style.display = "initial";

    getFormObjectRef.current = getFormObject;
  }, [refs]);

  const getFormObject = (): FormObject | null => {
    if (!formRef.current) {
      return null;
    }

    const formObject = parseForm(formRef.current, { nullify: false });
    const combinedData = { ...cloneDeep(data), ...formObject };

    return { ref: formRef, data: combinedData };
  };

  return (
    <FormContainer description="Review and Submit" formRef={formRef}>
      {/* Principal Investigator and Contact Information Section */}
      <ReviewSection title="Principal Investigator and Contact Information">
        <ReviewDataListing title="Principal Investigator for the study:">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Name" value={`${pi.lastName}, ${pi.firstName}`} />
            <ReviewDataListingProperty label="Email Address" value={pi.email} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Institution Name" value={pi.institution} />
            <ReviewDataListingProperty
              label="Institution Address"
              value={(
                <StyledAddress>
                  <StyledValue>{`${piAddressPart1}${piAddressPart2?.length ? "," : ""}`}</StyledValue>
                  <StyledValue>{piAddressPart2.join(",")}</StyledValue>
                </StyledAddress>
              )}
            />
            <ReviewDataListingProperty label="Position" value={pi.position} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Primary Contact assisting with data collection">
          {piAsPrimaryContact ? (
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Same as Principal Investigator" value={piAsPrimaryContact ? "Yes" : "No"} />
            </Grid>
          ) : (
            <>
              <Grid md={6} xs={12} item>
                <ReviewDataListingProperty label="Same as Principal Investigator" value={piAsPrimaryContact ? "Yes" : "No"} />
                <ReviewDataListingProperty label="Primary Contact Name" value={`${primaryContact?.lastName}, ${primaryContact?.firstName}`} />
                <ReviewDataListingProperty label="Email Address" value={primaryContact?.email} />
                <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(primaryContact?.phone)} />
              </Grid>
              <Grid md={6} xs={12} item>
                <ReviewDataListingProperty label="Institution Name" value={primaryContact?.institution} />
                <ReviewDataListingProperty label="Position" value={primaryContact?.position} />
              </Grid>
            </>
          )}
        </ReviewDataListing>

        {additionalContacts?.map((additionalContact: KeyedContact, idx: number) => (
          <ReviewDataListing key={additionalContact.key} title={idx <= 1 ? "Additional Contacts" : null} hideTitle={idx === 1}>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Contact Name" value={`${additionalContact.lastName}, ${additionalContact.firstName}`} />
              <ReviewDataListingProperty label="Email Address" value={additionalContact.email} />
              <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(additionalContact.phone)} />
            </Grid>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Institution Name" value={additionalContact.institution} />
              <ReviewDataListingProperty label="Position" value={additionalContact.position} />
            </Grid>
          </ReviewDataListing>
        ))}

      </ReviewSection>

      {/* Program and study information Section */}
      <ReviewSection title="Program and Study Information">
        <ReviewDataListing title="Program">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Program Name" value={program.name} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Program Abbreviation" value={program.abbreviation} />
          </Grid>
          <GridCondensed xs={12} item>
            <ReviewDataListingProperty label="Program Description" value={program.description} valuePlacement="bottom" />
          </GridCondensed>
        </ReviewDataListing>

        <ReviewDataListing title="Study">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Study Name" value={study.name} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Study Abbreviation" value={study.abbreviation} />
          </Grid>
          <GridCondensed xs={12} item>
            <ReviewDataListingProperty label="Study Description" value={study.description} valuePlacement="bottom" />
          </GridCondensed>
        </ReviewDataListing>

        {publications?.map((publication: KeyedPublication, idx: number) => (
          <ReviewDataListing key={publication.key} title={idx === 0 ? "Publications associated with study" : null}>
            <Grid xs={12} item>
              <ReviewDataListingProperty label="Publication Title" value={publication.title} valuePlacement="bottom" />
            </Grid>
            <GridCondensed md={6} xs={12} item>
              <ReviewDataListingProperty label="PUBMED ID" value={publication.pubmedID} />
            </GridCondensed>
            <GridCondensed md={6} xs={12} item>
              <ReviewDataListingProperty label="DOI" value={publication.DOI} />
            </GridCondensed>
          </ReviewDataListing>
        ))}

        {plannedPublications?.map((plannedPublication: KeyedPlannedPublication, idx: number) => (
          <ReviewDataListing key={plannedPublication.key} title={idx === 0 ? "Planned Publications" : null}>
            <Grid xs={12} item>
              <ReviewDataListingProperty label="Planned Publication Title" value={plannedPublication.title} valuePlacement="bottom" />
              <ReviewDataListingProperty label="Expected Publication Date" value={plannedPublication.expectedDate} />
            </Grid>
          </ReviewDataListing>
        ))}
      </ReviewSection>

      {/* Data Access and Disease Information Section */}
      <ReviewSection title="Data access and disease Information">
        <ReviewDataListing>
          <Grid xs={12} item>
            <StyledSectionInfoText variant="h6">
              Data Access.
              <span>
                {' '}
                Informed consent is the basis for institutions submitting data to determine the appropriateness of submitting human data to open or controlled-access NIH/NCI data repositories. This refers to how CRDC data repositories distribute scientific data to the public. The controlled-access studies are required to submit an Institutional Certification to NIH. Learn about this at https://sharing.nih.gov/
                <wbr />
                genomic-data-sharing-policy/institutional-certifications
              </span>
            </StyledSectionInfoText>
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Access Types" value={data.accessTypes.join(", ")} valuePlacement="bottom" />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Targeted Data Submission Delivery Date" value={data.targetedSubmissionDate} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Targeted Data Release Date" value={data.targetedReleaseDate} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>

        {timeConstraints?.map((timeConstraint: KeyedTimeConstraint, idx: number) => (
          <ReviewDataListing key={timeConstraint.key} title={idx === 0 ? "Time Constraints related to your submission" : null}>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Time Constraint Description" value={timeConstraint.description} valuePlacement="bottom" />
            </Grid>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Time Constraint Effective Date" value={timeConstraint.effectiveDate} valuePlacement="bottom" />
            </Grid>
          </ReviewDataListing>
        ))}

        <ReviewDataListing title="Type of Cancer(s) and, if applicable, pre-cancer(s) being studied">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Cancer types" value={data.cancerTypes?.join(", ")} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Pre-cancer types" value={data.preCancerTypes?.join(", ")} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Number of participants included in the submission" value={data.numberOfParticipants?.toString()} valuePlacement="bottom" />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Other cancer type not included" value={data.otherCancerTypes} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Other pre-cancer type not included" value={data.otherPreCancerTypes} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Species of participants" value={data.species?.join(", ")} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Cell lines, model systems, or neither">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Cell lines" value={data.cellLines ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Model systems" value={data.modelSystems ? "Yes" : "No"} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Confirm the data you plan to submit are de-identified">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Data de-identified" value={data.dataDeIdentified ? "Yes" : "No"} />
          </Grid>
        </ReviewDataListing>
      </ReviewSection>

      {/* Submission Data types Section */}
      <ReviewSection title="Submission Data types">
        <ReviewDataListing title="Data Types">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Clinical Trial" value={data.dataTypes?.includes(DataTypes.clinicalTrial) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Genomics" value={data.dataTypes?.includes(DataTypes.genomics) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Imaging" value={data.dataTypes?.includes(DataTypes.imaging) ? "Yes" : "No"} />
            {data.dataTypes?.includes(DataTypes.imaging) && data.imagingDataDeIdentified !== null && <ReviewDataListingProperty label="Imaging Data de-identified" value={data.imagingDataDeIdentified ? "Yes" : "No"} />}
            <ReviewDataListingProperty label="Other Data types" value={data.otherDataTypes} valuePlacement="bottom" />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Immunology" value={data.dataTypes?.includes(DataTypes.immunology) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Proteomics" value={data.dataTypes?.includes(DataTypes.proteomics) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Epidemiologic or Cohort" value={data.dataTypes?.includes(DataTypes.epidemiologicOrCohort) ? "Yes" : "No"} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Clinical Data">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Demographic Data" value={data.dataTypes?.includes(DataTypes.demographicData) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Diagnosis Data" value={data.dataTypes?.includes(DataTypes.diagnosisData) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Treatment Data" value={data.dataTypes?.includes(DataTypes.treatmentData) ? "Yes" : "No"} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Relapse/Recurrence data" value={data.dataTypes?.includes(DataTypes.relapseRecurrenceData) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Outcome Data" value={data.dataTypes?.includes(DataTypes.outcomeData) ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Biospecimen Data" value={data.dataTypes?.includes(DataTypes.biospecimenData) ? "Yes" : "No"} />
          </Grid>
          <GridCondensed xs={12} item>
            <ReviewDataListingProperty label="Additional Data in future" value={data.clinicalData?.futureDataTypes ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Other Data types" value={data.clinicalData?.otherDataTypes} valuePlacement="bottom" />
          </GridCondensed>
        </ReviewDataListing>

        <ReviewDataListing title="File Types">
          <Grid xs={12} item sx={{ marginTop: "25px" }}>
            <ReviewFileTypeTable files={fileTypes} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Additional Comments">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty value={data.submitterComment} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>
      </ReviewSection>

      <StyledDivider />
    </FormContainer>
  );
};

export default FormSectionReview;
