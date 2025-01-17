import { GetMessagesReturnType } from "@/features/messages/api/useGetMessages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./message";
import { channel } from "diagnostics_channel";
import { ChannelHero } from "./channelHero";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useCurrentMember } from "@/features/members/api/useCurrentMember";
import { Loader } from "lucide-react";

interface MessageListProps {
    memberName?: string;
    memberImage?: string;
    channelName?: string;
    channelCreationTime?: number;
    variant?: "channel" | "thread" | "conversation";
    data: GetMessagesReturnType | undefined;
    loadMore: () => void;
    isLoadingMore: boolean;
    canLoadMore: boolean;
}

const TIME_THRESHOLD = 5;

const formatDateLabel = (date: string) => {
    const today = new Date();
    
    if(isToday(today)) {
        return "Today";
    }

    if(isYesterday(today)) {
        return "Yesterday";
    }

    return format(date, "EEEE, MMMM d");
}

export const MessageList = ({memberName, memberImage, channelName, channelCreationTime, variant = "channel", data, loadMore, isLoadingMore, canLoadMore}: MessageListProps) => {
    const groupedMessages = data?.reduce((groups, message) => {
        const date = new Date(message._creationTime);
        const dateKey = format(date, "yyyy-MM-dd");

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].unshift(message);
        return groups;
    },
        {} as Record<string, typeof data>
    );

    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const workspaceId = useWorkspaceId();

    const {data: currentMember} = useCurrentMember({workspaceId});

    return(
        <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            {
                Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                    <div key={dateKey}>
                        <div className="text-center my-2 relative">
                            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                {formatDateLabel(dateKey)}
                            </span>
                        </div>
                        {messages.map((message, index) => {
                            const previousMessage = messages[index - 1];
                            const isCompact = previousMessage && previousMessage.user?._id === message.user?._id && differenceInMinutes(new Date(message._creationTime), new Date(previousMessage._creationTime)) < TIME_THRESHOLD;

                            return (
                                <Message 
                                    key={message._id} 
                                    id={message._id} 
                                    memberId={message.memberId} 
                                    authorImage={message.user.image} 
                                    authorName={message.user.name} 
                                    isAuthor={currentMember?._id === message.memberId}
                                    reactions={message.reactions} 
                                    body={message.body}
                                    image={message.image}
                                    updatedAt={message.updatedAt}
                                    createdAt={message._creationTime}
                                    isEditing={editingId === message._id}
                                    setEditingId={setEditingId}
                                    isCompact={isCompact}
                                    hideThreadButton={variant === "thread"}
                                    threadCount={message.threadCount}
                                    threadImage={message.threadImage}
                                    threadTimestamp={message.threadTimestamp}
                                />
                            );
                        })}
                    </div>
                ))}
                <div className="h-1" ref={(el) => {
                    if(el) {
                            const observer = new IntersectionObserver(([entry]) => {
                                if(entry.isIntersecting && canLoadMore) {
                                    loadMore();
                                }
                            }, {
                                threshold: 1.0
                            }
                        );
                        observer.observe(el);
                        return () => observer.disconnect();
                    }
                }}/>
                {
                    isLoadingMore && (
                        <div className="text-center my-2 relative">
                            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                <Loader className="size-4 animate-spin"/>
                            </span>
                        </div>
                    )
                }
                {
                    !canLoadMore && (
                        <div>
                            No more messages to load
                        </div>
                    )
                }
                {variant === "channel" && channelName && channelCreationTime && (
                    <ChannelHero name={channelName} creationTime={channelCreationTime}/>
                )}
        </div>
    );
}