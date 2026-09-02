import { useRef, useEffect, useCallback, useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { ASSETS } from '../config/assets';
import type { ChartType } from '../types/trading';

const CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
  { type: 'line', label: 'LINE', icon: '━' },
  { type: 'area', label: 'AREA', icon: '◆' },
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const conf = ASSETS[state.activeAsset];
  const price = state.priceHistory[state.priceHistory.length - 1] || conf.base;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => setMouse(null), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const data = state.priceHistory;
    if (data.length < 2) return;

    const w = canvas.width;
    const h = canvas.height;
    const padRight = 70; // space for price axis
    const padTop = 8;
    const padBottom = 20;
    const chartW = w - padRight;
    const chartH = h - padTop - padBottom;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    const toY = (p: number) =>
      padTop + chartH - ((p - min) / range) * chartH;

    const toX = (i: number) => (i / (data.length - 1)) * chartW;

    // ── GRID ──
    drawGrid(ctx, chartW, chartH, padTop, padRight, min, max, conf.decimals);

    // ── PRICE AXIS (right) ──
    drawPriceAxis(ctx, w, h, padRight, padTop, chartH, min, max, conf.decimals);

    // ── TIME AXIS (bottom) ──
    drawTimeAxis(ctx, chartW, h, padBottom, data.length);

    // ── CHART DATA ──
    const isActive = state.isActive;
    const lineColor = isActive
      ? state.currentPnl >= 0 ? '#22c55e' : '#e11d48'
      : '#FF8C00';

    switch (state.chartType) {
      case 'line':
        drawLine(ctx, data, chartW, lineColor, toX, toY);
        break;
      case 'area':
        drawArea(ctx, data, chartW, chartH + padTop, lineColor, toX, toY);
        break;
      case 'candlestick':
        drawCandlestick(ctx, data, chartW, lineColor, toX, toY, conf.decimals);
        break;
      case 'bars':
        drawBars(ctx, data, chartW, chartH + padTop, lineColor, toX, toY);
        break;
    }

    // ── CURRENT PRICE LINE ──
    const lastY = toY(price);
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartW, lastY);
    ctx.strokeStyle = lineColor + '80';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag on right axis
    ctx.fillStyle = lineColor;
    const tagW = padRight - 4;
    const tagH = 18;
    const tagY = lastY - tagH / 2;
    roundRect(ctx, chartW + 2, tagY, tagW, tagH, 3);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(price.toFixed(conf.decimals), chartW + 2 + tagW / 2, lastY + 3.5);
    ctx.textAlign = 'left';

    // ── ENTRY PRICE LINE ──
    if (state.isActive && state.entryPrice > 0) {
      const ey = toY(state.entryPrice);
      ctx.beginPath();
      ctx.moveTo(0, ey);
      ctx.lineTo(chartW, ey);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Entry tag
      ctx.fillStyle = '#fff';
      roundRect(ctx, chartW + 2, ey - 9, tagW, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.entryPrice.toFixed(conf.decimals), chartW + 2 + tagW / 2, ey + 3);
      ctx.textAlign = 'left';
    }

    // ── CROSSHAIR ──
    if (mouse && mouse.x < chartW && mouse.y > padTop && mouse.y < padTop + chartH) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, mouse.y);
      ctx.lineTo(chartW, mouse.y);
      ctx.strokeStyle = '#ffffff30';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical
      ctx.beginPath();
      ctx.moveTo(mouse.x, padTop);
      ctx.lineTo(mouse.x, padTop + chartH);
      ctx.stroke();

      // Price at cursor
      const cursorPrice = min + (1 - (mouse.y - padTop) / chartH) * range;
      ctx.fillStyle = '#333';
      roundRect(ctx, chartW + 2, mouse.y - 9, tagW, 18, 3);
      ctx.fill();
      ctx.fillStyle = '#aaa';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cursorPrice.toFixed(conf.decimals), chartW + 2 + tagW / 2, mouse.y + 3);
      ctx.textAlign = 'left';

      // Time at cursor
      const idx = Math.round((mouse.x / chartW) * (data.length - 1));
      const cursorPrice2 = data[Math.min(idx, data.length - 1)];
      if (cursorPrice2 !== undefined) {
        ctx.fillStyle = '#333';
        const labelW = 40;
        ctx.fillRect(mouse.x - labelW / 2, padTop + chartH + 2, labelW, 16);
        ctx.fillStyle = '#aaa';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`t-${data.length - 1 - idx}`, mouse.x, padTop + chartH + 13);
        ctx.textAlign = 'left';
      }
    }
  }, [state.priceHistory, state.isActive, state.currentPnl, state.chartType, state.entryPrice, mouse, price, conf.decimals]);

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
      <div
        className="chart-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

