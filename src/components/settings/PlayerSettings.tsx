
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { getSettings, saveSettings } from "@/utils/storage";

export function PlayerSettings() {
  const [settings, setSettings] = useState(() => {
    const storedSettings = getSettings();
    return {
      ...storedSettings,
      autoplay: storedSettings.autoplay ?? true,
      defaultPlaybackSpeed: storedSettings.defaultPlaybackSpeed ?? 1.0,
      defaultVolume: storedSettings.defaultVolume ?? 1.0,
    };
  });

  const handleAutoplayChange = (checked: boolean) => {
    const newSettings = { ...settings, autoplay: checked };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Autoplay ${checked ? 'enabled' : 'disabled'}`);
  };

  const handlePlaybackSpeedChange = (value: number[]) => {
    const newSettings = { ...settings, defaultPlaybackSpeed: value[0] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleVolumeChange = (value: number[]) => {
    const newSettings = { ...settings, defaultVolume: value[0] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Video Player</CardTitle>
          <CardDescription>
            Configure video playback settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="autoplay" 
              checked={settings.autoplay}
              onCheckedChange={handleAutoplayChange}
            />
            <Label htmlFor="autoplay">Autoplay videos</Label>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="playback-speed">Default Playback Speed</Label>
              <span className="text-sm text-muted-foreground">
                {settings.defaultPlaybackSpeed}x
              </span>
            </div>
            <Slider
              id="playback-speed"
              defaultValue={[settings.defaultPlaybackSpeed]}
              min={0.25}
              max={2}
              step={0.25}
              onValueChange={handlePlaybackSpeedChange}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume">Default Volume</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(settings.defaultVolume * 100)}%
              </span>
            </div>
            <Slider
              id="volume"
              defaultValue={[settings.defaultVolume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
