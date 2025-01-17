'use client';
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { WorkspaceSidebar } from "./workspaceSidebar";
import { usePanel } from "@/features/auth/hooks/usePanel";
import { Loader } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceIdLayout = ({children}: WorkspaceIdLayoutProps) => {
    const {parentMessageId, onCloseMessage} = usePanel();
    const showPanel = !!parentMessageId;

    return (
        <div className="h-full">
            <Toolbar/>
            <div className="flex h-[calc(100vh-40px)]">
                <Sidebar/>
                <ResizablePanelGroup direction="horizontal" autoSaveId="ca-workspace-layout">
                    <ResizablePanel defaultSize={11} minSize={11} maxSize={15} className="bg-[#5E2C5F]">
                        <WorkspaceSidebar>

                        </WorkspaceSidebar>
                    </ResizablePanel>
                    <ResizableHandle withHandle >

                    </ResizableHandle>
                    <ResizablePanel defaultSize={11} minSize={11}>
                        {children}
                    </ResizablePanel>
                    {showPanel && (
                        <>
                            <ResizableHandle withHandle/>
                                <ResizablePanel minSize={20} defaultSize={20} maxSize={35}>
                                    {parentMessageId ? (
                                        <Thread messageId={parentMessageId as Id<"messages">} onClose={onCloseMessage}/>
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Loader className="size-5 animate-spin text-muted-foreground"/>
                                        </div>
                                    )}
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default WorkspaceIdLayout;