// ── GRID ──
function drawGrid(
  ctx: CanvasRenderingContext2D,
  chartW: number,
  chartH: number,
  padTop: number,
  _padRight: number,
  min: number,
  max: number,
  _decimals: number
) {
  const rows = 6;
  const range = max - min;
  ctx.strokeStyle = '#ffffff08';
  ctx.lineWidth = 1;
  ctx.font = '9px monospace';

  for (let i = 0; i <= rows; i++) {
    const y = padTop + (chartH / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(chartW, y);
    ctx.stroke();
  }

  const cols = 8;
  for (let i = 0; i <= cols; i++) {
    const x = (chartW / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + chartH);
    ctx.stroke();
  }

  void range;
}

// ── PRICE AXIS ──
function drawPriceAxis(
  ctx: CanvasRenderingContext2D,
  w: number,
  _h: number,
  padRight: number,
  padTop: number,
  chartH: number,
  min: number,
  max: number,
  decimals: number
) {
  const axisX = w - padRight + 8;
  const steps = 6;
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const price = max - ratio * (max - min);
    const y = padTop + ratio * chartH;
    ctx.fillStyle = '#666';
    ctx.fillText(price.toFixed(decimals), axisX, y + 3);
  }
}

// ── TIME AXIS ──
function drawTimeAxis(
  ctx: CanvasRenderingContext2D,
  chartW: number,
  h: number,
  padBottom: number,
  dataLen: number
) {
  const y = h - padBottom + 14;
  const steps = 8;
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#555';

  for (let i = 0; i <= steps; i++) {
    const x = (chartW / steps) * i;
    const idx = Math.round((i / steps) * (dataLen - 1));
    ctx.fillText(`-${dataLen - 1 - idx}`, x, y);
  }
  ctx.textAlign = 'left';
}

// ── LINE ──
function drawLine(
  ctx: CanvasRenderingContext2D,
  data: number[],
  _chartW: number,
  color: string,
  toX: (i: number) => number,
  toY: (p: number) => number
) {
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  data.forEach((p, i) => {
    const x = toX(i);
    const y = toY(p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // End dot
  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ── AREA ──
function drawArea(
  ctx: CanvasRenderingContext2D,
  data: number[],
  _chartW: number,
  totalH: number,
  color: string,
  toX: (i: number) => number,
  toY: (p: number) => number
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, totalH);
  gradient.addColorStop(0, color + '30');
  gradient.addColorStop(0.6, color + '08');
  gradient.addColorStop(1, color + '00');

  ctx.beginPath();
  data.forEach((p, i) => {
    if (i === 0) ctx.moveTo(toX(i), toY(p));
    else ctx.lineTo(toX(i), toY(p));
  });
  ctx.lineTo(toX(data.length - 1), totalH);
  ctx.lineTo(0, totalH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  data.forEach((p, i) => {
    if (i === 0) ctx.moveTo(toX(i), toY(p));
    else ctx.lineTo(toX(i), toY(p));
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // End dot with glow
  const lx = toX(data.length - 1);
  const ly = toY(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx, ly, 8, 0, Math.PI * 2);
  ctx.strokeStyle = color + '40';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ── CANDLESTICK ──
function drawCandlestick(
  ctx: CanvasRenderingContext2D,
  data: number[],
  chartW: number,
  _color: string,
  toX: (i: number) => number,
  toY: (p: number) => number,
  _decimals: number
) {
  const count = data.length;
  const candleW = Math.max(3, (chartW / count) * 0.55);

  for (let i = 0; i < count; i++) {
    const price = data[i];
    const prev = data[Math.max(0, i - 1)];
    const bullish = price >= prev;
    const color = bullish ? '#22c55e' : '#e11d48';

    const x = toX(i);

    const open = prev;
    const close = price;
    const wickExtra = Math.abs(open - close) * 0.35 + Math.abs(open - close) * 0.05;
    const high = Math.max(open, close) + wickExtra;
    const low = Math.min(open, close) - wickExtra;

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

    if (bullish) {
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }
  }
}

// ── BARS ──
function drawBars(
  ctx: CanvasRenderingContext2D,
  data: number[],
  chartW: number,
  totalH: number,
  _color: string,
  toX: (i: number) => number,
  toY: (p: number) => number
) {
  const count = data.length;
  const barW = Math.max(2, (chartW / count) * 0.45);
  const baseY = totalH - 2;

  for (let i = 0; i < count; i++) {
    const price = data[i];
    const prev = data[Math.max(0, i - 1)];
    const bullish = price >= prev;
    const color = bullish ? '#22c55e' : '#e11d48';
    const x = toX(i);
    const y = toY(price);

    ctx.fillStyle = color;
    ctx.fillRect(x - barW / 2, y, barW, baseY - y);
  }
}

// ── ROUNDED RECT HELPER ──
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
