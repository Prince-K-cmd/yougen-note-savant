
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSettings, saveSettings } from "@/utils/storage";
import { toast } from "sonner";
import { Settings as SettingsIcon, Moon, Sun, Laptop, Trash2, Download } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(() => getSettings());
  
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  const handleClearHistory = () => {
    // This is just a placeholder for now
    toast.success("History cleared successfully");
  };
  
  const handleClearCache = () => {
    // This is just a placeholder for now
    toast.success("Cache cleared successfully");
  };
  
  const handleExportData = () => {
    // This is just a placeholder for now
    toast.success("Data exported successfully");
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success("Settings saved");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        
        <Tabs defaultValue="appearance" className="max-w-3xl">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how YouGen Note Savant looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme-light" className="font-medium">Light Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use light theme
                      </p>
                    </div>
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleThemeChange('light')}
                      className="ml-auto"
                    >
                      <Sun className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme-dark" className="font-medium">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use dark theme
                      </p>
                    </div>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleThemeChange('dark')}
                      className="ml-auto"
                    >
                      <Moon className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme-system" className="font-medium">System</Label>
                      <p className="text-sm text-muted-foreground">
                        Match system theme
                      </p>
                    </div>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleThemeChange('system')}
                      className="ml-auto"
                    >
                      <Laptop className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
                <CardDescription>
                  Configure how videos are played and displayed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoplay" className="font-medium">Autoplay</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically play videos when loaded
                    </p>
                  </div>
                  <Switch 
                    id="autoplay"
                    checked={settings.autoplay}
                    onCheckedChange={(checked) => handleSettingChange('autoplay', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mute" className="font-medium">Mute by Default</Label>
                    <p className="text-sm text-muted-foreground">
                      Start videos with sound off
                    </p>
                  </div>
                  <Switch 
                    id="mute"
                    checked={settings.muteByDefault}
                    onCheckedChange={(checked) => handleSettingChange('muteByDefault', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quality" className="font-medium">Default Quality</Label>
                    <p className="text-sm text-muted-foreground">
                      Set preferred video quality
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {["720p", "1080p", "Auto"].map(quality => (
                      <Button 
                        key={quality}
                        variant={settings.defaultQuality === quality ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('defaultQuality', quality)}
                      >
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>
                  Configure download preferences and options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="download-path" className="font-medium">Default Download Path</Label>
                  <Input 
                    id="download-path" 
                    value={settings.downloadPath || "Downloads folder"} 
                    onChange={(e) => handleSettingChange('downloadPath', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Where downloaded videos will be saved
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="download-format" className="font-medium">Default Format</Label>
                    <p className="text-sm text-muted-foreground">
                      Select preferred download format
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {["MP4", "MKV", "MP3"].map(format => (
                      <Button 
                        key={format}
                        variant={settings.downloadFormat === format ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('downloadFormat', format)}
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="download-subtitles" className="font-medium">Download Subtitles</Label>
                    <p className="text-sm text-muted-foreground">
                      Include subtitles with video downloads
                    </p>
                  </div>
                  <Switch 
                    id="download-subtitles"
                    checked={settings.downloadSubtitles}
                    onCheckedChange={(checked) => handleSettingChange('downloadSubtitles', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced options and manage your data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={handleClearHistory}
                  >
                    <div className="flex flex-col items-start">
                      <span>Clear History</span>
                      <span className="text-sm text-muted-foreground">Remove all browsing history</span>
                    </div>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={handleClearCache}
                  >
                    <div className="flex flex-col items-start">
                      <span>Clear Cache</span>
                      <span className="text-sm text-muted-foreground">Delete all cached data</span>
                    </div>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={handleExportData}
                  >
                    <div className="flex flex-col items-start">
                      <span>Export Data</span>
                      <span className="text-sm text-muted-foreground">Download all your app data</span>
                    </div>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Changes to advanced settings may require restarting the application
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
