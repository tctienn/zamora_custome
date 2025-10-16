import type { Chart, Plugin } from 'chart.js';

const chartAreaBorder: Plugin = {
  id: 'chartAreaBorder',
  beforeDraw(chart: Chart, args: NonNullable<unknown>, options: {
        borderColor: string | CanvasGradient | CanvasPattern
        borderWidth: number,
        borderDash: number[],
        borderDashOffset: number
    }) {
    const { ctx, chartArea: { left, top, width, height } } = chart;
    ctx.save();
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  },
};