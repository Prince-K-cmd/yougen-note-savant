
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
import { Play, Volume2, FastForward } from "lucide-react";

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
          <CardTitle className="flex items-center">
            <Play className="mr-2 h-5 w-5 text-brand-teal" />
            Video Player
          </CardTitle>
          <CardDescription>
            Configure video playback settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoplay" 
                checked={settings.autoplay}
                onCheckedChange={handleAutoplayChange}
              />
              <Label htmlFor="autoplay" className="text-base">Autoplay videos</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="playback-speed" className="flex items-center text-base">
                <FastForward className="mr-2 h-5 w-5" />
                Playback Speed
              </Label>
              <span className="text-sm font-medium text-muted-foreground">
                {settings.defaultPlaybackSpeed}x
              </span>
            </div>
            <Slider
              id="playback-speed"
              value={[settings.defaultPlaybackSpeed]}
              min={0.25}
              max={2}
              step={0.25}
              onValueChange={handlePlaybackSpeedChange}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.25x</span>
              <span>1x</span>
              <span>2x</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="flex items-center text-base">
                <Volume2 className="mr-2 h-5 w-5" />
                Default Volume
              </Label>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(settings.defaultVolume * 100)}%
              </span>
            </div>
            <Slider
              id="volume"
              value={[settings.defaultVolume]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
