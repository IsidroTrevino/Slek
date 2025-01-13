'use client';

import { CreateWorkspaceModal } from "@/features/workspaces/components/createWorkspaceModal";
import { CreateChannelModal } from "@/features/channels/components/createChannelModal";
import { useEffect, useState } from "react";

export const Modals = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }
    
    return (
        <>
            <CreateWorkspaceModal/>
            <CreateChannelModal/>
        </>
    );
};