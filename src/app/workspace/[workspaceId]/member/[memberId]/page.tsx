'use client';

import { useMemberId } from "@/features/auth/hooks/useMemberId";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCreateOrGetConversation } from "@/features/conversations/api/useCreateOrGetConversation";
import { AlertTriangleIcon, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
    const workspaceId = useWorkspaceId();
    const memberId = useMemberId();
    const {mutate, isPending} = useCreateOrGetConversation();

    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

    useEffect(() => {
        mutate({workspaceId, memberId},
            {
                onSuccess: (data) => {
                    setConversationId(data);
                }, 
                onError: () => {
                    toast.error('Failed to create or get conversation')
                }
            }
        );
    }, [workspaceId, memberId, mutate]);

    if(isPending) {
        return (
            <div className="h-full flex-1 flex items-center justify-center">
                <Loader className="size-5 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if(!conversationId) {
        return (
            <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
                <AlertTriangleIcon className="size-5 text-red-500"/>
                <span className="text-sm text-muted-foreground">
                    Conversation not found
                </span>
            </div>
        );
    }

    return <Conversation id={conversationId}/>
};

export default MemberIdPage;