import { useMemberId } from "@/features/auth/hooks/useMemberId";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetMessages } from "@/features/messages/api/useGetMessages";
import { Loader } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chatInput";
import { MessageList } from "@/components/messageList";
import { usePanel } from "@/features/auth/hooks/usePanel";


interface ConversationProps {
    id: Id<"conversations">;
}

export const Conversation = ({id}: ConversationProps) => {
    const memberId = useMemberId();
    const {data: member, isLoading: isMemberLoading} = useGetMember({id: memberId});
    const {results, status, loadMore} = useGetMessages({conversationId: id});
    const {onOpenProfile} = usePanel();

    if(isMemberLoading || status === "LoadingFirstPage") {
        return (
            <div className="h-full flex-1 flex items-center justify-center">
                <Loader className="size-5 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <Header memberName={member?.user.name} memberImage={member?.user.image} onClick={() => onOpenProfile(memberId)}/>
                <MessageList data={results} variant="conversation" memberImage={member?.user.image} memberName={member?.user.name} loadMore={loadMore} isLoadingMore={status === 'LoadingMore'} canLoadMore={status === 'CanLoadMore'}/>
            <ChatInput placeholder={`Message ${member?.user.name}`} conversationId={id}/>
        </div>
    );
};