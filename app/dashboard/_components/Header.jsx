"use client";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => {
        return pathname === path ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-indigo-600';
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white shadow">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Image 
                            src="/logo.svg" 
                            alt="AI Interview Mocker" 
                            width={50} 
                            height={50}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                    <span className="text-xl font-bold">AI Interview Mocker</span>
                </div>
                
                <nav className="hidden md:flex items-center gap-8">
                    <Link 
                        href="/dashboard" 
                        className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/dashboard')}`}
                    >
                        Dashboard
                    </Link>
                    
                    <Link 
                        href="/questions" 
                        className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/questions')}`}
                    >
                        Questions
                    </Link>
                    
                    <Link 
                        href="/how-it-works" 
                        className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/how-it-works')}`}
                    >
                        How It Works
                    </Link>
                    
                    <Link 
                        href="/resources" 
                        className={`px-1 py-2 text-sm font-medium transition-colors ${isActive('/resources')}`}
                    >
                        Resources
                    </Link>
                </nav>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Logout
                    </button>
                </div>
                
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-600 focus:outline-none"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link 
                            href="/dashboard" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                        >
                            Dashboard
                        </Link>
                        
                        <Link 
                            href="/questions" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                        >
                            Questions
                        </Link>
                        
                        <Link 
                            href="/how-it-works" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                        >
                            How It Works
                        </Link>
                        
                        <Link 
                            href="/resources" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                        >
                            Resources
                        </Link>
                        
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-500 hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}