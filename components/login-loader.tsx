'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { LogIn, Flame } from 'lucide-react';

export function LoginLoader() {
    const { isAuthenticating } = useAuth();

    return (
        <AnimatePresence>
            {isAuthenticating && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[999999] flex items-center justify-center"
                >
                    {/* Background with blur */}
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-orange-800/90 to-yellow-900/90 backdrop-blur-md"
                        style={{ backgroundImage: "url('/web-background-image.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 80%' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/95 via-orange-800/95 to-yellow-900/95 backdrop-blur-sm" />
                    </div>

                    {/* Loader content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        {/* Animated fire icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                y: [0, -5, 0]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                            className="mb-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/30 to-red-600/30 backdrop-blur-lg flex items-center justify-center border border-orange-300/30 shadow-2xl">
                                <Flame className="w-12 h-12 text-orange-300" />
                            </div>
                        </motion.div>

                        {/* Text */}
                        <motion.h2
                            className="text-2xl font-bold text-white mb-2"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            Signing In...
                        </motion.h2>

                        <p className="text-white/70 text-sm">Preparing your dashboard</p>

                        {/* Loading bar */}
                        <div className="w-48 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                style={{ width: "50%" }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
