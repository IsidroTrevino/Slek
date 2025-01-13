import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ListFilter, SquarePen } from "lucide-react";
import { Hint } from "@/components/hint";
import { PreferencesModal } from "./preferencesModal";
import { useState } from "react";
import { InviteModal } from "./inviteModal";

interface WorkspaceHeaderProps {
    workspace: { _id: string; _creationTime: number; name: string; joinCode: string; };
    isAdmin: boolean;
}

export const WorkspaceHeader = ({workspace, isAdmin}: WorkspaceHeaderProps) => {
    const [preferencesOpen, preferencesSetOpen] = useState(false);
    const [inviteOpen, inviteSetOpen] = useState(false);

    return (
        <>
            <InviteModal open={inviteOpen} setOpen={inviteSetOpen} name={workspace.name} joinCode={workspace.joinCode}/>
            <PreferencesModal open={preferencesOpen} setOpen={preferencesSetOpen} initialValue={workspace.name}/>
            <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="transparent" className="font-semibold text-lg w-auto p-1.5 overflow-hidden" size="sm">
                            <span className="truncate">
                                {workspace.name}
                            </span>
                            <ChevronDown className="size-4 ml-1 shrink-0"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="w-60 ml-2 pt-2 bg-white rounded-md">
                        <DropdownMenuItem className="cursor-pointer capitalize flex p-2">
                            <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md flex items-center justify-center ">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start ml-2">
                                <p className="font-bold">
                                    {workspace.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Active workspace
                                </p>
                            </div>
                        </DropdownMenuItem>
                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className="cursor-pointer px-4 py-2" onClick={() => {inviteSetOpen(true)}}>
                                    Invite People to {workspace.name}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className="cursor-pointer px-4 py-2" onClick={() => preferencesSetOpen(true)}>
                                    Preferences
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-0.5">
                    <Hint label="New message" side="bottom">
                        <Button variant="transparent" size="sm">
                            <SquarePen className="size-4"/>
                        </Button>
                    </Hint>

                    <Hint label="Filter conversations" side="bottom">
                        <Button variant="transparent" size="sm">
                            <ListFilter className="size-4"/>
                        </Button>
                    </Hint>

                </div>
            </div>
        </>
    );
}