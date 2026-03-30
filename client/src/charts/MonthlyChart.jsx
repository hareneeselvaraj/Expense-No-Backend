import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Custom plugin to draw value labels next to each data point
const pointDataLabelPlugin = {
    id: 'pointDataLabels',
    afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((point, index) => {
                const value = dataset.data[index];
                ctx.save();
                ctx.fillStyle = dataset.borderColor;
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                // If value is 0, show label above the point; otherwise show above
                const yOffset = point.y < chartArea.top + 20 ? 14 : -10;
                ctx.textBaseline = yOffset < 0 ? 'bottom' : 'top';
                const label = value >= 1000
                    ? `₹${(value / 1000).toFixed(1)}k`
                    : `₹${Number(value).toLocaleString('en-IN')}`;
                ctx.fillText(label, point.x, point.y + yOffset);
                ctx.restore();
            });
        });
    },
};

export default function MonthlyChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No monthly data</p>;

    const sorted = [...data].reverse();
    const labels = sorted.map((d) => `${d.month}/${d.year}`);

    // Always show dots — larger when few data points
    const pr = sorted.length <= 2 ? 6 : 3;

    const incomeColor = isDark ? 'rgba(110, 191, 164, 1)' : 'rgba(5, 150, 105, 0.9)';
    const expenseColor = isDark ? 'rgba(220, 120, 120, 1)' : 'rgba(220, 38, 38, 0.8)';
    const investColor = isDark ? 'rgba(210, 170, 100, 1)' : 'rgba(217, 119, 6, 0.8)';

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Income',
                data: sorted.map((d) => d.income),
                borderColor: incomeColor,
                backgroundColor: isDark ? 'rgba(110, 191, 164, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                borderWidth: 2, tension: 0.4, pointRadius: pr,
                pointBackgroundColor: incomeColor,
                pointBorderColor: '#fff', pointBorderWidth: 2,
                pointHoverRadius: 8, fill: true,
            },
            {
                label: 'Expense',
                data: sorted.map((d) => d.expense),
                borderColor: expenseColor,
                backgroundColor: isDark ? 'rgba(220, 120, 120, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                borderWidth: 2, tension: 0.4, pointRadius: pr,
                pointBackgroundColor: expenseColor,
                pointBorderColor: '#fff', pointBorderWidth: 2,
                pointHoverRadius: 8, fill: true,
            },
            {
                label: 'Investment',
                data: sorted.map((d) => d.investment),
                borderColor: investColor,
                backgroundColor: isDark ? 'rgba(210, 170, 100, 0.08)' : 'rgba(217, 119, 6, 0.08)',
                borderWidth: 2, tension: 0.4, pointRadius: pr,
                pointBackgroundColor: investColor,
                pointBorderColor: '#fff', pointBorderWidth: 2,
                pointHoverRadius: 8, fill: true,
            },
        ],
    };

    const s = getComputedStyle(document.documentElement);
    const grid = s.getPropertyValue('--chart-grid').trim();
    const tick = s.getPropertyValue('--chart-tick').trim();
    const legend = s.getPropertyValue('--chart-legend').trim();
    const ttBg = s.getPropertyValue('--chart-tooltip-bg').trim();
    const ttTitle = s.getPropertyValue('--chart-tooltip-title').trim();
    const ttBody = s.getPropertyValue('--chart-tooltip-body').trim();
    const ttBorder = s.getPropertyValue('--chart-tooltip-border').trim();

    // Smart tick formatting based on data magnitude
    const maxVal = Math.max(...sorted.flatMap((d) => [d.income, d.expense, d.investment]), 0);
    const tickCallback = maxVal >= 1000
        ? (v) => `₹${(v / 1000).toFixed(0)}k`
        : (v) => `₹${v.toLocaleString('en-IN')}`;

    const options = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 20 } },
        plugins: {
            legend: { position: 'bottom', labels: { color: legend, padding: 10, usePointStyle: true, pointStyleWidth: 6, boxHeight: 6, font: { size: 10, family: 'Inter', weight: '400' } } },
            tooltip: {
                backgroundColor: ttBg, titleColor: ttTitle, bodyColor: ttBody, borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8,
                titleFont: { size: 11, weight: '500', family: 'Inter' }, bodyFont: { size: 10, family: 'Inter' },
                callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ₹${ctx.parsed.y?.toLocaleString('en-IN')}` },
            },
        },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: tick, font: { size: 9, family: 'Inter' }, maxRotation: 0 } },
            y: { beginAtZero: true, border: { display: false }, grid: { color: grid, drawBorder: false }, ticks: { color: tick, font: { size: 9, family: 'Inter' }, callback: tickCallback, maxTicksLimit: 5 } },
        },
    };

    return (
        <div className="chart-container" style={{ height: '220px' }}>
            <Line data={chartData} options={options} plugins={[pointDataLabelPlugin]} />
        </div>
    );
}

