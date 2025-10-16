import type { ChartType } from 'chart.js';

declare module 'chart.js' {

    interface PluginOptionsByType<TType extends ChartType> {
        chartAreaBorder?: {
            borderColor?: string | CanvasGradient | CanvasPattern
            borderWidth?: number,
            borderDash?: number[],
            borderDashOffset?: number
        },
        avatarBarChart?: {
            idFieldName: string,
            containerId: string
        }
    }
}