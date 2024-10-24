import { isEqual } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { formatName } from "../../../utils";

const defaultEmptyCollaborator: Collaborator = {
  collaboratorID: "",
  permission: "Can View",
} as Collaborator;

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
  handleRemoveCollaborator: (collaboratorIdx: number) => void;
  handleUpdateCollaborator: (collaboratorIdx: number, newCollaborator: CollaboratorInput) => void;
};

const useCollaborators = ({
  collaborators,
  potentialCollaborators,
  onCollaboratorsChange,
}: UseCollaboratorsParams): UseCollaboratorsReturn => {
  const [currentCollaborators, setCurrentCollaborators] = useState<Collaborator[]>([
    { ...defaultEmptyCollaborator },
  ]);

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
      return;
    }

    if (isEqual(mappedCollaborators, currentCollaborators)) {
      return;
    }

    setCurrentCollaborators(mappedCollaborators);
  }, [collaborators, potentialCollaborators]);

  useEffect(() => {
    onCollaboratorsChange(currentCollaborators);
  }, [currentCollaborators]);

  const remainingPotentialCollaborators = useMemo(() => {
    const currentCollaboratorIDs = [...currentCollaborators]?.map((c) => c.collaboratorID);

    return potentialCollaborators
      ?.filter((pc) => !currentCollaboratorIDs?.includes(pc._id))
      ?.map((user) => userToCollaborator(user))
      ?.sort((a, b) => a.collaboratorName?.localeCompare(b.collaboratorName));
  }, [currentCollaborators, potentialCollaborators]);

  const createEmptyCollaborator = (): Collaborator => {
    const newEmptyCollaborator = { ...defaultEmptyCollaborator };
    return newEmptyCollaborator;
  };

  const handleAddCollaborator = () => {
    setCurrentCollaborators((prev) => [...prev, createEmptyCollaborator()]);
  };

  const handleRemoveCollaborator = (collaboratorIdx: number) => {
    const currentCollaborator: Collaborator = currentCollaborators[collaboratorIdx];

    if (!currentCollaborator) {
      return;
    }

    setCurrentCollaborators((prev) => {
      const newCollaborators = prev?.filter(
        (collaborator) => collaborator.collaboratorID !== currentCollaborator.collaboratorID
      );

      if (!newCollaborators?.length) {
        return [createEmptyCollaborator()];
      }

      return newCollaborators;
    });
  };

  const handleUpdateCollaborator = (
    collaboratorIdx: number,
    newCollaborator: CollaboratorInput
  ) => {
    if (
      isNaN(collaboratorIdx) ||
      (!newCollaborator?.collaboratorID && !newCollaborator?.permission)
    ) {
      return;
    }

    const currentCollaborator: Collaborator = currentCollaborators[collaboratorIdx];

    const potentialCollaborator = potentialCollaborators?.find(
      (pc) => pc._id === newCollaborator?.collaboratorID
    );

    if (!currentCollaborator && !potentialCollaborator && !newCollaborator?.collaboratorID) {
      return;
    }

    setCurrentCollaborators((prevCollaborators) => {
      const collaboratorsClone = [...prevCollaborators];

      collaboratorsClone[collaboratorIdx] = {
        ...userToCollaborator(potentialCollaborator),
        ...newCollaborator,
      };

      return collaboratorsClone;
    });
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
