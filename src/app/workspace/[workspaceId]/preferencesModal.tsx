'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogFooter, DialogClose, DialogHeader } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { useUpdateWorkspace } from "@/features/workspaces/api/useUpdateWorkspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/useRemoveWorkspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/features/auth/hooks/useConfirm";

interface PreferencesModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    initialValue: string;
}

export const PreferencesModal = ({open, setOpen, initialValue}: PreferencesModalProps) => {
    const [value, setValue] = useState(initialValue);
    const [editOpen, setEditOpen] = useState(false);
    const [ConfirmDialog, confirm] = useConfirm("Are you sure?", "This action is irreversible.");


    const workspaceId = useWorkspaceId();

    const router = useRouter();

    const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useRemoveWorkspace();

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await updateWorkspace({id: workspaceId, name: value} ,
            {
                onSuccess: () => {
                    toast.success("Workspace updated successfully");
                    setEditOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message);
                }
            }
        );
        setEditOpen(false);
    }

    const handleDelete = async () => {
        const ok = await confirm();

        if(!ok) return;

        deleteWorkspace({id: workspaceId},
            {
                onSuccess: () => {
                    router.push("/");
                    toast.success("Workspace deleted successfully");
                    setOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message);
                }
            }
        );
    }

    return (
        <>
            <ConfirmDialog/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle>
                            {value}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">
                                            Workspace Name
                                        </p>
                                        <p className="text-sm text-[#1264A3] hover:underline font-semibold">
                                            Edit
                                        </p>
                                    </div>
                                    <p className="text-sm flex items-start">
                                        {value}
                                    </p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Rename this workspace
                                    </DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleEdit}>
                                    <Input value={value} disabled={isUpdatingWorkspace} onChange={(e) => {setValue(e.target.value)}} required autoFocus minLength={3} maxLength={80} placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"/>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant={"outline"} disabled={isUpdatingWorkspace}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdatingWorkspace}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <button disabled={isDeletingWorkspace} onClick={handleDelete } className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600">
                            <Trash/>
                            <p className="text-sm font-semibold">Delete workspace</p>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}