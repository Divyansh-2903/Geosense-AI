import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitch }: AuthModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#020d05]/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#041407]/90 p-8 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="font-display-lg font-bold text-2xl text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-white/60 text-sm mt-1">
                Login to see your farm fields, weather, and crop health advice
              </p>
            </div>

            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@farm.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#cff068] transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#cff068] transition-colors text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 bg-[#cff068] hover:bg-[#b8d94a] disabled:opacity-55 disabled:cursor-not-allowed text-[#03260e] font-semibold rounded-2xl transition-all shadow-[0_4px_20px_rgba(207,240,104,0.15)] hover:shadow-[0_4px_25px_rgba(207,240,104,0.3)] mt-6 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  'Login to Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs text-white/40">
              Don't have an account?{' '}
              <button
                onClick={onSwitch}
                className="text-[#cff068] hover:underline font-semibold"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SignupModal({ isOpen, onClose, onSwitch }: AuthModalProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#020d05]/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#041407]/90 p-8 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="font-display-lg font-bold text-2xl text-white tracking-tight">
                Create Farm Account
              </h2>
              <p className="text-white/60 text-sm mt-1">
                Start tracking your crop health and water needs today
              </p>
            </div>

            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#cff068] transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@farm.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#cff068] transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-[#cff068] transition-colors text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 bg-[#cff068] hover:bg-[#b8d94a] disabled:opacity-55 disabled:cursor-not-allowed text-[#03260e] font-semibold rounded-2xl transition-all shadow-[0_4px_20px_rgba(207,240,104,0.15)] hover:shadow-[0_4px_25px_rgba(207,240,104,0.3)] mt-6 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs text-white/40">
              Already have an account?{' '}
              <button
                onClick={onSwitch}
                className="text-[#cff068] hover:underline font-semibold"
              >
                Login
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
