import {
  createContext,
  useContext,
  useMemo,
  useState,
  FC,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useSnackbar } from "notistack";
import { isEqual } from "lodash";
import { useMutation, useLazyQuery, ApolloError } from "@apollo/client";
import {
  LIST_POTENTIAL_COLLABORATORS,
  EDIT_SUBMISSION_COLLABORATORS,
  ListPotentialCollaboratorsResp,
  ListPotentialCollaboratorsInput,
  EditSubmissionCollaboratorsResp,
  EditSubmissionCollaboratorsInput,
} from "../../graphql";
import { useSubmissionContext } from "./SubmissionContext";
import { Logger, userToCollaborator } from "../../utils";

/**
 * Types for CollaboratorsContext
 */
type CollaboratorsCtxState = {
  currentCollaborators: Collaborator[];
  remainingPotentialCollaborators: Collaborator[];
  maxCollaborators: number;
  handleAddCollaborator: () => void;
  handleRemoveCollaborator: (collaboratorIdx: number) => void;
  handleUpdateCollaborator: (collaboratorIdx: number, newCollaborator: CollaboratorInput) => void;
  saveCollaborators: () => Promise<Collaborator[]>;
  resetCollaborators: () => void;
  loadPotentialCollaborators: () => void;
  loading: boolean;
  error: ApolloError | null;
};

/**
 * CollaboratorsContext to manage collaborators state
 */
const CollaboratorsContext = createContext<CollaboratorsCtxState | undefined>(undefined);

/**
 * Custom hook to use the CollaboratorsContext
 *
 * @note Do NOT use this context directly. This is exported for testing purposes only.
 * @see {@link CollaboratorsProvider}
 * @see {@link CollaboratorsCtxState}
 * @throws Error if used outside of CollaboratorsProvider
 */
export const useCollaboratorsContext = (): CollaboratorsCtxState => {
  const context = useContext(CollaboratorsContext);
  if (!context) {
    throw new Error("useCollaboratorsContext must be used within a CollaboratorsProvider");
  }
  return context;
};

/**
 * Default empty collaborator object
 */
const defaultEmptyCollaborator: Collaborator = {
  collaboratorID: "",
  permission: "Can View",
} as Collaborator;

type ProviderProps = {
  children: ReactNode;
};

/**
 * CollaboratorsProvider component to provide collaborators context
 *
 * @see {@link useSubmissionContext} The context hook
 * @returns {JSX.Element}
 */
