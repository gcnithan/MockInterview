'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Fetch notifications when user is loaded
          fetchNotifications();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);
  
  const isActive = (path) => {
    return pathname === path ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-300 transition-all duration-200';
  };
  
  const fetchNotifications = async () => {
    // This would be a real API call in a production app
    // For now, mocking some notification data
    setNotifications([
      { 
        id: 1, 
        message: 'Your interview is scheduled for today at 3:00 PM', 
        type: 'reminder',
        isRead: false,
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
      },
      { 
        id: 2, 
        message: 'New practice questions are available for Software Engineer roles', 
        type: 'update',
        isRead: true,
        time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
      }
    ]);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Logging out...');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Clear user state and redirect
        setUser(null);
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(note => 
      note.id === id ? {...note, isRead: true} : note
    ));
  };
  
  const unreadCount = notifications.filter(note => !note.isRead).length;

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 }
  };
  
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Link href="/dashboard">
            <div className="relative overflow-hidden rounded-full hover:scale-105 transition-transform duration-300">
              <Image 
                src="/logo.svg" 
                alt="AI Interview Mocker" 
                width={50} 
                height={50}
                className="h-10 w-auto"
                priority
              />
            </div>
          </Link>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">AI Interview Mocker</span>
        </motion.div>
        
        <motion.nav 
          className="hidden md:flex items-center gap-8"
          initial="hidden"
          animate="visible"
          variants={navVariants}
        >
          <motion.div variants={itemVariants}>
            <Link 
              href="/dashboard" 
              className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link 
              href="/questions" 
              className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/questions')}`}
            >
              Questions
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link 
              href="/how-it-works" 
              className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/how-it-works')}`}
            >
              How It Works
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link 
              href="/resources" 
              className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/resources')}`}
            >
              Resources
            </Link>
          </motion.div>
          
          {user && (
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              <motion.button
                onClick={toggleNotifications}
                className="px-2 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 relative transition-all duration-200"
                aria-label="Notifications"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 border border-gray-100"
                  >
                    <div className="py-2 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-4 px-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <motion.div 
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`py-3 px-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${notification.isRead ? '' : 'bg-blue-50'}`}
                            whileHover={{ backgroundColor: 'rgba(238, 242, 255, 0.5)' }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                              {notification.type === 'reminder' && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Reminder
                                </span>
                              )}
                              {notification.type === 'update' && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Update
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    <Link 
                      href="/notifications"
                      className="block py-2 text-sm text-center text-indigo-600 hover:text-indigo-800 bg-gray-50 border-t border-gray-200 hover:bg-indigo-50 transition-colors duration-150"
                    >
                      View all notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          
          {user && (
            <>
              <motion.span 
                variants={itemVariants}
                className="px-3 py-2 text-sm font-medium text-gray-600"
              >
                Hi, {user.firstName || user.email?.split('@')[0] || 'User'}
              </motion.span>
              <motion.button
                variants={itemVariants}
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          )}
        </motion.nav>
        
        <div className="md:hidden">
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            whileTap={{ scale: 0.9 }}
          >
            <span className="sr-only">Open main menu</span>
            {!isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-4 space-y-2 divide-y divide-gray-100">
              <Link 
                href="/dashboard" 
                className={`block px-4 py-3 rounded-lg text-base font-medium ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              <Link 
                href="/questions" 
                className={`block px-4 py-3 rounded-lg text-base font-medium ${pathname === '/questions' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Questions
              </Link>
              
              <Link 
                href="/how-it-works" 
                className={`block px-4 py-3 rounded-lg text-base font-medium ${pathname === '/how-it-works' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              
              <Link 
                href="/resources" 
                className={`block px-4 py-3 rounded-lg text-base font-medium ${pathname === '/resources' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Resources
              </Link>
              
              {user && (
                <div className="pt-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Hi, {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                    {unreadCount > 0 && (
                      <Link
                        href="/notifications"
                        className="flex items-center text-sm text-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                          />
                        </svg>
                        {unreadCount} notification{unreadCount > 1 ? 's' : ''}
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 px-4 pb-2">
                    <motion.button
                      onClick={(e) => {
                        handleLogout(e);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm"
                      whileTap={{ scale: 0.95 }}
                    >
                      Logout
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 