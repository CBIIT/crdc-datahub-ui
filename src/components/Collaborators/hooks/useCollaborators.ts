import { uniqueId } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { formatName } from "../../../utils";

const userToCollaborator = (
  user: Partial<User>,
  permission?: CollaboratorPermissions
): Collaborator => ({
  collaboratorID: user?._id,
  collaboratorName: formatName(user?.firstName, user?.lastName),
  permission: permission ?? ("" as CollaboratorPermissions),
  Organization: {
    orgID: user?.organization?.orgID,
    orgName: user?.organization?.orgName,
  },
});

type UseCollaboratorsParams = {
  collaborators: Collaborator[];
  potentialCollaborators: Pick<User, "_id" | "firstName" | "lastName" | "organization">[];
  onCollaboratorsChange: (collaborators: CollaboratorInput[]) => void;
};

type UseCollaboratorsReturn = {
  currentCollaborators: Collaborator[];
  remainingPotentialCollaborators: Collaborator[];
  handleAddCollaborator: () => void;
  handleRemoveCollaborator: (collaboratorID: string) => void;
  handleUpdateCollaborator: (collaboratorID: string, newCollaborator: CollaboratorInput) => void;
};

const useCollaborators = ({
  collaborators,
  potentialCollaborators,
  onCollaboratorsChange,
}: UseCollaboratorsParams): UseCollaboratorsReturn => {
  const [currentCollaborators, setCurrentCollaborators] = useState<Collaborator[]>([]);
  const [, setEmptyCollaborators] = useState<Collaborator[]>([]); // TODO:

  const emptyIdPrefix = "empty-collaborator-";

  useEffect(() => {
    const mappedCollaborators = collaborators?.map((collaborator) => {
      const potentialCollaborator = potentialCollaborators?.find(
        (pc) => pc._id === collaborator.collaboratorID
      );
      if (potentialCollaborator) {
        return userToCollaborator(potentialCollaborator, collaborator?.permission);
      }

      return collaborator;
    });

    if (!mappedCollaborators?.length) {
      const newEmptyCollaborator = createEmptyCollaborator();
      setCurrentCollaborators([newEmptyCollaborator]);
      return;
    }

    setCurrentCollaborators(mappedCollaborators);
  }, [collaborators, potentialCollaborators]);

  useEffect(() => {
    onCollaboratorsChange(currentCollaborators);
  }, [currentCollaborators]);

  const remainingPotentialCollaborators = useMemo(() => {
    const currentCollaboratorIDs = currentCollaborators?.map((c) => c.collaboratorID);

    return potentialCollaborators
      ?.filter((pc) => !currentCollaboratorIDs?.includes(pc._id))
      ?.map((user) => userToCollaborator(user))
      ?.sort((a, b) => a.collaboratorName?.localeCompare(b.collaboratorName));
  }, [currentCollaborators, potentialCollaborators]);

  const createEmptyCollaborator = (): Collaborator => {
    const id = uniqueId(emptyIdPrefix);
    const newEmptyCollaborator = { collaboratorID: id } as Collaborator;
    setEmptyCollaborators((prevCollaborators) => [...prevCollaborators, newEmptyCollaborator]);
    return newEmptyCollaborator;
  };

  const handleAddCollaborator = () => {
    setCurrentCollaborators((prev) => [...prev, createEmptyCollaborator()]);
  };

  const handleRemoveCollaborator = (collaboratorID: string) => {
    if (collaboratorID.startsWith(emptyIdPrefix)) {
      setEmptyCollaborators(
        (prevCollaborators) =>
          prevCollaborators?.filter(
            (collaborator) => collaborator.collaboratorID === collaboratorID
          )
      );
    }

    setCurrentCollaborators((prev) => {
      const newCollaborators = prev?.filter(
        (collaborator) => collaborator.collaboratorID !== collaboratorID
      );

      if (!newCollaborators?.length) {
        const newEmptyCollaborator = createEmptyCollaborator();
        setEmptyCollaborators([newEmptyCollaborator]);
        return [createEmptyCollaborator()];
      }

      return newCollaborators;
    });
  };

  const handleUpdateCollaborator = (collaboratorID: string, newCollaborator: CollaboratorInput) => {
    if (!collaboratorID || (!newCollaborator?.collaboratorID && !newCollaborator?.permission)) {
      return;
    }

    if (
      collaboratorID.startsWith(emptyIdPrefix) &&
      !newCollaborator.collaboratorID.startsWith(emptyIdPrefix)
    ) {
      setEmptyCollaborators((prevCollaborators) =>
        prevCollaborators.filter((collaborator) => collaborator.collaboratorID === collaboratorID)
      );
    }

    const potentialCollaborator = potentialCollaborators?.find(
      (pc) => pc._id === newCollaborator?.collaboratorID
    );

    if (!potentialCollaborator && !newCollaborator?.collaboratorID.startsWith(emptyIdPrefix)) {
      return;
    }

    setCurrentCollaborators(
      (prevCollaborators) =>
        prevCollaborators?.map((prevCollaborator) => {
          if (prevCollaborator?.collaboratorID !== collaboratorID) {
            return prevCollaborator;
          }

          return {
            ...userToCollaborator(potentialCollaborator),
            ...newCollaborator,
          };
        })
    );
  };

  return {
    currentCollaborators,
    remainingPotentialCollaborators,
    handleAddCollaborator,
    handleRemoveCollaborator,
    handleUpdateCollaborator,
  };
};

export default useCollaborators;
