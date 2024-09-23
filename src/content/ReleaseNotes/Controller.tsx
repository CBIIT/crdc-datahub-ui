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

  useEffect(() => {
    if (document && document.length > 0) {
      return;
    }

    if (isFetchingRef.current) {
      return;
    }

    (async () => {
      isFetchingRef.current = true;
      const result = await fetchReleaseNotes();
      isFetchingRef.current = false;

      if (result instanceof Error) {
        Logger.error("ReleaseNotesController:", result);
        enqueueSnackbar("Unable to load release notes.", { variant: "error" });
        navigate("/");
        return;
      }

      setDocument(result);
    })();
  }, []);

  if (!document) {
    return <SuspenseLoader />;
  }

  return <NotesView md={document} />;
};

export default memo(ReleaseNotesController);
