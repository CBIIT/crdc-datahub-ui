import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import { unparse } from 'papaparse';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from '../../graphql';
import { downloadBlob, filterAlphaNumeric, unpackQCResultSeverities } from '../../utils';

export type Props = {
  /**
   * The full Data Submission object to export validation results for
   */
  submission: Submission;
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
 * @returns {React.FC} The export validation button.
 */
export const ExportValidationButton: React.FC<Props> = ({ submission, fields, ...buttonProps }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(false);

  const [submissionQCResults] = useLazyQuery<SubmissionQCResultsResp>(SUBMISSION_QC_RESULTS, {
    context: { clientName: 'backend' },
    fetchPolicy: 'cache-and-network',
  });

  const handleClick = async () => {
    setLoading(true);

    const { data: d, error } = await submissionQCResults({
      variables: {
        id: submission?._id,
        sortDirection: "asc",
        orderBy: "displayID",
        first: -1,
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

    if (!d?.submissionQCResults?.results.length) {
      enqueueSnackbar("There are no validation results to export.", { variant: "error" });
      setLoading(false);
      return;
    }

    try {
      const filename = `${filterAlphaNumeric(submission.name)}-${dayjs().format("YYYY-MM-DDTHHmmss")}.csv`;
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

      downloadBlob(unparse(csvArray), filename, "text/csv");
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
