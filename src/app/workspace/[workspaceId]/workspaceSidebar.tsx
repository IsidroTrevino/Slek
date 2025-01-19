'use client';

import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { WorkspaceHeader } from "./workspaceHeader";
import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizontal } from "lucide-react";
import { SidebarItem } from "./sidebarItem";
import { useGetChannels } from "@/features/channels/api/useGetChannels";
import { WorkspaceSection } from "./workspaceSection";
import { useGetMembers } from "@/features/members/api/useGetMembers";
import { UserItem } from "./userItem";
import { useCreateChannelModal } from "@/features/channels/store/useCreateChannelModal";
import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { useMemberId } from "@/features/auth/hooks/useMemberId";


export const WorkspaceSidebar = () => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();
    const {data: member, isLoading: memberLoading} = useCurrentMember({workspaceId});
    const {data: workspace, isLoading: workspaceLoading} = useGetWorkspace({id: workspaceId});
    const {data: channels} = useGetChannels({workspaceId});
    const {data: members} = useGetMembers({workspaceId});
    const memberId = useMemberId();

    const [, setOpen] = useCreateChannelModal();

    if(workspaceLoading || memberLoading) {
        return (
            <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-white"/>
            </div>
        )
    }

    if(!workspace || !member) {
        return (
            <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
                <AlertTriangle className="size-5 text-white"/>
                <p className="text-white text-sm">
                    Workspace not found
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-[#5E2C5F] h-full">
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
            <div className='flex flex-col px-2 mt-3'>
                <SidebarItem label='Threads' icon={MessageSquareText} id="threads"/>
                <SidebarItem label='Drafts and sent' icon={SendHorizontal} id="drafts"/>
            </div>
            <WorkspaceSection label="Channels" hint="New channel" onNew={member.role === 'admin' ? () => {setOpen(true)} : undefined}>
                    {channels?.map((item) => (
                        <SidebarItem key={item._id} label={item.name} icon={HashIcon} id={item._id} variant={channelId === item._id ? "active" : 'default'}/>
                    ))}
            </WorkspaceSection>
            <WorkspaceSection label="Direct messages" hint="New direct message" onNew={() => {}}> 
                {
                    members?.map((item) => (
                        <UserItem key={item._id} id={item._id} label={item.user.name} image={item.user.image} variant={item._id === memberId ? 'active' : 'default'}/>
                    ))
                }
            </WorkspaceSection>
        </div>
    );
}