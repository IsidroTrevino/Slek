import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateChannel } from "@/features/channels/api/useUpdateChannel";
import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { useRemoveChannel } from "@/features/channels/api/useRemoveChannel";
import { toast } from "sonner";
import { useConfirm } from "@/features/auth/hooks/useConfirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";

interface HeaderProps {
    channelName: string;
}

export const Header = ({channelName}: HeaderProps) => {
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const [editOpen, setEditOpen] = useState(false);
    const [value, setValue] = useState(channelName);
    const [ConfirmDialog, confirm] = useConfirm('Delete this channel?', "Your're about to delete this channel, this action is irreversible.");

    const {mutate: updateChannel, isPending: updatePending} = useUpdateChannel();
    const {mutate: removeChannel, isPending: removePending} = useRemoveChannel();
    const {data: member} = useCurrentMember({workspaceId});


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/\s+/g, '-').toLowerCase();
            setValue(value);
    }

    const handleOpen = (value: boolean) => {
        if(member?.role !=='admin') return;
        setEditOpen(value);
    }

    const handleDelete = async () => {
        const ok = await confirm();

        if(!ok) return;

        removeChannel({channelId}, {
            onSuccess: () => {
                toast.success('Channel deleted successfully');
                router.push(`/workspace/${workspaceId}`);
            },
            onError: () => {
                toast.error('Failed to delete channel');
            }
        });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateChannel({channelId, name: value}, {
            onSuccess: () => {
                toast.success('Channel updated successfully');
                setEditOpen(false);
                router.push(`/workspace/${workspaceId}`);
                
            },
            onError: () => {
                toast.error('Failed to update channel');
            }
        });
    }

    return (
        <>
            <ConfirmDialog/>
            <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'ghost'} className="text-lg font-semibold px-2 overflow-hidden w-auto" size={'sm'}>
                            <span className="truncate">
                                #{channelName}
                            </span>
                            <FaChevronDown className="size-2.5 ml-2"/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                        <DialogHeader className="p-4 border-b bg-white">
                            <DialogTitle className="">
                                # {channelName}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-4 pb-4 flex flex-col gap-y-2">
                            <Dialog open={editOpen} onOpenChange={handleOpen}>
                                <DialogTrigger asChild>
                                    <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">
                                                Channel Name
                                            </p>
                                            {member?.role === 'admin' && (                                            
                                                <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                                    Edit
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm">
                                        # {channelName}
                                        </p>
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Rename this channel
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input value={value} disabled={updatePending} onChange={handleChange} autoFocus minLength={3} maxLength={80} className="w-full" placeholder="e.g. general"/>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant={'outline'} disabled={updatePending}>
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button disabled={updatePending}>
                                                Save
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            {member?.role === 'admin' && ( 
                            <button className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-500" onClick={handleDelete} disabled={removePending}>
                                <TrashIcon className="size-4"/>
                                <p className="text-sm font-semibold">Delete channel</p>
                            </button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}