import { useAtom, atom } from 'jotai';

const useCreateChannelModalAtom = atom(false);

export const useCreateChannelModal = () => {
    return useAtom(useCreateChannelModalAtom);
}