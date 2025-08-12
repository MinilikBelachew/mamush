
import { Columns2, Palette, PaintBucket, Sidebar as SidebarIcon, Columns3, LayoutDashboardIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Define nav items with icons (use components directly)
const items = [
    { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
  { title: "Drivers", url: "/drivers", icon: Columns2 },
  { title: "Passengers", url: "/passengers", icon: Palette },
  { title: "Assignments", url: "/assignments", icon: PaintBucket },
];

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const isCollapsed = sidebarState === "collapsed";
  const currentPath = location.pathname;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="offcanvas">
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2 text-lg pb-4 font-bold">
              <SidebarIcon size={20} className="text-primary" />
              {!isCollapsed && "RideShare Admin"}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={currentPath.startsWith(item.url)}>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          "flex items-center gap-2 px-2 py-2 rounded transition-colors duration-200 " +
                          (isActive
                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold"
                            : "hover:bg-muted hover:text-primary")
                        }
                        end={item.url === "/"}
                      >
                        <Icon className="mr-2 h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
