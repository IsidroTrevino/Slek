import { useAtom, atom } from 'jotai';

const createWorkspaceModalAtom = atom(false);

export const useCreateWorkspaceModal = () => {
    return useAtom(createWorkspaceModalAtom);
}