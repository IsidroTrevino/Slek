'use client';

import { useWorkspaceId } from "@/features/auth/hooks/useWorkspaceId";
import { useGetWorkspace } from "@/features/workspaces/api/useGetWorkspace";

const WorkspaceIdPage = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetWorkspace({ id: workspaceId });

    return (
        <div>
            <h1>Data: {JSON.stringify(data)}</h1>
        </div>
    );
};


export default WorkspaceIdPage;