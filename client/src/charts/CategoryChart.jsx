import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS_DARK = [
    'rgba(235, 110, 130, 0.65)', 'rgba(110, 191, 164, 0.6)', 'rgba(170, 130, 210, 0.6)',
    'rgba(140, 150, 170, 0.55)', 'rgba(240, 170, 80, 0.6)', 'rgba(80, 200, 190, 0.6)',
    'rgba(200, 130, 170, 0.55)', 'rgba(150, 180, 110, 0.55)', 'rgba(130, 180, 210, 0.55)',
    'rgba(210, 150, 110, 0.55)',
];

const COLORS_LIGHT = [
    'rgba(235, 87, 110, 0.7)', 'rgba(16, 185, 129, 0.6)', 'rgba(139, 92, 246, 0.55)',
    'rgba(148, 163, 184, 0.6)', 'rgba(245, 158, 11, 0.65)', 'rgba(6, 182, 212, 0.55)',
    'rgba(236, 72, 153, 0.55)', 'rgba(132, 204, 22, 0.55)', 'rgba(37, 99, 235, 0.55)',
    'rgba(234, 88, 12, 0.55)',
];

export default function CategoryChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No category data</p>;

    const colors = isDark ? COLORS_DARK : COLORS_LIGHT;

    const chartData = {
        labels: data.map((d) => d.categoryName),
        datasets: [{
            data: data.map((d) => d.total),
            backgroundColor: data.map((_, i) => colors[i % colors.length]),
            hoverBackgroundColor: data.map((_, i) => colors[i % colors.length].replace(/[\d.]+\)$/, m => `${Math.min(parseFloat(m) + 0.2, 1)})`)),
            borderWidth: 0, hoverOffset: 4,
        }],
    };

    const s = getComputedStyle(document.documentElement);
    const legend = s.getPropertyValue('--chart-legend').trim();
    const ttBg = s.getPropertyValue('--chart-tooltip-bg').trim();
    const ttTitle = s.getPropertyValue('--chart-tooltip-title').trim();
    const ttBody = s.getPropertyValue('--chart-tooltip-body').trim();
    const ttBorder = s.getPropertyValue('--chart-tooltip-border').trim();

    const options = {
        responsive: true, maintainAspectRatio: false, cutout: '72%',
        plugins: {
            legend: { position: 'bottom', labels: { color: legend, padding: 8, usePointStyle: true, pointStyleWidth: 5, boxHeight: 5, font: { size: 9, family: 'Inter', weight: '400' } } },
            tooltip: { backgroundColor: ttBg, titleColor: ttTitle, bodyColor: ttBody, borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { size: 11, weight: '500', family: 'Inter' }, bodyFont: { size: 10, family: 'Inter' }, callbacks: { label: (ctx) => `  ${ctx.label}: ₹${ctx.parsed?.toLocaleString('en-IN')}` } },
        },
    };

    return (
        <div className="chart-container-sm" style={{ height: '240px' }}>
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
