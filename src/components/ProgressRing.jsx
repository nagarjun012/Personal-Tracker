import React, { useEffect, useState } from 'react';

export default function ProgressRing({ 
  size = 140, 
  strokeWidth = 12, 
  progress = 0, 
  color = 'var(--accent-primary)', 
  title = '', 
  subtitle = '' 
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Smooth entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: size,
      height: size
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      
      {/* Inner Text overlay */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        inset: strokeWidth + 4
      }}>
        {title && (
          <span style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}>
            {title}
          </span>
        )}
        {subtitle && (
          <span style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            marginTop: '2px'
          }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
