import { UserButton } from "@/features/auth/components/user-button";
import { WorkspaceSwitcher } from "./workspaceSwitcher";
import { SideBarButton } from "./sidebarButton";
import { Bell, Home, MessagesSquareIcon, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
    const pathname = usePathname();


    return(
        <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-[4px]">
            <WorkspaceSwitcher/>
            <SideBarButton icon={Home} label="Home" isActive={pathname.includes("/workspace")}/>
            <SideBarButton icon={MessagesSquareIcon} label="DMs"/>
            <SideBarButton icon={Bell} label="Activity"/>
            <SideBarButton icon={MoreHorizontal} label="More"/>
            <div className="flex flex-col items-center justify-center gap-y-1 mt-auto mb-4">
                <UserButton/>
            </div>
        </aside>
    );
};
