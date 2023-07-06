import { FC, useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { parseForm } from "@jalik/form-parser";
import { Divider, Stack, styled } from "@mui/material";
import { useFormContext } from "../../../components/Contexts/FormContext";
import { KeyedPlannedPublication, KeyedPublication } from "./B";
import { mapObjectWithKey } from "../utils";
import { KeyedContact } from "./A";
import { KeyedFileTypeData } from "./D";
import { FormatPhoneNumber } from "../../../components/StatusBar/utils";
import FormContainer from "../../../components/Questionnaire/FormContainer";
import ReviewSection from "../../../components/Questionnaire/ReviewSection";
import ReviewDataListing from "../../../components/Questionnaire/ReviewDataListing";
import ReviewDataListingProperty from "../../../components/Questionnaire/ReviewDataListingProperty";
import dataTypeOptions from "../../../config/DataTypesConfig";
import clinicalDataOptions from "../../../config/ClinicalDataConfig";

const StyledAddressLabel = styled(Stack)(() => ({
  display: "flex",
  height: "33px",
  flexDirection: "column",
  flexShrink: "0",
  "& span": {
    lineHeight: "18px",
  },
}));

const StyledAddress = styled(Stack)(() => ({
  display: "flex",
  height: "35px",
  flexDirection: "column",
  flexShrink: "0",
  justifyContent: "center",
  "& span": {
    lineHeight: "18px",
  },
}));

const StyledDivider = styled(Divider)(() => ({
  color: "#34A286",
  marginTop: "65px",
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
  const splitAddress = pi?.address?.split(",");

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
        <ReviewDataListing title="Principal Investigator for the study:" required>
          <ReviewDataListingProperty label="Name" value={`${pi.lastName}, ${pi.firstName}`} required />
          <ReviewDataListingProperty label="Position" value={pi.position} required />
          <ReviewDataListingProperty label="Email Address" value={pi.email} required />
          <ReviewDataListingProperty label="Institution Name" value={pi.institution} required />
          <ReviewDataListingProperty
            label={(
              <StyledAddressLabel>
                <span>Institution</span>
                <span>Address</span>
              </StyledAddressLabel>
            )}
            value={(
              <StyledAddress>
                {splitAddress?.length > 0 && <span>{`${splitAddress[0]}${splitAddress.length > 1 ? "," : ""}`}</span>}
                {splitAddress?.length > 1 && <span>{splitAddress.slice(1).join(",")}</span>}
              </StyledAddress>
            )}
            required
          />
        </ReviewDataListing>

        <ReviewDataListing title="Primary Contact assisting with data collection" required>
          <ReviewDataListingProperty label="Name" value={`${primaryContact.lastName}, ${primaryContact.firstName}`} required />
          <ReviewDataListingProperty label="Position" value={primaryContact.position} required />
          <ReviewDataListingProperty label="Institution Name" value={primaryContact.institution} required />
          <ReviewDataListingProperty label="Email Address" value={primaryContact.email} required />
          <ReviewDataListingProperty label="Phone Number" value={FormatPhoneNumber(primaryContact.phone)} required />
        </ReviewDataListing>

        {additionalContacts?.map((additionalContact: KeyedContact, idx: number) => (
          <ReviewDataListing key={additionalContact.key} title={idx <= 1 ? "Additional Contacts" : null} hideTitle={idx === 1} required>
            <ReviewDataListingProperty label="Contact Name" value={`${additionalContact.lastName}, ${additionalContact.firstName}`} required />
            <ReviewDataListingProperty label="Position" value={additionalContact.position} required />
            <ReviewDataListingProperty label="Institution Name" value={additionalContact.institution} required />
            <ReviewDataListingProperty label="Email Address" value={additionalContact.email} required />
            <ReviewDataListingProperty label="Phone Number" value={FormatPhoneNumber(additionalContact.phone)} required />
          </ReviewDataListing>
        ))}

      </ReviewSection>

      {/* Program and study information Section */}
      <ReviewSection title="Program and study information">
        <ReviewDataListing title="Program" required>
          <ReviewDataListingProperty label="Program Name" value={program.name} required />
          <ReviewDataListingProperty label="Program Abbreviation" value={program.abbreviation} required />
          <ReviewDataListingProperty label="Program Description" value={program.description} valuePlacement="bottom" required />
        </ReviewDataListing>

        <ReviewDataListing title="Study" required>
          <ReviewDataListingProperty label="Study Name" value={study.name} required />
          <ReviewDataListingProperty label="Study Abbreviation" value={study.abbreviation} required />
          <ReviewDataListingProperty label="Study Description" value={study.description} valuePlacement="bottom" required />
        </ReviewDataListing>

        {publications?.map((publication: KeyedPublication, idx: number) => (
          <ReviewDataListing key={publication.key} title={idx <= 1 ? "Publications associated with study" : null} hideTitle={idx === 1} required>
            <ReviewDataListingProperty label="Publication Title" value={publication.title} required />
            <ReviewDataListingProperty label="PUBMEDID" value={publication.pubmedID} />
            <ReviewDataListingProperty label="DOI" value={publication.DOI} />
          </ReviewDataListing>
        ))}
      </ReviewSection>

      {/* Data Access and Disease Information Section */}
      <ReviewSection title="Data Access and Disease Information">
        <ReviewDataListing required>
          <ReviewDataListingProperty label="Access Types" value={data.accessTypes.join(", ")} valuePlacement="bottom" required />
          <ReviewDataListingProperty label="Targeted Data Submission Delivery Date" value={data.targetedSubmissionDate} valuePlacement="bottom" required />
          <ReviewDataListingProperty label="Targeted Data Release Date" value={data.targetedReleaseDate} valuePlacement="bottom" required />
        </ReviewDataListing>

        {plannedPublications?.map((plannedPublication: KeyedPlannedPublication, idx: number) => (
          <ReviewDataListing key={plannedPublication.key} title={idx === 0 ? "Planned Publications" : null} required>
            <ReviewDataListingProperty label="Planned Publication Title" value={plannedPublication.title} required />
            <ReviewDataListingProperty label="Expected Publication Date" value={plannedPublication.expectedDate} required />
          </ReviewDataListing>
        ))}
      </ReviewSection>

      {/* Submission Data types Section */}
      <ReviewSection title="Submission Data types">
        <ReviewDataListing title="Data Types" required>
          {dataTypeOptions.map((dataType) => (
            <ReviewDataListingProperty key={dataType} label={dataType} value={data.dataTypes.includes(dataType) ? "Yes" : "No"} required />
          ))}
          <ReviewDataListingProperty label="Other Data types" value={data.otherDataTypes} valuePlacement="bottom" required />
        </ReviewDataListing>

        <ReviewDataListing title="Clinical Types" required>
          {clinicalDataOptions.map((clinicalData) => (
            <ReviewDataListingProperty key={clinicalData} label={clinicalData} value={data.dataTypes.includes(clinicalData) ? "Yes" : "No"} required />
          ))}
          <ReviewDataListingProperty label="Other Data types" value={data.clinicalData.otherDataTypes} valuePlacement="bottom" required />
        </ReviewDataListing>

        {fileTypes?.map((fileType: KeyedFileTypeData, idx: number) => (
          <ReviewDataListing key={fileType.key} title={idx <= 1 ? "File Types" : null} hideTitle={idx === 1} required>
            <ReviewDataListingProperty label={`File Type ${idx + 1}`} value={fileType.type} required />
            <ReviewDataListingProperty label={`File Type ${idx + 1}, Number of Files`} value={fileType.count?.toString()} required />
            <ReviewDataListingProperty label={`File Type ${idx + 1}, Est Amount Data`} value={fileType.amount} required />
          </ReviewDataListing>
          ))}

        <ReviewDataListing title="Additional Comments">
          <ReviewDataListingProperty value={data.submitterComment} valuePlacement="bottom" required />
        </ReviewDataListing>
      </ReviewSection>

      <StyledDivider />
    </FormContainer>
  );
};

export default FormSectionReview;
