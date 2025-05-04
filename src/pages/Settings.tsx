
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, UserSettings } from '../types';
import { Avatar } from '../components/ui/avatar';
import { AvatarImage, AvatarFallback } from '../components/ui/avatar';
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
  CardFooter,
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
import { ArrowLeft, Save, UserRound, Settings as SettingsIcon } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: true,
    language: 'en',
    status: 'available',
    displayName: '',
    bio: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
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
      setAvatarUrl(user.avatar);
    }
  }, [user]);
  
  const handleSaveSettings = () => {
    if (user) {
      // Get stored users if any
      const storedUsers = localStorage.getItem('users');
      let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find the current user or add it to the array
      const updatedUser = { ...user, settings, avatar: avatarUrl };
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Also update the current user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated successfully.",
      });
    }
  };
  
  const handleAvatarChange = () => {
    // In a real implementation, this would open a file picker
    // For now, we'll just generate a random avatar
    const randomSeed = Math.floor(Math.random() * 100);
    setAvatarUrl(`https://i.pravatar.cc/150?img=${randomSeed}`);
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
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={settings.displayName || user.username} />
                    <AvatarFallback>
                      {(settings.displayName || user.username)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" onClick={handleAvatarChange}>
                    Change Avatar
                  </Button>
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
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
