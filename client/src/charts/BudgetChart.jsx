import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BudgetChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No budget data</p>;

    const labels = data.map((d) => `${d.categoryName} (${d.month}/${d.year})`);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Budget',
                data: data.map((d) => d.budgetAmount),
                backgroundColor: isDark ? 'rgba(130, 140, 220, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                hoverBackgroundColor: isDark ? 'rgba(130, 140, 220, 0.5)' : 'rgba(99, 102, 241, 0.35)',
                borderRadius: 8, borderSkipped: false, barThickness: 10,
            },
            {
                label: 'Actual',
                data: data.map((d) => d.actualSpent),
                backgroundColor: isDark ? 'rgba(210, 115, 115, 0.3)' : 'rgba(220, 38, 38, 0.18)',
                hoverBackgroundColor: isDark ? 'rgba(210, 115, 115, 0.5)' : 'rgba(220, 38, 38, 0.35)',
                borderRadius: 8, borderSkipped: false, barThickness: 10,
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

    const options = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { position: 'bottom', labels: { color: legend, padding: 10, usePointStyle: true, pointStyleWidth: 6, boxHeight: 6, font: { size: 10, family: 'Inter', weight: '400' } } },
            tooltip: { backgroundColor: ttBg, titleColor: ttTitle, bodyColor: ttBody, borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { size: 11, weight: '500', family: 'Inter' }, bodyFont: { size: 10, family: 'Inter' }, callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ₹${ctx.parsed.x?.toLocaleString('en-IN')}` } },
        },
        scales: {
            x: { beginAtZero: true, border: { display: false }, grid: { color: grid, drawBorder: false }, ticks: { color: tick, font: { size: 9, family: 'Inter' }, callback: (v) => `₹${(v / 1000).toFixed(0)}k`, maxTicksLimit: 5 } },
            y: { border: { display: false }, grid: { display: false }, ticks: { color: legend, font: { size: 9, family: 'Inter' } } },
        },
    };

    return (
        <div className="chart-container" style={{ height: '220px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}
