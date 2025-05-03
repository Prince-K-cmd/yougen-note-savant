
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getSettings, saveSettings } from "@/utils/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Settings() {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [settings, setSettings] = useState(getSettings());
  
  const handleSave = () => {
    saveSettings(settings);
    
    // Update theme if it changed
    if (settings.theme) {
      setTheme(settings.theme);
    }
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully."
    });
  };

  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={settings.theme === 'light' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-auto"
                    onClick={() => updateSettings('theme', 'light')}
                  >
                    <Sun className="h-8 w-8 mb-2" />
                    <span>Light</span>
                  </Button>
                  <Button 
                    variant={settings.theme === 'dark' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-auto"
                    onClick={() => updateSettings('theme', 'dark')}
                  >
                    <Moon className="h-8 w-8 mb-2" />
                    <span>Dark</span>
                  </Button>
                  <Button 
                    variant={settings.theme === 'system' ? "default" : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-auto"
                    onClick={() => updateSettings('theme', 'system')}
                  >
                    <Monitor className="h-8 w-8 mb-2" />
                    <span>System</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoplay" 
                    checked={settings.autoplay} 
                    onCheckedChange={(checked) => updateSettings('autoplay', checked)}
                  />
                  <Label htmlFor="autoplay">Autoplay videos when page loads</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="mute" 
                    checked={settings.muteByDefault} 
                    onCheckedChange={(checked) => updateSettings('muteByDefault', checked)}
                  />
                  <Label htmlFor="mute">Mute videos by default</Label>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="quality">Default Quality</Label>
                  <Select 
                    value={settings.defaultQuality}
                    onValueChange={(value) => updateSettings('defaultQuality', value)}
                  >
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Default Format</Label>
                  <Select 
                    value={settings.downloadFormat}
                    onValueChange={(value) => updateSettings('downloadFormat', value)}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MP4">MP4</SelectItem>
                      <SelectItem value="MP3">MP3 (Audio Only)</SelectItem>
                      <SelectItem value="WAV">WAV (Audio Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="subtitles" 
                    checked={settings.downloadSubtitles} 
                    onCheckedChange={(checked) => updateSettings('downloadSubtitles', checked)}
                  />
                  <Label htmlFor="subtitles">Download subtitles when available</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="path">Default Download Path</Label>
                  <Input 
                    id="path" 
                    value={settings.downloadPath} 
                    onChange={(e) => updateSettings('downloadPath', e.target.value)}
                    placeholder="Downloads folder" 
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use browser's default download location
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="hotkeys" 
                    checked={settings.enableHotkeys} 
                    onCheckedChange={(checked) => updateSettings('enableHotkeys', checked)}
                  />
                  <Label htmlFor="hotkeys">Enable keyboard shortcuts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications" 
                    checked={settings.enableNotifications} 
                    onCheckedChange={(checked) => updateSettings('enableNotifications', checked)}
                  />
                  <Label htmlFor="notifications">Enable browser notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </main>
    </div>
  );
}
