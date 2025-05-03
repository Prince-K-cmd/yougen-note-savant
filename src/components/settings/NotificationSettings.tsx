
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
import { getSettings, saveSettings } from "@/utils/storage";
import { Bell, FileText, CheckCheck, Save } from "lucide-react";

export function NotificationSettings() {
  const [settings, setSettings] = useState(() => {
    const storedSettings = getSettings();
    return {
      ...storedSettings,
      enableNotifications: storedSettings.enableNotifications ?? true,
      notifyNewSummaries: storedSettings.notifyNewSummaries ?? true,
      notifyTranscriptReady: storedSettings.notifyTranscriptReady ?? true,
      notifyNotesSaved: storedSettings.notifyNotesSaved ?? false,
    };
  });

  const updateNotificationSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(`Notification preference updated`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-brand-purple" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="enable-notifications" 
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => 
                  updateNotificationSetting('enableNotifications', checked)
                }
              />
              <Label htmlFor="enable-notifications" className="text-base">Enable notifications</Label>
            </div>
          </div>
          
          <div className="pl-6 space-y-4 border-l-2 border-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notify-summaries" 
                  checked={settings.notifyNewSummaries}
                  disabled={!settings.enableNotifications}
                  onCheckedChange={(checked) => 
                    updateNotificationSetting('notifyNewSummaries', checked)
                  }
                />
                <Label 
                  htmlFor="notify-summaries" 
                  className={`flex items-center ${!settings.enableNotifications ? "text-muted-foreground" : ""}`}
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  New summaries available
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notify-transcript" 
                  checked={settings.notifyTranscriptReady}
                  disabled={!settings.enableNotifications}
                  onCheckedChange={(checked) => 
                    updateNotificationSetting('notifyTranscriptReady', checked)
                  }
                />
                <Label 
                  htmlFor="notify-transcript" 
                  className={`flex items-center ${!settings.enableNotifications ? "text-muted-foreground" : ""}`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Transcript processing complete
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="notify-notes" 
                  checked={settings.notifyNotesSaved}
                  disabled={!settings.enableNotifications}
                  onCheckedChange={(checked) => 
                    updateNotificationSetting('notifyNotesSaved', checked)
                  }
                />
                <Label 
                  htmlFor="notify-notes" 
                  className={`flex items-center ${!settings.enableNotifications ? "text-muted-foreground" : ""}`}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Notes saved
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
