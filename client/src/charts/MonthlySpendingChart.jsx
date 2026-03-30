import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlySpendingChart({ data }) {
    const { isDark } = useTheme();
    if (!data || data.length === 0) return <p className="text-muted">No monthly data</p>;

    // Group expenses by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = new Array(12).fill(0);

    data.forEach((d) => {
        if (d.year === currentYear && d.month >= 1 && d.month <= 12) {
            monthlyData[d.month - 1] = d.expense;
        }
    });

    const barColor = isDark ? 'rgba(52, 199, 159, 0.75)' : 'rgba(16, 185, 129, 0.8)';
    const barHover = isDark ? 'rgba(52, 199, 159, 1)' : 'rgba(16, 185, 129, 1)';

    const chartData = {
        labels: MONTH_NAMES,
        datasets: [{
            label: 'Expense',
            data: monthlyData,
            backgroundColor: barColor,
            hoverBackgroundColor: barHover,
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 36,
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
