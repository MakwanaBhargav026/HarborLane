import * as React from "react";
import { Landmark, AudioWaveform, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const teams = [
  {
    name: "HaborLane Admin",
    logo: Landmark,
    plan: "Manager",
  },
  {
    name: "HaborLane Associate",
    logo: AudioWaveform,
    plan: "Employee",
  },
  {
    name: "HaborLane Cashier",
    logo: Command,
    plan: "Employee",
  },
];

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();

  let activeTeam;
  if (userRole === "admin") {
    activeTeam = teams[0];
  } else if (userRole === "associate") {
    activeTeam = teams[1];
  } else if (userRole === "cashier") {
    activeTeam = teams[2];
  } else {
    activeTeam = { name: "Unknown", logo: Landmark, plan: "Unknown" };
  }

  const handleNavigation = () => {
    if (userRole === "admin") navigate("/admin");
    else navigate("/associate");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleNavigation}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <activeTeam.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
