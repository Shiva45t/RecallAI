import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, signInWithGoogle, user, isLoading } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      addToast('Welcome back to RecallAI!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const onSignup = async (data: SignupForm) => {
    try {
      await signUp(data.email, data.password, data.username);
      addToast('Account created successfully! Welcome to RecallAI.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Signup failed. Please try again.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      addToast(err.message || 'Google Auth failed.', 'error');
    }
  };

  const toggleTab = () => {
    setIsLogin(!isLogin);
    resetLogin();
    resetSignup();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-8 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/30 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl w-full space-y-4 bg-white dark:bg-darkSurface p-6 py-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-10"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-8 h-8" />
            <span className="text-2xl font-extrabold tracking-tight">Recall<span className="text-violet-600 dark:text-violet-400">AI</span></span>
          </div>
          <p className="mt-0.5 text-xs text-gray-555 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI-Powered Spaced Repetition Learning
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => !isLogin && toggleTab()}
            className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
              isLogin
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-450 dark:text-gray-500 hover:text-gray-650'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => isLogin && toggleTab()}
            className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
              !isLogin
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-450 dark:text-gray-500 hover:text-gray-650'
            }`}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                className="!py-1.5"
                error={loginErrors.email?.message}
                {...registerLogin('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="!py-1.5"
                error={loginErrors.password?.message}
                {...registerLogin('password')}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-1 py-2 text-sm"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                className="!py-1.5"
                error={signupErrors.username?.message}
                {...registerSignup('username')}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                className="!py-1.5"
                error={signupErrors.email?.message}
                {...registerSignup('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="!py-1.5"
                error={signupErrors.password?.message}
                {...registerSignup('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                className="!py-1.5"
                error={signupErrors.confirmPassword?.message}
                {...registerSignup('confirmPassword')}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-1 py-2 text-sm"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-150 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-darkSurface px-2 text-gray-500 dark:text-gray-400 font-bold">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-2 text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </motion.div>
    </div>
  );
};
