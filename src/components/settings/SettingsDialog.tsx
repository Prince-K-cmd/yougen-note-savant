
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotificationSettings } from "./NotificationSettings";
import { PlayerSettings } from "./PlayerSettings";
import { GeneralSettings } from "./GeneralSettings";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent value="player" className="space-y-4">
            <PlayerSettings />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
