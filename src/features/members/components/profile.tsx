import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/useGetMember";
import { AlertTriangle, ChevronDownIcon, Loader, MailIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useUpdateMember } from "../api/useUpdateMember";
import { useRemoveMember } from "../api/useRemoveMember";
import { useCurrentMember } from "../api/useCurrentMember";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { toast } from "sonner";
import { useConfirm } from "@/features/auth/hooks/useConfirm";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuRadioItem, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProfileProps {
    id: Id<"members">;
    onClose: () => void;
}

export const Profile = ({id, onClose}: ProfileProps) => {
    const {data: member, isLoading: isLoadingMember} = useGetMember({id: id});
    const [LeaveDialog, confirmLeave] = useConfirm("Leave workspace", "Are you sure you want to leave this workspace?");
    const [DeleteDialog, confirmDelete] = useConfirm("Remove member", "Are you sure you want to remove this member?");
    const [UpdateDialog, confirmUpdate] = useConfirm("Change role", "Are you sure you want to change this member's role?");

    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const {data: currentMember, isLoading: isLoadingCurrentMember} = useCurrentMember({workspaceId});
    const {mutate: updateMember} = useUpdateMember();
    const {mutate: deleteMember} = useRemoveMember();

    const onRemove = async () => {
        const ok = await confirmDelete();

        if(!ok) return;

        deleteMember({id: id},
            {
                onSuccess: () => {
                    toast.success("Member removed successfully");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to remove member");
                }
            }
        )
    }

    const onLeave = async () => {
        const ok = await confirmLeave();

        if(!ok) return;

        deleteMember({id: id},
            {
                onSuccess: () => {
                    router.replace("/")
                    toast.success("You left the workspace");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to leave the workspace");
                }
            }
        )
    }

    const onRoleChange = async (role: 'admin' | 'member') => {
        const ok = await confirmUpdate();

        if(!ok) return;

        updateMember({id: id, role},
            {
                onSuccess: () => {
                    toast.success("Role changed successfully");
                    onClose();
                },
                onError: () => {
                    toast.error("Failed to change role");
                }
            }
        )
    }


    if (isLoadingMember || isLoadingCurrentMember) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                        <XIcon className="size-5 stroke=[1.5]"/>
                    </Button>
                </div>
                <div className="flex-1 grid place-items-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader className="size-5 animate-spin text-muted-foreground"/>
                    </div>
                </div>
            </div>
        )
    }

    if (!member) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                        <XIcon className="size-5 stroke=[1.5]"/>
                    </Button>
                </div>
                <div className="flex-1 grid place-items-center">
                    <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="size-5 text-rose-500"/>
                        <p className="text-muted-foreground text-sm">
                            Profile not found
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const avatarFallback = member.user.name?.[0] ?? "M";

    return(
        <>
            <LeaveDialog/>
            <DeleteDialog/>
            <UpdateDialog/>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} variant={'ghost'} size={'iconsm'}>
                        <XIcon className="size-5 stroke=[1.5]"/>
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                    <Avatar className="max-w-[256px] max-h-[256px] size-full">
                        <AvatarImage src={member.user.image}/>
                        <AvatarFallback className="aspect-square text-9xl">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col p-4">
                    <p className="text-xl font-bold">{member.user.name}</p>
                    {
                        currentMember?.role === 'admin' && currentMember._id !== id ? (
                            <div className="flex items-center gap-2 mt-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={'outline'} className="w-full capitalize">
                                            {member.role} <ChevronDownIcon className="size-4 ml-2"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-full">
                                        <DropdownMenuRadioGroup value={member.role} onValueChange={(role) => onRoleChange(role as 'admin' | 'member')}>
                                            <DropdownMenuRadioItem value="admin">
                                                Admin
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="member">
                                                Member
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant={'outline'} className="w-full" onClick={onRemove}>
                                    Remove
                                </Button>
                            </div>
                        ) : currentMember?._id === id && currentMember.role !== 'admin' ? (
                            <div className="mt-4">
                                <Button variant={'outline'} className="w-full" onClick={onLeave}>
                                    Leave
                                </Button>
                            </div>
                        ) : null
                    }
                </div>
                <Separator/>
                <div className="flex flex-col p-4">
                    <p className="text-sm font-bold mb-4">Contact information</p>
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                            <MailIcon className="size-4"/>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-semibold text-muted-foreground">Email address</p>
                            <Link href={`mailto:${member.user.email}`} className="text-sm hover:underline text-[#1264a3]">
                                {member.user.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}