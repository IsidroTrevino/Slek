'use client';

import { useEffect, useMemo } from "react";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { useGetChannels } from "@/features/channels/api/useGetChannels";
import { useRouter } from "next/navigation";
import { useCreateChannelModal } from "@/features/channels/store/useCreateChannelModal";
import { Loader, TriangleAlertIcon } from "lucide-react";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";

const WorkspaceIdPage = () => {

    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const [open, setOpen] = useCreateChannelModal();

    const {data: member, isLoading: memberLoading} = useCurrentMember({workspaceId});

    const {data: workspace, isLoading: workspaceLoading} = useGetWorkspace({id: workspaceId});
    const {data: channels, isLoading: channelsLoading} = useGetChannels({workspaceId});

    const isAdmin = useMemo(() => member?.role === 'admin', [member?.role]);
    const channelId = useMemo(() => channels?.[0]?._id, [channels]);

    useEffect(() => {        
        if (!workspaceLoading && !channelsLoading && workspace && !memberLoading && member) {
            if (channelId) {
                console.log('Redirecting to:', `/workspace/${workspaceId}/channel/${channelId}`);
                router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
            } else if(!open && isAdmin) {
                setOpen(true);
            }
        }
    }, [channelId, workspaceLoading, channelsLoading, workspace, workspaceId, open, setOpen, router, memberLoading, member, isAdmin]);

    if (workspaceLoading || channelsLoading || memberLoading) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <Loader className="size-6 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if (!workspace || !member) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <TriangleAlertIcon className="size-6 text-red-500"/>
                <p className="text-muted-foreground text-sm">
                    Workspace not found
                </p>
            </div>
        );
    }
    

    return (
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlertIcon className="size-6 text-red-500"/>
            <p className="text-muted-foreground text-sm">
                Channel not found
            </p>
        </div>
    );
};


export default WorkspaceIdPage;