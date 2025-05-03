
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
import { Trash, Download, Check } from "lucide-react";
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

export function GeneralSettings() {
  const [settings, setSettings] = useState(getSettings());
  const [isClearingData, setIsClearingData] = useState(false);

  const handleQualityChange = (value: string) => {
    const newSettings = { ...settings, defaultDownloadQuality: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success("Default quality updated");
  };

  const handleAutosaveToggle = (checked: boolean) => {
    const newSettings = { ...settings, autosaveNotes: checked };
    setSettings(newSettings);
    saveSettings(newSettings);
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
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Configure general application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="quality">Default Download Quality</Label>
            <Select 
              value={settings.defaultDownloadQuality} 
              onValueChange={handleQualityChange}
            >
              <SelectTrigger id="quality" className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="autosave-notes" 
              checked={settings.autosaveNotes || false}
              onCheckedChange={handleAutosaveToggle}
            />
            <Label htmlFor="autosave-notes">Autosave notes</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your data or reset the application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={exportAllData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={clearAllData}
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
        </CardContent>
      </Card>
    </div>
  );
}
