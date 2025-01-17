import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UseCurrentMemberProps {
    workspaceId: Id<"workspaces">;
}

export const useCurrentMember = ({workspaceId}: UseCurrentMemberProps) => {
    const data = useQuery(api.members.currentMember, {workspaceId});
    const isLoading = data === undefined;
    
    return {data, isLoading};
}