'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Set loading to false after navigation completes
        setIsLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        // Listen for route change start
        const handleStart = () => setIsLoading(true);
        const handleComplete = () => setIsLoading(false);

        // Use click listener to detect navigation
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && !link.href.startsWith('#') && !link.target) {
                const url = new URL(link.href, window.location.origin);
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [pathname]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-orange-600">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('/web-background-image.jpg')] bg-cover" style={{ backgroundPosition: 'center 80%' }} />
            </div>

            {/* Loader content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Fire-themed spinner */}
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-20 h-20 border-4 border-yellow-400/30 rounded-full"></div>

                    {/* Spinning ring */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-yellow-400 border-r-orange-500 rounded-full animate-spin"></div>

                    {/* Inner glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/20 rounded-full blur-md animate-pulse"></div>

                    {/* Fire icon in center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 23C8.35 23 4 19.65 4 14.5C4 11.04 6.05 7.5 8.2 4.94C8.43 4.68 8.78 4.57 9.1 4.67C9.43 4.77 9.67 5.04 9.73 5.38C10.07 7.15 10.89 8.75 12.09 10.04C12.27 9.56 12.43 9.08 12.56 8.57C13.07 6.58 13.05 4.5 12.5 2.51C12.4 2.17 12.5 1.8 12.75 1.55C13 1.3 13.37 1.2 13.71 1.3C16.24 2.05 19.35 4.89 20.72 8.04C21.91 10.82 22.01 13.81 21.04 16.37C19.6 20.2 16.2 23 12 23Z" />
                        </svg>
                    </div>
                </div>

                {/* Loading text */}
                <div className="mt-6 text-center">
                    <p className="text-white font-semibold text-lg">Loading</p>
                    <div className="flex gap-1 justify-center mt-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
