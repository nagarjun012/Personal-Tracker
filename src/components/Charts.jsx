import React, { useState } from 'react';

// ==========================================
// 1. DOUGHNUT / DONUT CHART
// ==========================================
export function DonutChart({ data = [], size = 180, strokeWidth = 24 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: size, color: 'var(--text-tertiary)' }}>
        No tracking data recorded.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {data.map((item, idx) => {
            const percent = (item.value / total) * 100;
            const strokeDashoffset = circumference - (percent / 100) * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotationOffset = (accumulatedPercent / 100) * circumference;
            
            accumulatedPercent += percent;

            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color || 'var(--accent-primary)'}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: '50% 50%',
                  transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Dynamic center summary */}
        <div style={{
          position: 'absolute',
          inset: strokeWidth + 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          {hoveredIndex !== null ? (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                {data[hoveredIndex].name}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round((data[hoveredIndex].value / total) * 100)}%
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {data[hoveredIndex].value} min
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Focus
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {Math.round(total / 60)}h
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {total} mins
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: '120px' }}>
        {data.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: hoveredIndex === idx ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. GRADIENT LINE CHART (PRODUCTIVITY SCORES)
// ==========================================
export function LineChart({ data = [], width = 500, height = 220 }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No historical scores.</div>;
  }

  // Find min/max values to scale chart
  const scores = data.map(d => d.score);
  const maxVal = 100; // Scores are capped at 100
  const minVal = 0;

  const padding = { top: 20, right: 30, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Map data coordinates
  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d.score - minVal) / (maxVal - minVal)) * graphHeight;
    return { x, y, score: d.score, label: d.date };
  });

  // Construct SVG Path string (Bezier curves)
  let linePath = '';
  let areaPath = '';
  
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Control points for smooth bezier curve
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }
    
    // Closed shape for gradient area filling
    areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((gridLine, idx) => {
          const y = padding.top + graphHeight - (gridLine / 100) * graphHeight;
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--border-color)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                fill="var(--text-tertiary)"
                fontSize="0.75rem"
                fontWeight="500"
                textAnchor="end"
              >
                {gridLine}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* Curve line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((pt, idx) => {
          const isHovered = activeIdx === idx;
          const dateObj = new Date(pt.label);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

          return (
            <g key={idx}>
              {/* Invisible touch target */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="16"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              />
              {/* Visible dot outline */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? '6' : '4'}
                fill="var(--bg-secondary)"
                stroke="var(--accent-primary)"
                strokeWidth="2.5"
                pointerEvents="none"
                style={{ transition: 'all var(--transition-fast)' }}
              />
              
              {/* Tooltip on active */}
              {isHovered && (
                <g>
                  {/* Tooltip Card background */}
                  <rect
                    x={pt.x - 45}
                    y={pt.y - 45}
                    width="90"
                    height="32"
                    rx="6"
                    fill="var(--bg-secondary)"
                    stroke="var(--border-color)"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 25}
                    fill="var(--text-primary)"
                    fontSize="0.75rem"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Score: {pt.score}
                  </text>
                </g>
              )}

              {/* Bottom Labels (only render first, middle, last to avoid crowding) */}
              {(idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                <text
                  x={pt.x}
                  y={height - padding.bottom + 20}
                  fill="var(--text-tertiary)"
                  fontSize="0.75rem"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {formattedDate}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ==========================================
// 3. BAR CHART (HABIT FREQUENCY OR TIMES)
// ==========================================
export function BarChart({ data = [], width = 500, height = 220 }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No details available.</div>;
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const padding = { top: 25, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  const barWidth = Math.min(45, (graphWidth / data.length) * 0.55);
  const gap = (graphWidth - barWidth * data.length) / (data.length - 1 || 1);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height}>
        {/* Horizontal grid guide */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = padding.top + graphHeight - ratio * graphHeight;
          const val = Math.round(ratio * maxVal);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--border-color)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                fill="var(--text-tertiary)"
                fontSize="0.75rem"
                fontWeight="500"
                textAnchor="end"
              >
                {val}h
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const x = padding.left + index * (barWidth + gap);
          const barHeight = (d.value / maxVal) * graphHeight;
          const y = padding.top + graphHeight - barHeight;
          const isHovered = hoveredBar === index;

          return (
            <g key={index}>
              {/* Background trace bar */}
              <rect
                x={x}
                y={padding.top}
                width={barWidth}
                height={graphHeight}
                rx="6"
                fill="var(--bg-tertiary)"
                opacity="0.1"
              />
              {/* Actual value bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill={isHovered ? 'var(--accent-primary)' : 'rgba(var(--accent-primary-rgb), 0.75)'}
                style={{
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              />
              
              {/* Tooltip value */}
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  fill="var(--text-primary)"
                  fontSize="0.75rem"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {d.value}h
                </text>
              )}

              {/* Bottom Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 18}
                fill="var(--text-secondary)"
                fontSize="0.7rem"
                fontWeight="500"
                textAnchor="middle"
              >
                {d.name.substring(0, 7)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ==========================================
// 4. HABIT ANNUAL HEATMAP (GITHUB STYLE)
// ==========================================
export function HabitHeatmap({ logs = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate matrix: 53 columns by 7 rows representing the last 365 days
  // Let's create an array of days backwards from today
  const cols = 53;
  const rows = 7;
  const totalCells = cols * rows;

  const datesList = [];
  const today = new Date();
  
  // Align cells to end on today's day of week (so today is at the bottom right)
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  const daysOffset = dayOfWeek; // cells left in final column

  // Shift dates backward to match the grid size
  for (let i = totalCells - 1 - (6 - daysOffset); i >= -daysOffset; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    datesList.push(d.toLocaleDateString('sv'));
  }

  // Count completions per date
  const completedCounts = {};
  for (const log of logs) {
    if (log.status === 'completed') {
      completedCounts[log.date] = (completedCounts[log.date] || 0) + 1;
    }
  }

  // Group dates into columns
  const grid = [];
  for (let c = 0; c < cols; c++) {
    const column = [];
    for (let r = 0; r < rows; r++) {
      const idx = c * rows + r;
      column.push(datesList[idx]);
    }
    grid.push(column);
  }

  const getColorIntensity = (date) => {
    const count = completedCounts[date] || 0;
    if (!count) return 'var(--bg-tertiary)';
    if (count === 1) return 'rgba(99, 102, 241, 0.25)'; // Light indigo
    if (count === 2) return 'rgba(99, 102, 241, 0.5)';
    if (count === 3) return 'rgba(99, 102, 241, 0.75)';
    return 'var(--accent-primary)'; // Full solid purple
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', position: 'relative' }}>
      {/* Tooltip Overlay */}
      {hoveredDay && (
        <div style={{
          position: 'absolute',
          top: '-45px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {new Date(hoveredDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}: {completedCounts[hoveredDay] || 0} habits logged
        </div>
      )}

      {/* Grid wrapper */}
      <div style={{ overflowX: 'auto', display: 'flex', padding: '0.5rem 0', width: '100%' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {grid.map((col, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {col.map((date, rowIdx) => (
                <div
                  key={rowIdx}
                  onMouseEnter={() => setHoveredDay(date)}
                  onMouseLeave={() => setHoveredDay(null)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: getColorIntensity(date),
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    border: '1px solid rgba(0,0,0,0.02)'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Grid Legend labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '0 0.5rem' }}>
        <span>365 Days Ago</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Less</span>
          <div style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--bg-tertiary)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'rgba(99, 102, 241, 0.3)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'rgba(99, 102, 241, 0.6)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--accent-primary)' }} />
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}
