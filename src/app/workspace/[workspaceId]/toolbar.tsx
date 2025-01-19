import { Button } from "@/components/ui/button";
import { 
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useGetChannels } from "@/features/channels/api/useGetChannels";
import { useGetMembers } from "@/features/members/api/useGetMembers";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";
import { Search,Info, Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Toolbar = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetWorkspace({ id: workspaceId });
    const router = useRouter();
    const {data: channels} = useGetChannels({ workspaceId });
    const {data: members} = useGetMembers({ workspaceId });
    const [open, setOpen] = useState(false);

    const onChannelClick = (channelId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/channel/${channelId}`)
    }

    const onMemberClick = (memberId: string) => {
        setOpen(false);
        router.push(`/workspace/${workspaceId}/member/${memberId}`)
    }

    return (
        <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
            
            <div className="flex-1"/>
            <div className="min-w-[480px] max-w-[642px] grow-[2] shrink">
                <Button 
                    size={"sm"} 
                    className="bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2" 
                    onClick={() => setOpen(true)}
                >
                    <Search className="size-4 text-white mr-2"/>
                    <span className="text-white text-xs">
                        Search {data?.name}
                    </span>
                </Button>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <DialogTitle></DialogTitle>
                    <CommandInput/>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Channels">
                            {channels?.map(channel => (
                                <CommandItem 
                                    key={channel._id} 
                                    onSelect={() => onChannelClick(channel._id)}
                                    value={channel.name}
                                >
                                    {channel.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Members">
                            {members?.map(member => (
                                <CommandItem 
                                    key={member.user._id} 
                                    onSelect={() => onMemberClick(member._id)}
                                    value={member.user.name || ''}
                                >
                                    {member.user.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>
            <div className="ml-auto flex-1 flex items-center justify-end">
                <Button variant={"transparent"} size={"iconsm"}>
                    <Info className="size-5 text-white"/>
                </Button>
            </div>
        </nav>
    );
}