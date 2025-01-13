import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetIndividualChannelProps {
    channelId: Id<"channels">;
}

export const UseGetIndividualChannel = ({channelId}: UseGetIndividualChannelProps) => {
    const data = useQuery(api.channels.getById, {channelId});
    const isLoading = data === undefined;
    return {data, isLoading};
};