'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkOnboardingStatus = useCallback(async (currentUserId: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/onboarding/status/${currentUserId}`);
            if (res.ok) {
                const status = await res.json();
                
                // If onboarding is complete, redirect to home if not already there.
                if (status.onboarding_complete === 'true') {
                    if(pathname.startsWith('/onboarding')) {
                        router.push(`/home?userId=${currentUserId}`);
                    }
                    return;
                }

                // Redirect to the first incomplete step
                if (status.personality_test !== 'completed') {
                    router.push(`/onboarding/personality-test?userId=${currentUserId}`);
                } else if (status.chatbot_interaction !== 'completed') {
                    router.push(`/onboarding/chatbot?userId=${currentUserId}`);
                } else if (status.game !== 'completed') {
                    router.push(`/onboarding/game?userId=${currentUserId}`);
                } else if (status.task_creation !== 'completed') {
                    router.push(`/onboarding/task?userId=${currentUserId}`);
                } else if (status.community_post !== 'completed') {
                    router.push(`/onboarding/community?userId=${currentUserId}`);
                } else {
                    // Fallback to home if all steps seem complete but flag is not set
                     await fetch('http://127.0.0.1:5000/api/onboarding/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: currentUserId, step: 'onboarding_complete', status: 'true' }),
                    });
                    router.push(`/home?userId=${currentUserId}`);
                }
            } else {
                 router.push(`/onboarding/personality-test?userId=${currentUserId}`);
            }
        } catch (error) {
            console.error("Failed to check onboarding status:", error);
            // Default to first step on error
            router.push(`/onboarding/personality-test?userId=${currentUserId}`);
        }
    }, [router, pathname]);

    useEffect(() => {
        const userIdFromParams = searchParams.get('userId');
        const userIdFromSession = sessionStorage.getItem('userId');
        const currentUserId = userIdFromParams || userIdFromSession;

        if (currentUserId) {
            if (!userIdFromSession || userIdFromParams) {
                 sessionStorage.setItem('userId', currentUserId);
            }
            setUserId(currentUserId);
            // Don't check onboarding on login/signup pages themselves
            if (pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/onboarding')) {
                checkOnboardingStatus(currentUserId);
            }
        } else if (!pathname.startsWith('/login') && !pathname.startsWith('/signup') && pathname !== '/') {
            router.push('/login');
        }
        setIsLoading(false);

    }, [router, searchParams, pathname, checkOnboardingStatus]);

    return { userId, isLoading };
}
