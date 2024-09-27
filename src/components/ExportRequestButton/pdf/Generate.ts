import { jsPDF as JsPDF } from "jspdf";

/**
 * A function to generate a PDF document from a submission request.
 *
 * @param request The submission request to generate a PDF from.
 * @returns {Promise<URL>} A promise that resolves when the PDF is generated.
 * @throws {Error} If the submission request is invalid.
 */
export const GenerateDocument = async (request: Application): Promise<URL> => {
  if (!request || !request?._id) {
    throw new Error("Invalid submission request provided.");
  }

  const document = new JsPDF({
    orientation: "portrait",
    unit: "px",
    format: "letter",
  });

  document.setProperties({
    title: `Submission Request ${request._id}`,
    subject: `PDF Export of Submission Request ${request._id}`,
    keywords: "CRDC, submission request, PDF export",
    author: "CRDC Submission Portal",
    creator: "crdc-datahub-ui",
  });
  // TODO: remove this
  document.output("dataurlnewwindow", {
    filename: "TODO-filename.pdf",
  });

  return document.output("bloburl");
};
