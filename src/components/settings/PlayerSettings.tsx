
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getSettings, saveSettings } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Play, Volume2, FastForward, Subtitles } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PlayerSettings() {
  const [settings, setSettings] = useState(() => getSettings());

  const handlePlaybackSpeedChange = (value: string) => {
    const speed = parseFloat(value);
    const newSettings = {
      ...settings,
      defaultPlaybackSpeed: speed,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Default playback speed set to ${speed}x`);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    const newSettings = {
      ...settings,
      defaultVolume: newVolume,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAutoplayChange = (checked: boolean) => {
    const newSettings = {
      ...settings,
      autoplay: checked,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Autoplay ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleSubtitlesChange = (checked: boolean) => {
    const newSettings = {
      ...settings,
      enableSubtitles: checked,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Subtitles ${checked ? 'enabled' : 'disabled'} by default`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="mr-2 h-5 w-5 text-brand-purple-light" />
            Playback
          </CardTitle>
          <CardDescription>
            Configure video playback preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playback-speed" className="flex items-center text-base">
              <FastForward className="mr-2 h-5 w-5" />
              Default Playback Speed
            </Label>
            <Select 
              value={String(settings.defaultPlaybackSpeed || "1")} 
              onValueChange={handlePlaybackSpeedChange}
            >
              <SelectTrigger id="playback-speed" className="w-full">
                <SelectValue placeholder="Select playback speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">Normal (1x)</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="flex items-center text-base">
                <Volume2 className="mr-2 h-5 w-5" />
                Default Volume
              </Label>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((settings.defaultVolume || 1) * 100)}%
              </span>
            </div>
            <Slider
              id="volume"
              value={[settings.defaultVolume || 1]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={handleVolumeChange}
              className="py-2"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoplay" 
                checked={settings.autoplay || false}
                onCheckedChange={handleAutoplayChange}
              />
              <Label htmlFor="autoplay" className="flex items-center text-base">
                <Play className="mr-2 h-5 w-5" />
                Autoplay videos
              </Label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="subtitles" 
                checked={settings.enableSubtitles || false}
                onCheckedChange={handleSubtitlesChange}
              />
              <Label htmlFor="subtitles" className="flex items-center text-base">
                <Subtitles className="mr-2 h-5 w-5" />
                Enable subtitles by default
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
