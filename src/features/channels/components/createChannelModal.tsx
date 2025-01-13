import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateChannelModal } from "../store/useCreateChannelModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useCreateChannel } from "../api/useCreateChannel";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateChannelModal = () => {
    const [open, setOpen] = useCreateChannelModal();
    const router = useRouter();
    const [channelName, setChannelName] = useState('');
    const{mutate, isPending} = useCreateChannel();
    const workspaceId = useWorkspaceId();

    const handleClose = () => {
        setChannelName('');
        setOpen(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, '-').toLowerCase();
        setChannelName(value);
    }
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate(
            {name: channelName, workspaceId},
            {
                onSuccess: (id) => {
                    toast.success('Channel created successfully');
                    router.push(`/workspace/${workspaceId}/channel/${id}`);
                    handleClose();
                },
                onError: () => {
                    toast.error('Failed to create channel');
                }
            }
        );
    }   

    return (
        <Dialog open={open} onOpenChange={() => handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add a channel
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input value={channelName} disabled={isPending} onChange={handleChange} required autoFocus minLength={3} maxLength={80} placeholder="e.g. plan-budget"/>
                    <div className="flex justify-end">
                        <Button disabled={false}>
                            Create
                        </Button>
                    </div>
                </form>
                <DialogDescription>
                    Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}