'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
    value: 'basic' | 'pro';
    onChange: (value: 'basic' | 'pro') => void;
    disabled?: boolean;
}

export default function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
    const isBasic = value === 'basic';

    return (
        <div className="flex flex-col items-center">
            {/* Height 32px (h-8), compact pill */}
            <div
                className="relative flex items-center bg-gray-100 p-0.5 rounded-full w-auto h-8"
                role="tablist"
                aria-label="Tryb widoku"
            >
                {/* Basic Segment */}
                <button
                    role="tab"
                    aria-selected={isBasic}
                    aria-controls="basic-panel"
                    disabled={disabled}
                    onClick={() => onChange('basic')}
                    className={cn(
                        "relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-w-[100px]",
                        isBasic ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    {isBasic && (
                        <motion.div
                            layoutId="active-mode-pill"
                            className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{ zIndex: -1 }}
                        />
                    )}
                    <Zap size={13} className={cn("transition-colors", isBasic ? "text-[#009D8F]" : "text-gray-400")} />
                    <span>Podstawowy</span>
                </button>

                {/* Pro Segment */}
                <button
                    role="tab"
                    aria-selected={!isBasic}
                    aria-controls="pro-panel"
                    disabled={disabled}
                    onClick={() => onChange('pro')}
                    className={cn(
                        "relative flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-w-[110px]",
                        !isBasic ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    {!isBasic && (
                        <motion.div
                            layoutId="active-mode-pill"
                            className="absolute inset-0 bg-white rounded-full shadow-sm border border-gray-200/50"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{ zIndex: -1 }}
                        />
                    )}
                    <Sparkles size={13} className={cn("transition-colors", !isBasic ? "text-purple-500" : "text-gray-400")} />
                    <span>Zaawansowany</span>
                </button>
            </div>

            {/* Microcopy with crossfade */}
            <div className="h-[16px] mt-1 relative w-full text-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {isBasic ? (
                        <motion.p
                            key="basic-desc"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{ duration: 0.15 }}
                            className="text-[10px] text-gray-400 font-medium absolute inset-0 flex items-center justify-center gap-1"
                        >
                            <span className="w-1 h-1 rounded-full bg-[#009D8F]" />
                            Najważniejsze wskaźniki
                        </motion.p>
                    ) : (
                        <motion.p
                            key="pro-desc"
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{ duration: 0.15 }}
                            className="text-[10px] text-gray-400 font-medium absolute inset-0 flex items-center justify-center gap-1"
                        >
                            <span className="w-1 h-1 rounded-full bg-purple-500" />
                            Sygnały, alerty
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
