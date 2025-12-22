'use client';

import { motion, AnimatePresence } from 'motion/react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export function LoadingOverlay({ isLoading, message = "Processing..." }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center"
                >
                    {/* Blur backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

                    {/* Loader content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm mx-4"
                    >
                        {/* Spinning loader */}
                        <div className="relative mb-4">
                            {/* Outer ring */}
                            <div className="w-16 h-16 border-4 border-red-100 rounded-full"></div>

                            {/* Spinning ring */}
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-red-600 border-r-orange-500 rounded-full animate-spin"></div>

                            {/* Inner dot */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 font-medium text-center">{message}</p>

                        {/* Bouncing dots */}
                        <div className="flex gap-1 mt-3">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
