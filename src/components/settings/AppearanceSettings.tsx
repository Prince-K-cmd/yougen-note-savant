
import { useTheme } from "@/hooks/useTheme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getSettings, saveSettings } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Type } from "lucide-react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [fontScale, setFontScale] = useState(() => getSettings().fontScale || 1.0);

  useEffect(() => {
    // Apply font scale to html element
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  const handleFontScaleChange = (value: number[]) => {
    const newFontScale = value[0];
    setFontScale(newFontScale);
    
    const settings = getSettings();
    const newSettings = {
      ...settings,
      fontScale: newFontScale,
    };
    saveSettings(newSettings);
    
    // Apply font scale to html element
    document.documentElement.style.fontSize = `${newFontScale * 100}%`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="mr-2 h-5 w-5 text-yellow-500" />
            Theme
          </CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="theme" className="text-base">Color Theme</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light" className="flex items-center">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4 text-blue-500" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center">
                    <Monitor className="mr-2 h-4 w-4 text-gray-500" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-scale" className="flex items-center text-base">
                <Type className="mr-2 h-5 w-5" />
                Font Size
              </Label>
              <span className="text-sm font-medium text-muted-foreground">
                {(fontScale * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              id="font-scale"
              value={[fontScale]}
              min={0.8}
              max={1.4}
              step={0.05}
              onValueChange={handleFontScaleChange}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Small</span>
              <span>Default</span>
              <span>Large</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
