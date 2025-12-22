'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface TiltWrapperProps {
    children: ReactNode;
    rotateAmplitude?: number;
    scaleOnHover?: number;
    className?: string;
}

const springValues = { stiffness: 400, damping: 30, mass: 1 };

export default function TiltWrapper({
    children,
    rotateAmplitude = 10,
    scaleOnHover = 1.02,
    className = ''
}: TiltWrapperProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const rotateX = useSpring(useMotionValue(0), springValues);
    const rotateY = useSpring(useMotionValue(0), springValues);
    const scale = useSpring(1, springValues);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        rotateX.set((mouseY / (rect.height / 2)) * -rotateAmplitude);
        rotateY.set((mouseX / (rect.width / 2)) * rotateAmplitude);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        scale.set(scaleOnHover);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
                perspective: 1000,
            }}
            className={`transition-shadow duration-300 ${isHovered ? 'shadow-2xl' : 'shadow-lg'} ${className}`}
        >
            {children}
        </motion.div>
    );
}
