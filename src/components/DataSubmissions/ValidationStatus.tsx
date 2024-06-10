export type Props = {
  /**
   * The relevant Data Submission object.
   *
   * Accepts either a Submission object or a subset of its properties.
   */
  submission: Pick<Submission, "_id"> | Submission;
};

/**
 * Provides the implementation for the ValidationControls current validation Status text.
 */
export const ValidationStatus: React.FC<Props> = ({ submission }: Props) => {
  const { _id } = submission;

  return <span>This is the text content for {_id}.</span>;
};
