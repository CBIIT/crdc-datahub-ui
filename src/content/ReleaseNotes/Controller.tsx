import { memo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import usePageTitle from "../../hooks/usePageTitle";
import SuspenseLoader from "../../components/SuspenseLoader";
import NotesView from "./NotesView";
import { Logger, fetchReleaseNotes } from "../../utils";

/**
 * Controller component for the Release Notes page.
 *
 * @returns {React.ReactNode} The Release Notes page.
 */
const ReleaseNotesController = (): React.ReactNode => {
  usePageTitle("Release Notes");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [document, setDocument] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchNotes = async () => {
    isFetchingRef.current = true;

    try {
      const result = await fetchReleaseNotes();
      setDocument(result);
    } catch (error) {
      Logger.error("ReleaseNotesController:", error);
      enqueueSnackbar("Unable to load release notes.", { variant: "error" });
      navigate("/");
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isFetchingRef.current) {
      fetchNotes();
    }
  }, []);

  if (!document) {
    return <SuspenseLoader />;
  }

  return <NotesView md={document} />;
};

export default memo(ReleaseNotesController);
