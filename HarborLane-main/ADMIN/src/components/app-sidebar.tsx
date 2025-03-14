import * as React from "react";
import {
  BookOpen,
  Frame,
  Map,
  PieChart,
  Settings2,
  ShoppingBag,
  Tag,
  UserRoundCog,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: localStorage.getItem("userName") || "User",
    email: localStorage.getItem("userEmail") || "user@example.com",
    avatar: "/avatars/default.jpg", // Default avatar
  };

  const data = {
    user,
    navMain: [
      {
        title: "Customers",
        url: "#",
        icon: Users,
        isActive: true,
        items: [
          {
            title: "QR-Generator",
            url: "/admin/qrcode-generator",
          },
          {
            title: "Verify Cart",
            url: "/admin/verify-carts",
          },
          {
            title: "Payments",
            url: "/admin/payments",
          },
        ],
      },
      {
        title: "Product",
        url: "#",
        icon: ShoppingBag,
        items: [
          {
            title: "Product List",
            url: "/admin/products",
          },
          {
            title: "Categories",
            url: "/admin/categories",
          },
        ],
      },
      {
        title: "Sales",
        url: "#",
        icon: Tag,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Employees",
        url: "#",
        icon: UserRoundCog,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    // projects: [
    //   {
    //     name: "Design Engineering",
    //     url: "#",
    //     icon: Frame,
    //   },
    //   {
    //     name: "Sales & Marketing",
    //     url: "#",
    //     icon: PieChart,
    //   },
    //   {
    //     name: "Travel",
    //     url: "#",
    //     icon: Map,
    //   },
    // ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
