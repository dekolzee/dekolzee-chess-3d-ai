import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Generate reset link
        const resetLink = `${window.location.origin}/auth?reset=true`;
        
        // Send reset email via edge function
        const { error: fnError } = await supabase.functions.invoke('send-password-reset', {
          body: { 
            email,
            resetLink
          }
        });
        
        if (fnError) throw fnError;
        
        // Also trigger Supabase password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        
        toast.success("Password reset email sent! Check your inbox.");
        setIsForgotPassword(false);
      } else if (isLogin) {
        const loginEmail = username.includes('@') ? username : `${username}@chessapp.com`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        
        if (error) throw error;
        
        // Verify profile exists
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user.id)
            .single();
            
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            await supabase.from('profiles').insert({
              id: data.user.id,
              username: username,
            });
          }
        }
        
        toast.success("Logged in successfully!");
        navigate("/lobby");
      } else {
        const userEmail = `${username}@chessapp.com`;
        const { data, error } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        if (data.user) {
          toast.success("Account created! Logging you in...");
          // Auto login after signup
          navigate("/lobby");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md glass-panel">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl glow-text">Dekolzee Chess</CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Reset your password"
                : isLogin
                ? "Welcome back!"
                : "Create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={isLogin ? "Your username" : "Choose a username"}
                  />
                </div>
              )}
              {isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              )}
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full game-button" disabled={loading}>
                {loading
                  ? "Loading..."
                  : isForgotPassword
                  ? "Send Reset Email"
                  : isLogin
                  ? "Log In"
                  : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              {!isForgotPassword && (
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
              )}
              {isLogin && !isForgotPassword && (
                <button
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline block w-full"
                >
                  Forgot password?
                </button>
              )}
              {isForgotPassword && (
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-primary hover:underline block w-full"
                >
                  Back to login
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;