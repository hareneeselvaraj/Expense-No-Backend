import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function YearlyTrendChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No yearly data</p>;

    const sorted = [...data].sort((a, b) => a.year - b.year);

    const lineColor = isDark ? 'rgba(52, 199, 159, 1)' : 'rgba(16, 185, 129, 1)';
    const fillColor = isDark ? 'rgba(52, 199, 159, 0.08)' : 'rgba(16, 185, 129, 0.06)';

    const chartData = {
        labels: sorted.map((d) => d.year.toString()),
        datasets: [{
            label: 'Expense',
            data: sorted.map((d) => d.expense),
            borderColor: lineColor,
            backgroundColor: fillColor,
            borderWidth: 2.5,
            tension: 0.35,
            pointRadius: 5,
            pointBackgroundColor: lineColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            fill: true,
        }],
    };

    const s = getComputedStyle(document.documentElement);
    const grid = s.getPropertyValue('--chart-grid').trim();
    const tick = s.getPropertyValue('--chart-tick').trim();
    const ttBg = s.getPropertyValue('--chart-tooltip-bg').trim();
    const ttTitle = s.getPropertyValue('--chart-tooltip-title').trim();
    const ttBody = s.getPropertyValue('--chart-tooltip-body').trim();
    const ttBorder = s.getPropertyValue('--chart-tooltip-border').trim();

    const maxVal = Math.max(...sorted.map((d) => d.expense), 0);
    const tickCallback = maxVal >= 1000
        ? (v) => `${(v / 1000).toFixed(0)}k`
        : (v) => `₹${v.toLocaleString('en-IN')}`;

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
                    label: (ctx) => `  Expense: ₹${ctx.parsed.y?.toLocaleString('en-IN')}`,
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
                    callback: tickCallback,
                    maxTicksLimit: 5,
                },
            },
        },
    };

    return (
        <div style={{ height: '240px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
}
