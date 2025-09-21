// ayushpal0/mental-wellness/Mental-Wellness-frontend/hooks/use-auth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Priority: 1. URL param (if user is just logging in)
        const userIdFromParams = searchParams.get('userId');
        // Priority: 2. Session storage (for subsequent navigation)
        const userIdFromSession = sessionStorage.getItem('userId');

        if (userIdFromParams) {
            // If ID is in the URL, save it to the session and use it.
            // This happens right after login/signup.
            sessionStorage.setItem('userId', userIdFromParams);
            setUserId(userIdFromParams);
            setIsLoading(false);
        } else if (userIdFromSession) {
            // If no ID in URL, use the one from the session.
            setUserId(userIdFromSession);
            setIsLoading(false);
        } else {
            // No user ID found anywhere, redirect to login.
            router.push('/login');
        }
    }, [router, searchParams]);

    return { userId, isLoading };
}