import { useRef, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';
import type { ChartType } from '../types/trading';

const CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
  { type: 'line', label: 'LINE', icon: '━' },
  { type: 'area', label: 'AREA', icon: 'Ἄ' },
  { type: 'candlestick', label: 'CANDLE', icon: '┃' },
  { type: 'bars', label: 'BARS', icon: '▎' },
];

export function PriceDisplay() {
  const { state } = useTrading();
  const conf = ASSETS[state.activeAsset];
  const price = state.priceHistory[state.priceHistory.length - 1] || conf.base;
  const prevPrice = state.priceHistory[state.priceHistory.length - 2] || price;
  const isUp = price >= prevPrice;

  return (
    <div className="price-display">
      <div className="price-label">{conf.label}</div>
      <div className="price-main" data-dir={isUp ? 'up' : 'down'}>
        <span className="price-currency">$</span>
        {price.toFixed(conf.decimals)}
      </div>
      <div className="price-delta" data-dir={isUp ? 'up' : 'down'}>
        {isUp ? '▲' : '▼'} {Math.abs(price - conf.base).toFixed(conf.decimals)}
      </div>
    </div>
  );
}

export function PriceChart() {
  const { state, dispatch } = useTrading();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const data = state.priceHistory;
    if (data.length < 2) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = canvas.width;
    const h = canvas.height;
    const pad = 6;

    const isActive = state.isActive;
    const lineColor = isActive
      ? state.currentPnl >= 0
        ? '#22c55e'
        : '#e11d48'
      : '#FF8C00';

    ctx.clearRect(0, 0, w, h);

    // Helper to map price to Y
    const toY = (p: number) => h - ((p - min) / range) * (h - pad * 2) - pad;

    switch (state.chartType) {
      case 'line':
        drawLine(ctx, data, w, h, lineColor, toY);
        break;
      case 'area':
        drawArea(ctx, data, w, h, lineColor, toY);
        break;
      case 'candlestick':
        drawCandlestick(ctx, data, w, h, lineColor, toY);
        break;
      case 'bars':
        drawBars(ctx, data, w, h, lineColor, toY);
        break;
    }

    // Entry price line when active
    if (state.isActive && state.entryPrice > 0) {
      const ey = toY(state.entryPrice);
      ctx.beginPath();
      ctx.moveTo(0, ey);
      ctx.lineTo(w, ey);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.fillText(`ENTRY ${state.entryPrice}`, w - 80, ey - 4);
    }
  }, [state.priceHistory, state.isActive, state.currentPnl, state.chartType, state.entryPrice]);

  return (
    <div className="chart-wrapper">
      <div className="chart-type-selector">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct.type}
            className={`chart-type-btn ${state.chartType === ct.type ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_CHART_TYPE', payload: ct.type })}
            title={ct.label}
          >
            <span className="cti-icon">{ct.icon}</span>
            <span className="cti-label">{ct.label}</span>
          </button>
        ))}
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  _h: number,
  color: string,
  toY: (p: number) => number
) {
  const step = w / (data.length - 1);

  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  data.forEach((p, i) => {
    const x = i * step;
    const y = toY(p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawArea(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  h: number,
  color: string,
  toY: (p: number) => number
) {
  const step = w / (data.length - 1);

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, color + '35');
  gradient.addColorStop(0.7, color + '08');
  gradient.addColorStop(1, color + '00');

  // Fill
  ctx.beginPath();
  data.forEach((p, i) => {
    const x = i * step;
    const y = toY(p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  data.forEach((p, i) => {
    const x = i * step;
    const y = toY(p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Glow dot at latest price
  const lastX = (data.length - 1) * step;
  const lastY = toY(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCandlestick(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  _h: number,
  _color: string,
  toY: (p: number) => number
) {
  const count = data.length;
  const candleW = Math.max(3, (w / count) * 0.6);
  const gap = w / count;

  for (let i = 0; i < count; i++) {
    const price = data[i];
    const prev = data[Math.max(0, i - 1)];
    const bullish = price >= prev;
    const color = bullish ? '#22c55e' : '#e11d48';

    const x = i * gap + gap / 2;

    // Generate open/high/low from consecutive prices
    const open = prev;
    const close = price;
    const high = Math.max(open, close) + Math.abs(open - close) * 0.3;
    const low = Math.min(open, close) - Math.abs(open - close) * 0.3;

    const yOpen = toY(open);
    const yClose = toY(close);
    const yHigh = toY(high);
    const yLow = toY(low);

    // Wick
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Body
    const bodyTop = Math.min(yOpen, yClose);
    const bodyH = Math.max(Math.abs(yOpen - yClose), 1);
    ctx.fillStyle = bullish ? color : color;
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);

    if (!bullish) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }
  }
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  data: number[],
  w: number,
  h: number,
  _color: string,
  toY: (p: number) => number
) {
  const count = data.length;
  const barW = Math.max(2, (w / count) * 0.5);
  const gap = w / count;
  const baseY = h - 6;

  for (let i = 0; i < count; i++) {
    const price = data[i];
    const prev = data[Math.max(0, i - 1)];
    const bullish = price >= prev;
    const color = bullish ? '#22c55e' : '#e11d48';
    const x = i * gap + gap / 2;
    const y = toY(price);

    ctx.fillStyle = color;
    ctx.fillRect(x - barW / 2, y, barW, baseY - y);
  }
}
