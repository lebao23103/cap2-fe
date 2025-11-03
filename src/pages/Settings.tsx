import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Palette, 
  BookOpen, 
  Shield, 
  Bell,
  Save,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Settings {
  // Account
  name: string;
  email: string;
  bio: string;
  // Preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  // Reading Settings
  fontSize: string;
  readingMode: 'paginated' | 'scroll';
  autoBookmark: boolean;
  // Privacy
  dataSharing: boolean;
  analyticsConsent: boolean;
  profileVisibility: 'public' | 'private';
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnComments: boolean;
  notifyOnFollows: boolean;
  notifyOnRecommendations: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('knowly-settings');
    return saved ? JSON.parse(saved) : {
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Passionate reader and lifelong learner.',
      theme: 'auto',
      language: 'en',
      fontSize: 'medium',
      readingMode: 'paginated',
      autoBookmark: true,
      dataSharing: false,
      analyticsConsent: true,
      profileVisibility: 'public',
      emailNotifications: true,
      pushNotifications: false,
      inAppNotifications: true,
      notifyOnComments: true,
      notifyOnFollows: true,
      notifyOnRecommendations: false,
    };
  });

  const [tempSettings, setTempSettings] = useState<Settings>(settings);

  const handleChange = (key: keyof Settings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('knowly-settings', JSON.stringify(tempSettings));
    setSettings(tempSettings);
    setHasChanges(false);
    setLoading(false);
    
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true);
    }
  };

  const handleDiscard = () => {
    setTempSettings(settings);
    setHasChanges(false);
    setShowDiscardDialog(false);
    
    toast({
      title: 'Changes discarded',
      description: 'Your changes have been discarded.',
      variant: 'destructive',
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Save/Cancel Actions */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between"
            >
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Settings Tabs */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-white/20">
            <Tabs defaultValue="account" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
                  <TabsTrigger value="account" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Preferences</span>
                  </TabsTrigger>
                  <TabsTrigger value="reading" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Reading</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Account Settings */}
                <TabsContent value="account" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          value={tempSettings.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={tempSettings.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={tempSettings.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Password</h3>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </TabsContent>

                {/* Preferences */}
                <TabsContent value="preferences" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={tempSettings.theme}
                          onValueChange={(value) => handleChange('theme', value)}
                        >
                          <SelectTrigger id="theme">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto (System)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose your preferred color theme
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Language</h3>
                    <div className="space-y-2">
                      <Label htmlFor="language">Display Language</Label>
                      <Select
                        value={tempSettings.language}
                        onValueChange={(value) => handleChange('language', value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Reading Settings */}
                <TabsContent value="reading" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reading Experience</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Select
                          value={tempSettings.fontSize}
                          onValueChange={(value) => handleChange('fontSize', value)}
                        >
                          <SelectTrigger id="fontSize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="extra-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="readingMode">Reading Mode</Label>
                        <Select
                          value={tempSettings.readingMode}
                          onValueChange={(value) => handleChange('readingMode', value as 'paginated' | 'scroll')}
                        >
                          <SelectTrigger id="readingMode">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paginated">Paginated</SelectItem>
                            <SelectItem value="scroll">Continuous Scroll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="autoBookmark">Auto-bookmark</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically save your reading progress
                          </p>
                        </div>
                        <Switch
                          id="autoBookmark"
                          checked={tempSettings.autoBookmark}
                          onCheckedChange={(checked) => handleChange('autoBookmark', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Settings */}
                <TabsContent value="privacy" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profileVisibility">Profile Visibility</Label>
                        <Select
                          value={tempSettings.profileVisibility}
                          onValueChange={(value) => handleChange('profileVisibility', value as 'public' | 'private')}
                        >
                          <SelectTrigger id="profileVisibility">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Control who can view your profile
                        </p>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="dataSharing">Data Sharing</Label>
                          <p className="text-xs text-muted-foreground">
                            Share reading data with partners
                          </p>
                        </div>
                        <Switch
                          id="dataSharing"
                          checked={tempSettings.dataSharing}
                          onCheckedChange={(checked) => handleChange('dataSharing', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="analyticsConsent">Analytics</Label>
                          <p className="text-xs text-muted-foreground">
                            Help us improve by sharing usage data
                          </p>
                        </div>
                        <Switch
                          id="analyticsConsent"
                          checked={tempSettings.analyticsConsent}
                          onCheckedChange={(checked) => handleChange('analyticsConsent', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Request a copy of your data or request deletion
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline">Download My Data</Button>
                      <Button variant="outline">Request Data Deletion</Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={tempSettings.emailNotifications}
                          onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={tempSettings.pushNotifications}
                          onCheckedChange={(checked) => handleChange('pushNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Show notifications within the app
                          </p>
                        </div>
                        <Switch
                          id="inAppNotifications"
                          checked={tempSettings.inAppNotifications}
                          onCheckedChange={(checked) => handleChange('inAppNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnComments">Comments</Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when someone comments on your notes
                          </p>
                        </div>
                        <Switch
                          id="notifyOnComments"
                          checked={tempSettings.notifyOnComments}
                          onCheckedChange={(checked) => handleChange('notifyOnComments', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnFollows">Follows</Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when someone follows you
                          </p>
                        </div>
                        <Switch
                          id="notifyOnFollows"
                          checked={tempSettings.notifyOnFollows}
                          onCheckedChange={(checked) => handleChange('notifyOnFollows', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifyOnRecommendations">Recommendations</Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when you receive book recommendations
                          </p>
                        </div>
                        <Switch
                          id="notifyOnRecommendations"
                          checked={tempSettings.notifyOnRecommendations}
                          onCheckedChange={(checked) => handleChange('notifyOnRecommendations', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Discard Confirmation Dialog */}
      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscard}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </div>
  );
}
