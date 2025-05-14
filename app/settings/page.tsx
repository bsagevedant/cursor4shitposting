'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/use-user';

interface UserSettings {
  display_name: string;
  default_author_name: string;
  default_author_handle: string;
  email_notifications: boolean;
  dark_mode: boolean;
  auto_save_drafts: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>({
    display_name: '',
    default_author_name: '',
    default_author_handle: '',
    email_notifications: true,
    dark_mode: false,
    auto_save_drafts: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setSettings({
            display_name: data.display_name || '',
            default_author_name: data.default_author_name || '',
            default_author_handle: data.default_author_handle || '',
            email_notifications: data.email_notifications ?? true,
            dark_mode: data.dark_mode ?? false,
            auto_save_drafts: data.auto_save_drafts ?? true,
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and default post settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={settings.display_name}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, display_name: e.target.value }))
                    }
                    placeholder="Your display name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="default_author_name">Default Author Name</Label>
                  <Input
                    id="default_author_name"
                    value={settings.default_author_name}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, default_author_name: e.target.value }))
                    }
                    placeholder="Default name for your posts"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="default_author_handle">Default Author Handle</Label>
                  <Input
                    id="default_author_handle"
                    value={settings.default_author_handle}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, default_author_handle: e.target.value }))
                    }
                    placeholder="@yourhandle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your posts' performance
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for better viewing at night
                    </p>
                  </div>
                  <Switch
                    checked={settings.dark_mode}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, dark_mode: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save Drafts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your posts as drafts while writing
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_save_drafts}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, auto_save_drafts: checked }))
                    }
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 