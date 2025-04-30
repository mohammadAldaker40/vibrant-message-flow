
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister }) => {
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    try {
      onLogin(loginUsername, loginPassword);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('Please fill in all fields');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    try {
      onRegister(registerUsername, registerEmail, registerPassword);
      setRegistrationSubmitted(true);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Registration failed');
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login">
          <CardHeader>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
                >
                  <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                </svg>
                <h1 className="text-2xl font-bold text-primary">ModernChat</h1>
              </div>
            </div>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      value={loginUsername}
                      onChange={e => setLoginUsername(e.target.value)}
                      placeholder="Enter your username" 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Enter your password" 
                      required 
                    />
                  </div>
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>Admin credentials: username: <strong>admin</strong>, password: <strong>admin</strong></p>
                  </div>
                  <Button type="submit" className="w-full">Log In</Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              {registrationSubmitted ? (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertDescription className="text-center py-4">
                    <h3 className="font-bold text-lg mb-2">Registration Request Submitted</h3>
                    <p>Your request has been sent to the administrator for approval.</p>
                    <p className="mt-2">You will be able to log in once your request has been approved.</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        value={registerUsername}
                        onChange={e => setRegisterUsername(e.target.value)}
                        placeholder="Choose a username" 
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        value={registerEmail}
                        onChange={e => setRegisterEmail(e.target.value)}
                        placeholder="Enter your email" 
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="Choose a password" 
                        required 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        value={registerConfirmPassword}
                        onChange={e => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Confirm your password" 
                        required 
                      />
                    </div>
                    {registerError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {registerError}
                        </AlertDescription>
                      </Alert>
                    )}
                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                      <AlertDescription>
                        Registration requires administrator approval.
                      </AlertDescription>
                    </Alert>
                    <Button type="submit" className="w-full">Register</Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginForm;
