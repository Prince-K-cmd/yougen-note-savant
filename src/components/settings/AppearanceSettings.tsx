
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

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const settings = getSettings();

  const handleFontScaleChange = (value: number[]) => {
    const newSettings = {
      ...settings,
      fontScale: value[0],
    };
    saveSettings(newSettings);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="theme">Color Theme</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-scale">Font Size</Label>
              <span className="text-sm text-muted-foreground">
                {(settings.fontScale * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              id="font-scale"
              defaultValue={[settings.fontScale]}
              min={0.8}
              max={1.2}
              step={0.05}
              onValueChange={handleFontScaleChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
