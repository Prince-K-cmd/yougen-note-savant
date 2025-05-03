
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Download, Check, Settings, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSettings, saveSettings } from "@/utils/storage";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import the type but rename it to avoid conflicts
import type { Settings as SettingsType } from "@/utils/storage";

export function GeneralSettings() {
  const [settings, setSettings] = useState<SettingsType>(getSettings());
  const [isClearingData, setIsClearingData] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleQualityChange = (value: 'low' | 'medium' | 'high') => {
    const newSettings = { ...settings, defaultDownloadQuality: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success("Default quality updated");
  };

  const handleAutosaveToggle = (checked: boolean) => {
    const newSettings = { ...settings, autosaveNotes: checked };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Notes autosave ${checked ? 'enabled' : 'disabled'}`);
  };

  const clearAllData = () => {
    setIsClearingData(true);
    setTimeout(() => {
      localStorage.clear();
      toast.success("All data cleared. Refreshing page...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 500);
  };

  const exportAllData = () => {
    const data = {
      settings: getSettings(),
      videos: localStorage.getItem("yougen_videos"),
      playlists: localStorage.getItem("yougen_playlists"),
      chats: localStorage.getItem("yougen_chats"),
      notes: localStorage.getItem("yougen_notes"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yougen-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-brand-purple-light" />
            Preferences
          </CardTitle>
          <CardDescription>
            Configure general application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="quality" className="text-base">Default Download Quality</Label>
            <Select 
              value={settings.defaultDownloadQuality} 
              onValueChange={(value: 'low' | 'medium' | 'high') => handleQualityChange(value)}
            >
              <SelectTrigger id="quality" className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (360p)</SelectItem>
                <SelectItem value="medium">Medium (720p)</SelectItem>
                <SelectItem value="high">High (1080p)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autosave-notes" 
                checked={settings.autosaveNotes || false}
                onCheckedChange={handleAutosaveToggle}
              />
              <Label htmlFor="autosave-notes" className="flex items-center text-base">
                <Save className="mr-2 h-5 w-5" />
                Autosave notes
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash className="mr-2 h-5 w-5 text-destructive" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your data or reset the application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={exportAllData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center"
                disabled={isClearingData}
              >
                {isClearingData ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Clear All Data
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action will delete all your saved data including videos, notes, and preferences. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  clearAllData();
                  setShowConfirmDialog(false);
                }}>
                  Yes, clear all data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
