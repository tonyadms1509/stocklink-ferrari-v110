
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Confetti: React.FC<{ duration?: number, onComplete?: () => void }> = ({ duration = 3000, onComplete }) => {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
        const newParticles = [];
        
        for (let i = 0; i < 100; i++) {
            newParticles.push({
                x: Math.random() * 100, // vw
                y: -10 - Math.random() * 20, // vh (start above screen)
                size: 5 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                delay: Math.random() * 0.5,
                duration: 2 + Math.random() * 2,
                drift: Math.random() * 100 - 50, // px drift
                id: i
            });
        }
        setParticles(newParticles);

        const timer = setTimeout(() => {
            if(onComplete) onComplete();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        opacity: 1,
                        transition: `top ${p.duration}s linear, transform ${p.duration}s linear, left ${p.duration}s ease-in-out, opacity ${p.duration}s ease-in`,
                    }}
                    ref={(el) => {
                        if (el) {
                            // Trigger animation in next frame to ensure transition occurs
                            requestAnimationFrame(() => {
                                el.style.top = '110%';
                                el.style.left = `calc(${p.x}% + ${p.drift}px)`;
                                el.style.transform = `rotate(${p.rotation + 720}deg)`;
                                el.style.opacity = '0';
                            });
                        }
                    }}
                />
            ))}
        </div>,
        document.body
    );
};

export default Confetti;
