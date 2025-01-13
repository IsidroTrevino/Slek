'use client';

import { useRouter } from "next/navigation";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Loader, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export const UserButton = () => {
    const router = useRouter();
    const {data, isLoading} = useCurrentUser();
    const {signOut} = useAuthActions();

    const handleSignOut = async () => {
      await signOut();
      router.replace("/auth");
    };

    if (isLoading) {
        return <Loader className="size-4 animate-spin text-muted-foreground"/>
    }

    if (!data) {
        return null;
    }

    const {image, name} = data;

    const avatarFallback = name!.charAt(0).toUpperCase();

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="rounded-md size-10 hover:opacity-75 transition">
                    <AvatarImage alt={name} src={image} className='rounded-md'/>
                    <AvatarFallback className="rounded-md bg-sky-500 text-white">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" side="right" className="w-60">
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4 mr-2"/>
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};