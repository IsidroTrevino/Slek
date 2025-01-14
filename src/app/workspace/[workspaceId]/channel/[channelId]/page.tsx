'use client';

import { useChannelId } from "@/features/auth/hooks/useChannelId";
import { UseGetIndividualChannel } from "@/features/channels/api/useGetIndividualChannel";
import { AlertTriangleIcon, Loader } from "lucide-react";
import {Header} from "./header";
import { ChatInput } from "./chatInput";

const ChannelIdPage = () => {
    const channelId = useChannelId();
    const {data: channel, isLoading: channelLoading} = UseGetIndividualChannel({channelId});

    if(channelLoading) {
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
            <div className="flex-1"/>
            <ChatInput placeholder={`Message # ${channel.name}`}/>
        </div>
    );
}

export default ChannelIdPage;