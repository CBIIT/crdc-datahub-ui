import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useSnackbar } from 'notistack';
import { unparse } from 'papaparse';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from '../../graphql';
import { downloadBlob, unpackQCResultSeverities } from '../../utils';

export type Props = {
  /**
   * The `_id` (uuid) of the submission to build the QC Results for
   *
   * @example 9f9c5d6b-5ddb-4a02-8bd6-7bf0c15a169a
   */
  submissionId: Submission["_id"];
  /**
   * The K:V pair of the fields that should be exported where
   * `key` is the column header and `value` is a function
   * that generates the exportable value
   *
   * @example { "Batch ID": (d) => d.displayID }
   */
  fields: Record<string, (row: QCResult) => string | number>;
} & ButtonProps;

/**
 * Provides the button and supporting functionality to export the validation results of a submission.
 *
 * @param submissionId The ID of the submission to export validation results for.
 * @returns {React.FC} The export validation button.
 */
export const ExportValidationButton: React.FC<Props> = ({ submissionId, fields, ...buttonProps }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [submissionQCResults] = useLazyQuery<SubmissionQCResultsResp>(SUBMISSION_QC_RESULTS, {
    variables: { id: submissionId },
    context: { clientName: 'backend' },
    fetchPolicy: 'cache-and-network',
  });

  const handleClick = async () => {
    setLoading(true);

    const { data: d, error } = await submissionQCResults({
      variables: {
        id: submissionId,
        sortDirection: "asc",
        orderBy: "displayID",
        first: 10000, // TODO: change to -1
        offset: 0,
      },
      context: { clientName: 'backend' },
      fetchPolicy: 'no-cache'
    });

    if (error || !d?.submissionQCResults?.results) {
      enqueueSnackbar("Unable to retrieve submission quality control results.", { variant: "error" });
      setLoading(false);
      return;
    }

    try {
      const unpacked = unpackQCResultSeverities(d.submissionQCResults.results);
      const csvArray = [];

      unpacked.forEach((row) => {
        const csvRow = {};
        const fieldset = Object.entries(fields);

        fieldset.forEach(([field, value]) => {
          csvRow[field] = value(row) || "";
        });

        csvArray.push(csvRow);
      });

      // TODO: File name?
      downloadBlob(unparse(csvArray), "validation-results.csv", "text/csv");
    } catch (err) {
      enqueueSnackbar("Unable to export validation results.", { variant: "error" });
    }

    setLoading(false);
  };

  return (
    <LoadingButton
      loading={loading}
      onClick={handleClick}
      variant="contained"
      color="primary"
      {...buttonProps}
    >
      Download QC Results
    </LoadingButton>
  );
};
