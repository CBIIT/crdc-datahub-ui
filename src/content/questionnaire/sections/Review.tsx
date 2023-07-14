import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { Divider, Grid, Stack, styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import { KeyedPlannedPublication, KeyedPublication } from "./B";
import { mapObjectWithKey } from "../utils";
import { KeyedContact } from "./A";
import { KeyedFileTypeData } from "./D";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import ReviewSection from "../../../components/Questionnaire/ReviewSection";
import ReviewDataListing from "../../../components/Questionnaire/ReviewDataListing";
import ReviewDataListingProperty from "../../../components/Questionnaire/ReviewDataListingProperty";
import ReviewFileTypeTable from "../../../components/Questionnaire/ReviewFileTypeTable";
import { formatPhoneNumber } from "../../../utils";

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
  const { pi, primaryContact, program, study } = data;
  const formRef = useRef<HTMLFormElement>();
  const { saveFormRef, submitFormRef, nextButtonRef, getFormObjectRef } = refs;

  const [additionalContacts] = useState<KeyedContact[]>(data.additionalContacts?.map(mapObjectWithKey) || []);
  const [publications] = useState<KeyedPublication[]>(data.study?.publications?.map(mapObjectWithKey) || []);
  const [plannedPublications] = useState<KeyedPlannedPublication[]>(data.study?.plannedPublications?.map(mapObjectWithKey) || []);
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
            <ReviewDataListingProperty label="Position" value={pi.position} />
            <ReviewDataListingProperty label="Institution Name" value={pi.institution} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Email Address" value={pi.email} />
            <ReviewDataListingProperty
              label="Institution Address"
              value={(
                <StyledAddress>
                  <span>{`${piAddressPart1}${piAddressPart2?.length ? "," : ""}`}</span>
                  <span>{piAddressPart2.join(",")}</span>
                </StyledAddress>
              )}
            />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Primary Contact assisting with data collection">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Name" value={`${primaryContact.lastName}, ${primaryContact.firstName}`} />
            <ReviewDataListingProperty label="Position" value={primaryContact.position} />
            <ReviewDataListingProperty label="Institution Name" value={primaryContact.institution} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Email Address" value={primaryContact.email} />
            <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(primaryContact.phone)} />
          </Grid>
        </ReviewDataListing>

        {additionalContacts?.map((additionalContact: KeyedContact, idx: number) => (
          <ReviewDataListing key={additionalContact.key} title={idx <= 1 ? "Additional Contacts" : null} hideTitle={idx === 1}>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Contact Name" value={`${additionalContact.lastName}, ${additionalContact.firstName}`} />
              <ReviewDataListingProperty label="Position" value={additionalContact.position} />
              <ReviewDataListingProperty label="Institution Name" value={additionalContact.institution} />
            </Grid>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Email Address" value={additionalContact.email} />
              <ReviewDataListingProperty label="Phone Number" value={formatPhoneNumber(additionalContact.phone)} />
            </Grid>
          </ReviewDataListing>
        ))}

      </ReviewSection>

      {/* Program and study information Section */}
      <ReviewSection title="Program and study information">
        <ReviewDataListing title="Program">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Program Name" value={program.name} />
            <ReviewDataListingProperty label="Program Abbreviation" value={program.abbreviation} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Program Description" value={program.description} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Study">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Study Name" value={study.name} />
            <ReviewDataListingProperty label="Study Abbreviation" value={study.abbreviation} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Study Description" value={study.description} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>

        {publications?.map((publication: KeyedPublication, idx: number) => (
          <ReviewDataListing key={publication.key} title={idx === 0 ? "Publications associated with study" : null}>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Publication Title" value={publication.title} valuePlacement="bottom" />
            </Grid>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="PUBMEDID" value={publication.pubmedID} />
              <ReviewDataListingProperty label="DOI" value={publication.DOI} />
            </Grid>
          </ReviewDataListing>
        ))}

        {plannedPublications?.map((plannedPublication: KeyedPlannedPublication, idx: number) => (
          <ReviewDataListing key={plannedPublication.key} title={idx === 0 ? "Planned Publications" : null}>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Planned Publication Title" value={plannedPublication.title} valuePlacement="bottom" />
            </Grid>
            <Grid md={6} xs={12} item>
              <ReviewDataListingProperty label="Expected Publication Date" value={plannedPublication.expectedDate} />
            </Grid>
          </ReviewDataListing>
        ))}
      </ReviewSection>

      {/* Data Access and Disease Information Section */}
      <ReviewSection title="Data Access and Disease Information">
        <ReviewDataListing>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Access Types" value={data.accessTypes.join(", ")} valuePlacement="bottom" />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Targeted Data Submission Delivery Date" value={data.targetedSubmissionDate} valuePlacement="bottom" />
            <ReviewDataListingProperty label="Targeted Data Release Date" value={data.targetedReleaseDate} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>
      </ReviewSection>

      {/* Submission Data types Section */}
      <ReviewSection title="Submission Data types">
        <ReviewDataListing title="Data Types">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Clinical Trial" value={data.dataTypes?.includes("Clinical Trial") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Genomics" value={data.dataTypes?.includes("Genomics") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Imaging" value={data.dataTypes?.includes("Imaging") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Other Data types" value={data.otherDataTypes} valuePlacement="bottom" />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Immunology" value={data.dataTypes?.includes("Immunology") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Proteomics" value={data.dataTypes?.includes("Proteomics") ? "Yes" : "No"} />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="Clinical Types">
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Demographic Data" value={data.dataTypes?.includes("Demographic Data") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Diagnosis Data" value={data.dataTypes?.includes("Diagnosis Data") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Treatment Data" value={data.dataTypes?.includes("Treatment Data") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Relapse/Recurrence data" value={data.dataTypes?.includes("Relapse/Recurrence data") ? "Yes" : "No"} />
          </Grid>
          <Grid md={6} xs={12} item>
            <ReviewDataListingProperty label="Outcome Data" value={data.dataTypes?.includes("Outcome Data") ? "Yes" : "No"} />
            <ReviewDataListingProperty label="Other Data types" value={data.clinicalData.otherDataTypes} valuePlacement="bottom" />
          </Grid>
        </ReviewDataListing>

        <ReviewDataListing title="File Types">
          <Grid xs={12} item>
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
