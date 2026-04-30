"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Globe, LogOut, LayoutDashboard, Route as RouteIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('EN');
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white font-bold shadow-md transition-colors">
            N
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NetCanvas
          </span>
        </Link>

        {/* Global Navigation Links */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === '/' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <RouteIcon className="w-4 h-4" /> Canvas
            </span>
          </Link>
          <Link href="/dashboard">
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </span>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Language Switch */}
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setLang(lang === 'EN' ? 'TH' : 'EN')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold transition-colors"
        >
          <Globe className="w-4 h-4" />
          <AnimatePresence mode="wait">
            <motion.span
              key={lang}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="w-4 text-center"
            >
              {lang}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        
        {/* Theme Toggle */}
        <div className="w-10 h-10 flex items-center justify-center">
          {mounted && (
            <motion.button 
              whileHover={{ rotate: 15, scale: 1.1 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </motion.button>
          )}
        </div>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

        {/* User Auth */}
        {session ? (
          <div className="flex items-center gap-3">
            <img 
              src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full ring-2 ring-blue-500 shadow-sm" 
            />
            <div className="hidden md:flex flex-col mr-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
                {session.user?.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                Offline Mode
              </span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => signOut()} 
              className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <button 
            onClick={() => signIn('google')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-sm font-semibold transition-all hover:shadow-md"
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}