import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
    value: number;
    format?: (val: number) => string;
    duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, format, duration = 1500 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const valueRef = useRef(0);
    const startValueRef = useRef(0);
    const startTimeRef = useRef(0);

    useEffect(() => {
        startValueRef.current = displayValue;
        startTimeRef.current = performance.now();
        valueRef.current = value;

        let animationFrame: number;

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic ease out
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const current = startValueRef.current + (valueRef.current - startValueRef.current) * easedProgress;
            setDisplayValue(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <span>
            {format ? format(displayValue) : Math.round(displayValue).toLocaleString()}
        </span>
    );
};

export default AnimatedNumber;
