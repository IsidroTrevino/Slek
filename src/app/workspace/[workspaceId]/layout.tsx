'use client';
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { WorkspaceSidebar } from "./workspaceSidebar";
interface WorkspaceIdLayoutProps {
    children: React.ReactNode;
}

const WorkspaceIdLayout = ({children}: WorkspaceIdLayoutProps) => {
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
                </ResizablePanelGroup>
            </div>
        </div>
    );
};

export default WorkspaceIdLayout;