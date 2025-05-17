import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewTabsProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <Tabs value={activeView} onValueChange={setActiveView} className="w-full mt-3">
      <TabsList className="grid w-full md:w-96 grid-cols-3">
        <TabsTrigger value="all">All Products</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive">Inactive</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
