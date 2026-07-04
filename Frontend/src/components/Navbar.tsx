import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, ArrowRight, LogOut, User as UserIcon, Sprout } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { LoginModal, SignupModal } from "./auth/AuthModals"
import LanguageSelector from "./LanguageSelector"

interface NavbarProps {
  onScrollTo: (elementId: string) => void;
  onNavigateToDashboard: () => void;
}

export default function Navbar({ onScrollTo, onNavigateToDashboard }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Checklist", id: "about" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ]

  const switchModals = () => {
    if (isLoginOpen) {
      setIsLoginOpen(false);
      setIsSignupOpen(true);
    } else {
      setIsSignupOpen(false);
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="fixed top-6 left-0 w-full flex justify-center px-4 z-50">
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 backdrop-blur-xl border border-white/8 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] w-full max-w-5xl relative z-10 transition-all duration-300">
        <div className="flex items-center">
          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="flex items-center gap-2 group"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
              <Sprout className="w-4.5 h-4.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
            <span className="font-headline-sm font-bold tracking-tight text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400">
              GeoHarvest
            </span>
          </motion.a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1.5">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onScrollTo(item.id)
                }}
                className="text-xs px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all font-semibold uppercase tracking-wider"
              >
                {item.label}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA & Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSelector theme="dark" />
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs text-white/80 flex items-center font-bold uppercase tracking-wider bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
                <UserIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-xs text-white/60 hover:text-white flex items-center font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Logout
              </button>
              <motion.div whileHover={{ scale: 1.03 }}>
                <button
                  onClick={onNavigateToDashboard}
                  className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                  Dashboard
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-xs text-white/80 hover:text-white font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Login
              </button>
              <motion.div whileHover={{ scale: 1.03 }}>
                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="inline-flex items-center justify-center px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-lime-300 hover:from-emerald-300 hover:to-lime-200 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                >
                  Get Started
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden flex items-center p-1.5 text-white hover:text-emerald-400 rounded-full hover:bg-white/5"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-[#020703]/98 backdrop-blur-2xl z-50 pt-24 px-6 md:hidden flex flex-col justify-between pb-12"
            initial={{ opacity: 0, y: "-10%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-10%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2.5 text-white hover:text-emerald-400 rounded-full bg-white/5"
              onClick={toggleMenu}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5" />
            </motion.button>
            
            <div className="flex flex-col space-y-5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-lg text-white font-bold uppercase tracking-wider hover:text-emerald-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleMenu()
                      onScrollTo(item.id)
                    }}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-white/8 pt-6 flex flex-col space-y-4">
              <div className="flex justify-start py-1">
                <LanguageSelector theme="dark" />
              </div>
              {user ? (
                <>
                  <span className="text-sm text-white/80 flex items-center font-bold uppercase tracking-wider bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <UserIcon className="w-4 h-4 mr-2 text-emerald-400" />
                    {user.name}
                  </span>
                  <button
                    onClick={() => {
                      toggleMenu()
                      logout()
                    }}
                    className="text-sm text-white/60 hover:text-white flex items-center font-bold uppercase tracking-wider transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                  <button
                    onClick={() => {
                      toggleMenu()
                      onNavigateToDashboard()
                    }}
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-lime-300 rounded-full transition-all"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      toggleMenu()
                      setIsLoginOpen(true)
                    }}
                    className="text-sm text-white/80 hover:text-white font-bold uppercase tracking-wider transition-colors text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      toggleMenu()
                      setIsSignupOpen(true)
                    }}
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-lime-300 rounded-full transition-all"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitch={switchModals}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitch={switchModals}
      />
    </div>
  );
}

