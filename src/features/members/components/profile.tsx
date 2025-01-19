import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMember } from "../api/useGetMember";
import { AlertTriangle, Loader, MailIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface ProfileProps {
    id: Id<"members">;
    onClose: () => void;
}

export const Profile = ({id, onClose}: ProfileProps) => {
    const {data: member, isLoading: isLoadingMember} = useGetMember({id: id});

    if (isLoadingMember) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                    <p className="text-lg font-bold">Thread</p>
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
    );
}