export const CollaboratorsProvider: FC<ProviderProps> = ({ children }) => {
  const { data: submissionData } = useSubmissionContext();
  const { enqueueSnackbar } = useSnackbar();

  const [potentialCollaborators, setPotentialCollaborators] = useState<Collaborator[]>([]);
  const [maxCollaborators, setMaxCollaborators] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApolloError | null>(null);
  const [currentCollaborators, setCurrentCollaborators] = useState<Collaborator[]>([
    { ...defaultEmptyCollaborator },
  ]);

  const submissionID = submissionData?.getSubmission?._id;

  const [loadPotentialCollaboratorsQuery] = useLazyQuery<
    ListPotentialCollaboratorsResp,
    ListPotentialCollaboratorsInput
  >(LIST_POTENTIAL_COLLABORATORS, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      setMaxCollaborators(data?.listPotentialCollaborators?.length || 0);
      const collaborators = data?.listPotentialCollaborators?.map((user) =>
        userToCollaborator(user)
      );
      setPotentialCollaborators(collaborators);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  const [editSubmissionCollaborators, { loading: editLoading }] = useMutation<
    EditSubmissionCollaboratorsResp,
    EditSubmissionCollaboratorsInput
  >(EDIT_SUBMISSION_COLLABORATORS, {
    fetchPolicy: "no-cache",
  });

  /**
   * Maps the submission's collaborators to include additional details from potential collaborators
   *
   * @returns {Collaborator[]} The array of collaborators
   */
  const mapSubmissionCollaborators = useCallback((): Collaborator[] => {
    if (!submissionData?.getSubmission?.collaborators?.length || !potentialCollaborators.length) {
      return [];
    }

    const mappedCollaborators = submissionData.getSubmission.collaborators.map((collaborator) => {
      const potentialCollaborator = potentialCollaborators.find(
        (pc) => pc.collaboratorID === collaborator.collaboratorID
      );

      if (potentialCollaborator) {
        return {
          ...collaborator,
          collaboratorName: potentialCollaborator.collaboratorName,
          Organization: potentialCollaborator.Organization,
        };
      }

      return collaborator;
    });

    return mappedCollaborators;
  }, [submissionData, potentialCollaborators]);

  /**
   * Resets the current collaborators to the mapped submission collaborators or to a default
   * collaborator if none exist
   *
   * @returns void
   */
  const resetCollaborators = useCallback(() => {
    const mappedCollaborators = mapSubmissionCollaborators();

    const newCollaborators =
      mappedCollaborators?.length > 0 ? mappedCollaborators : [{ ...defaultEmptyCollaborator }];

    if (!isEqual(newCollaborators, currentCollaborators)) {
      setCurrentCollaborators(newCollaborators);
    }
  }, [mapSubmissionCollaborators, currentCollaborators]);

  useEffect(() => {
    resetCollaborators();
  }, [mapSubmissionCollaborators]);

  /**
   * Loads potential collaborators from API
   *
   * @returns void
   */
  const loadPotentialCollaborators = useCallback(() => {
    if (!submissionID) return;
    setLoading(true);
    loadPotentialCollaboratorsQuery({ variables: { submissionID } });
  }, [submissionID, loadPotentialCollaboratorsQuery]);

  /**
   * Filters out already selected potential collaborators and returns
   * the remaining un-selected collaborators
   */
  const remainingPotentialCollaborators = useMemo(() => {
    const currentCollaboratorIDs = currentCollaborators.map((c) => c.collaboratorID);

    return potentialCollaborators
      .filter((pc) => !currentCollaboratorIDs.includes(pc.collaboratorID))
      .sort((a, b) => a.collaboratorName.localeCompare(b.collaboratorName));
  }, [currentCollaborators, potentialCollaborators]);

  /**
   * Creates a new empty collaborator object
   *
   * @returns {Collaborator} An empty Collaborator with "Can View" permission
   */
  const createEmptyCollaborator = (): Collaborator => ({ ...defaultEmptyCollaborator });

  /**
   * Adds a new empty collaborator to the list
   *
   * @returns void
   */
  const handleAddCollaborator = (): void => {
    setCurrentCollaborators((prev) => [...prev, createEmptyCollaborator()]);
  };

  /**
   * Removes a collaborator from the list
   * @param collaboratorIdx Index of the collaborator to remove
   * @returns void
   */
  const handleRemoveCollaborator = (collaboratorIdx: number): void => {
    const currentCollaborator: Collaborator = currentCollaborators[collaboratorIdx];

    if (!currentCollaborator) {
      return;
    }

    setCurrentCollaborators((prev) => {
      const newCollaborators = prev.filter((_, index) => index !== collaboratorIdx);

      if (!newCollaborators.length) {
        return [createEmptyCollaborator()];
      }

      return newCollaborators;
    });
  };

  /**
   * Updates a collaborator in the list
   * @param collaboratorIdx Index of the collaborator to update
   * @param newCollaborator New collaborator data
   * @returns void
   */
  const handleUpdateCollaborator = (
    collaboratorIdx: number,
    newCollaborator: CollaboratorInput
  ): void => {
    if (
      isNaN(collaboratorIdx) ||
      (!newCollaborator?.collaboratorID && !newCollaborator?.permission)
    ) {
      return;
    }

    const potentialCollaborator = potentialCollaborators.find(
      (pc) => pc.collaboratorID === newCollaborator?.collaboratorID
    );

    setCurrentCollaborators((prevCollaborators) => {
      const collaboratorsClone = [...prevCollaborators];

      collaboratorsClone[collaboratorIdx] = {
        ...potentialCollaborator,
        ...newCollaborator,
      };

      return collaboratorsClone;
    });
  };

  /**
   * Saves the current collaborators and returns the updated collaborators
   * @returns {Promise<Collaborator[]>} Promise resolving to the updated list of collaborators
   */
  const saveCollaborators = useCallback(async (): Promise<Collaborator[]> => {
    const collaboratorsToSave = currentCollaborators
      .filter((c) => !!c.collaboratorID && !!c.permission)
      .map((c) => ({ collaboratorID: c.collaboratorID, permission: c.permission }));

    try {
      const { data, errors } = await editSubmissionCollaborators({
        variables: {
          submissionID,
          collaborators: collaboratorsToSave,
        },
      });

      if (errors || !data?.editSubmissionCollaborators) {
        throw new Error("Failed to save collaborators.");
      }

      enqueueSnackbar("All collaborator changes have been saved successfully.");

      return data.editSubmissionCollaborators.collaborators;
    } catch (err) {
      Logger.error(`CollaboratorsContext: ${err.toString()}`);
      enqueueSnackbar("Unable to edit submission collaborators.", {
        variant: "error",
      });
      return [];
    }
  }, [currentCollaborators, editSubmissionCollaborators, enqueueSnackbar, submissionID]);

  const contextValue = useMemo(
    () => ({
      currentCollaborators,
      remainingPotentialCollaborators,
      maxCollaborators,
      handleAddCollaborator,
      handleRemoveCollaborator,
      handleUpdateCollaborator,
      saveCollaborators,
      resetCollaborators,
      loadPotentialCollaborators,
      loading: loading || editLoading,
      error,
    }),
    [
      currentCollaborators,
      remainingPotentialCollaborators,
      maxCollaborators,
      handleAddCollaborator,
      handleRemoveCollaborator,
      handleUpdateCollaborator,
      saveCollaborators,
      resetCollaborators,
      loadPotentialCollaborators,
      loading,
      editLoading,
      error,
    ]
  );

  return (
    <CollaboratorsContext.Provider value={contextValue}>{children}</CollaboratorsContext.Provider>
  );
};
