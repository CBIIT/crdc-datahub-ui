import { Box, styled } from "@mui/material";
import { memo } from "react";
import Markdown from "react-markdown";

const StyledFrameContainer = styled(Box)({
  borderRadius: "6px",
  border: "1px solid #E0E0E0",
  background: "#fff",
  position: "relative",
  padding: "0 12px",
  margin: "30px auto",
  maxWidth: "calc(100% - 64px)",
});

type NotesViewProps = {
  /**
   * A valid markdown string to render as the Release Notes.
   */
  md: string | null;
};

/**
 * The view for the ReleaseNotes component.
 *
 * @param {NotesViewProps} props The props for the component.
 * @returns {JSX.Element} The ReleaseNotes component.
 */
const NotesView = ({ md }: NotesViewProps): JSX.Element => (
  <StyledFrameContainer>
    <Markdown data-testid="release-notes-markdown">{md}</Markdown>
  </StyledFrameContainer>
);

export default memo<NotesViewProps>(NotesView, (prev, next) => prev.md === next.md);
