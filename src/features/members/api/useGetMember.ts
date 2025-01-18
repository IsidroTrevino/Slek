import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface useGetMembersrProps {
    id: Id<"members">;
}

export const useGetMember = ({id}: useGetMembersrProps) => {
    const data = useQuery(api.members.getById, {id});
    const isLoading = data === undefined;
    
    return {data, isLoading};
}