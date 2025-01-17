import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMessageProps {
    messageId: Id<"messages">;
}

export const useGetMessage = ({messageId}: useGetMessageProps) => {
    const data = useQuery(api.messages.getById, {messageId});
    const isLoading = data === undefined;
    return {data, isLoading};
};