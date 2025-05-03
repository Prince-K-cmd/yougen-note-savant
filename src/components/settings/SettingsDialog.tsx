
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
import { Settings, Bell, Palette, Play } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] md:max-w-[750px] h-[80vh] max-h-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto pr-2 -mr-2" style={{ maxHeight: "calc(80vh - 120px)" }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4">
              <TabsTrigger value="general" className="flex items-center justify-center">
                <Settings className="mr-2 h-4 w-4 hidden sm:inline" />
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center justify-center">
                <Palette className="mr-2 h-4 w-4 hidden sm:inline" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="player" className="flex items-center justify-center">
                <Play className="mr-2 h-4 w-4 hidden sm:inline" />
                Player
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center">
                <Bell className="mr-2 h-4 w-4 hidden sm:inline" />
                Notifications
              </TabsTrigger>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
