
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, UserSettings } from '../types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, UserRound, Settings as SettingsIcon, Loader2, Camera } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import browserDb from '../services/browserDb';

const DEFAULT_AVATAR = '/lovable-uploads/337fa0f8-332c-4d9b-96ab-cbd5e91e2b56.png';

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: true,
    language: 'en',
    status: 'available',
    displayName: '',
    bio: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Load user settings from local storage if they exist
    if (user) {
      // Set default settings if user doesn't have any
      const userSettings = user.settings || {
        theme: 'system',
        notifications: true,
        language: 'en',
        status: 'available',
        displayName: user.username,
        bio: ''
      };
      setSettings(userSettings);
      setAvatarUrl(user.avatar || DEFAULT_AVATAR);
    }
  }, [user]);
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      if (user) {
        // Update user object with new settings
        const updatedUser = { ...user, settings, avatar: avatarUrl };
        
        // Save to database
        const savedUser = await browserDb.saveUser(updatedUser);
        
        if (savedUser) {
          // Also update the local state via context
          updateUser(updatedUser);
          
          toast({
            title: "Settings saved",
            description: "Your profile settings have been updated successfully.",
          });
        } else {
          throw new Error("Failed to save settings to database");
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive"
      });
      
      // Fall back to localStorage if database fails
      if (user) {
        const updatedUser = { ...user, settings, avatar: avatarUrl };
        updateUser(updatedUser);
        
        toast({
          title: "Settings saved locally",
          description: "Your settings were saved to local storage as a fallback.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarClick = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check if the file size is less than 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create a FileReader to read the file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        toast({
          title: "Avatar updated",
          description: "Don't forget to save your changes",
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleResetAvatar = () => {
    setAvatarUrl(DEFAULT_AVATAR);
    toast({
      title: "Avatar reset",
      description: "Your avatar has been reset to the default. Don't forget to save your changes.",
    });
  };
  
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/chat')} 
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information visible to other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl} alt={settings.displayName || user?.username} />
                      <AvatarFallback>
                        {(settings.displayName || user?.username)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white h-8 w-8" />
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAvatarClick}
                    >
                      Change Avatar
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetAvatar}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Your display name" 
                      value={settings.displayName || ''}
                      onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Write a short bio about yourself" 
                      rows={3}
                      value={settings.bio || ''}
                      onChange={(e) => setSettings({...settings, bio: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={settings.status}
                      onValueChange={(value) => setSettings({...settings, status: value as 'available' | 'away' | 'busy' | 'offline'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="offline">Appear Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize how the application works for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you get new messages
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings.theme}
                    onValueChange={(value) => setSettings({...settings, theme: value as 'light' | 'dark' | 'system'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language}
                    onValueChange={(value) => setSettings({...settings, language: value as 'en' | 'es' | 'fr' | 'de'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          className="flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
