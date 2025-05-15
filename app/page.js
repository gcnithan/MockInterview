'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from './components/LoginForm';

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check', { credentials: 'include' });
                if (response.ok) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return <LoginForm />;
}
