'use client';

import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { UseGetIndividualChannel } from "@/features/channels/api/useGetIndividualChannel";
import { AlertTriangleIcon, Loader } from "lucide-react";
import {Header} from "./header";
import { ChatInput } from "./chatInput";
import { useGetMessages } from "@/features/messages/api/useGetMessages";
import { MessageList } from "@/components/messageList";

const ChannelIdPage = () => {
    const channelId = useChannelId();
    const {data: channel, isLoading: channelLoading} = UseGetIndividualChannel({channelId});
    const {results, status, loadMore} = useGetMessages({channelId});

    if(channelLoading || status === "LoadingFirstPage") {
        return(
            <div className="h-full flex-1 flex items-center justify-center">
                <Loader className="size-5 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if(!channel) {
        return(
            <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
                <AlertTriangleIcon className="size-5 text-red-500"/>
                <span className="text-sm text-muted-foreground">
                    Channel not found
                </span>
            </div>
        );
    }

    return(
        <div className="flex flex-col h-full">
            <Header channelName={channel.name}></Header>
            <MessageList 
                channelName={channel.name} 
                channelCreationTime={channel._creationTime} 
                data={results} 
                loadMore={loadMore} 
                isLoadingMore={status === "LoadingMore"} 
                canLoadMore={status === "CanLoadMore"}
            />
            <ChatInput placeholder={`Message # ${channel.name}`}/>
        </div>
    );
}

export default ChannelIdPage;