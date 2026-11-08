import React, { useState } from 'react';
import { ChartDataPoint } from '../types';
import { formatRupiah } from '../data/mockData';

interface SmoothLineChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export const SmoothLineChart: React.FC<SmoothLineChartProps> = ({
  data,
  height = 200
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-slate-400">Tidak ada data grafik</div>;
  }

  const width = 600;
  const paddingX = 35;
  const paddingTop = 45;
  const paddingBottom = 30;

  const balances = data.map(d => Number(d.totalBalance) || 0);
  const rawMin = Math.min(...balances);
  const rawMax = Math.max(...balances);

  const minVal = rawMin === rawMax ? rawMin * 0.8 : rawMin * 0.95;
  const maxVal = rawMin === rawMax ? (rawMax === 0 ? 1000000 : rawMax * 1.2) : rawMax * 1.03;
  const range = (maxVal - minVal) || 1;

  const chartHeight = Math.max(height - paddingTop - paddingBottom, 40);
  const chartWidth = Math.max(width - paddingX * 2, 100);

  // Map data to coordinate points safely without NaN
  const points = data.map((d, index) => {
    const totalCount = data.length;
    const x = totalCount > 1
      ? paddingX + (index / (totalCount - 1)) * chartWidth
      : paddingX + chartWidth / 2;
    
    const balanceNum = Number(d.totalBalance) || 0;
    const normalizedY = ((balanceNum - minVal) / range);
    const safeNormalizedY = isNaN(normalizedY) ? 0.5 : Math.max(0, Math.min(1, normalizedY));
    const y = paddingTop + chartHeight - safeNormalizedY * chartHeight;

    return {
      x: isFinite(x) ? Number(x.toFixed(2)) : paddingX + chartWidth / 2,
      y: isFinite(y) ? Number(y.toFixed(2)) : paddingTop + chartHeight / 2,
      data: d
    };
  });

  // Calculate smooth cubic Bezier path
  function createSmoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) {
      const p = pts[0];
      const startX = Math.max(0, p.x - 40);
      const endX = Math.min(width, p.x + 40);
      return `M ${startX.toFixed(2)},${p.y.toFixed(2)} L ${endX.toFixed(2)},${p.y.toFixed(2)}`;
    }

    let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const tension = 0.22;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  const linePath = createSmoothPath(points);
  const baselineY = (height - paddingBottom).toFixed(2);
  const firstPt = points[0] || { x: paddingX, y: height / 2 };
  const lastPt = points[points.length - 1] || { x: width - paddingX, y: height / 2 };
  const areaPath = points.length > 1
    ? `${linePath} L ${lastPt.x.toFixed(2)},${baselineY} L ${firstPt.x.toFixed(2)},${baselineY} Z`
    : `M ${Math.max(0, firstPt.x - 40).toFixed(2)},${firstPt.y.toFixed(2)} L ${Math.min(width, firstPt.x + 40).toFixed(2)},${firstPt.y.toFixed(2)} L ${Math.min(width, firstPt.x + 40).toFixed(2)},${baselineY} L ${Math.max(0, firstPt.x - 40).toFixed(2)},${baselineY} Z`;

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="relative w-full select-none overflow-hidden pt-2">
      {/* SVG Container */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <defs>
          <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineStrokeGradientBlue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#chartGradientBlue)" />

        {/* Smooth Cubic Bezier Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineStrokeGradientBlue)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertical Crosshair Line for Active Point */}
        {activePoint && isFinite(activePoint.x) && (
          <line
            x1={activePoint.x}
            y1={paddingTop - 10}
            x2={activePoint.x}
            y2={height - paddingBottom}
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />
        )}

        {/* Inline Top Value Label directly in SVG */}
        {activePoint && isFinite(activePoint.x) && (
          <g transform={`translate(${Math.min(Math.max(activePoint.x, 90), width - 90)}, 22)`}>
            <rect
              x="-80"
              y="-16"
              width="160"
              height="28"
              rx="6"
              fill="#0F172A"
              stroke="#3B82F6"
              strokeWidth="1"
            />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="bold"
            >
              {activePoint.data.fullDate || activePoint.data.label}: {formatRupiah(activePoint.data.totalBalance)}
            </text>
          </g>
        )}

        {/* Interactive Points and Touch Area */}
        {points.map((pt, i) => {
          const isHovered = hoveredIndex === i;
          const isLast = i === points.length - 1 && hoveredIndex === null;
          const isActive = isHovered || isLast;
          const safeX = isFinite(pt.x) ? pt.x : paddingX;
          const safeY = isFinite(pt.y) ? pt.y : paddingTop;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
            >
              {/* Invisible large hit area */}
              <circle cx={safeX} cy={safeY} r="18" fill="transparent" />

              {/* Outer ring for active */}
              {isActive && (
                <circle
                  cx={safeX}
                  cy={safeY}
                  r="8"
                  fill="#2563EB"
                  fillOpacity="0.25"
                />
              )}

              {/* Point Node */}
              <circle
                cx={safeX}
                cy={safeY}
                r={isActive ? '4.5' : '3'}
                fill={isActive ? '#2563EB' : '#FFFFFF'}
                stroke="#2563EB"
                strokeWidth={isActive ? '2' : '1.5'}
              />

              {/* X Axis Label */}
              <text
                x={safeX}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                className={`transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {pt.data.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
