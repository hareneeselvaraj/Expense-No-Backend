import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BAR_COLORS_LIGHT = [
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(16, 185, 129, 0.8)',   // green
    'rgba(239, 68, 68, 0.75)',   // red
    'rgba(139, 92, 246, 0.75)',  // purple
    'rgba(245, 158, 11, 0.8)',   // amber
    'rgba(236, 72, 153, 0.75)',  // pink
];

const BAR_COLORS_DARK = [
    'rgba(96, 165, 250, 0.75)',   // blue
    'rgba(52, 199, 159, 0.75)',   // green
    'rgba(248, 113, 113, 0.7)',   // red
    'rgba(167, 139, 250, 0.7)',   // purple
    'rgba(251, 191, 36, 0.7)',    // amber
    'rgba(244, 114, 182, 0.7)',   // pink
];

export default function BankWiseChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No bank data</p>;

    const colors = isDark ? BAR_COLORS_DARK : BAR_COLORS_LIGHT;

    const chartData = {
        labels: data.map((d) => d.bankMode),
        datasets: [{
            label: 'Spending',
            data: data.map((d) => d.total),
            backgroundColor: data.map((_, i) => colors[i % colors.length]),
            hoverBackgroundColor: data.map((_, i) =>
                colors[i % colors.length].replace(/[\d.]+\)$/, (m) => `${Math.min(parseFloat(m) + 0.2, 1)})`)
            ),
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 52,
        }],
    };

    const s = getComputedStyle(document.documentElement);
    const grid = s.getPropertyValue('--chart-grid').trim();
    const tick = s.getPropertyValue('--chart-tick').trim();
    const ttBg = s.getPropertyValue('--chart-tooltip-bg').trim();
    const ttTitle = s.getPropertyValue('--chart-tooltip-title').trim();
    const ttBody = s.getPropertyValue('--chart-tooltip-body').trim();
    const ttBorder = s.getPropertyValue('--chart-tooltip-border').trim();

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: ttBg, titleColor: ttTitle, bodyColor: ttBody,
                borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8,
                titleFont: { size: 11, weight: '500', family: 'Inter' },
                bodyFont: { size: 10, family: 'Inter' },
                callbacks: {
                    label: (ctx) => `  ${ctx.label}: ₹${ctx.parsed.y?.toLocaleString('en-IN')}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: tick, font: { size: 10, family: 'Inter' } },
            },
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: grid, drawBorder: false },
                ticks: {
                    color: tick,
                    font: { size: 10, family: 'Inter' },
                    callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
                    maxTicksLimit: 5,
                },
            },
        },
    };

    return (
        <div style={{ height: '240px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}
