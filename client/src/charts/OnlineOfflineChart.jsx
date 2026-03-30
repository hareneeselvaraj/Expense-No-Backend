import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OnlineOfflineChart({ data }) {
    const { isDark } = useTheme();
    if (!data) return <p className="text-muted">No data</p>;

    const chartData = {
        labels: ['Online', 'Offline'],
        datasets: [{
            data: [data.onlineTotal, data.offlineTotal],
            backgroundColor: isDark
                ? ['rgba(130, 140, 220, 0.4)', 'rgba(210, 170, 100, 0.4)']
                : ['rgba(99, 102, 241, 0.3)', 'rgba(217, 119, 6, 0.3)'],
            hoverBackgroundColor: isDark
                ? ['rgba(130, 140, 220, 0.65)', 'rgba(210, 170, 100, 0.65)']
                : ['rgba(99, 102, 241, 0.5)', 'rgba(217, 119, 6, 0.5)'],
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
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
            legend: { position: 'bottom', labels: { color: legend, padding: 8, usePointStyle: true, pointStyleWidth: 5, boxHeight: 5, font: { size: 9, family: 'Inter', weight: '400' } } },
            tooltip: { backgroundColor: ttBg, titleColor: ttTitle, bodyColor: ttBody, borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { size: 11, weight: '500', family: 'Inter' }, bodyFont: { size: 10, family: 'Inter' }, callbacks: { label: (ctx) => `  ${ctx.label}: ₹${ctx.parsed?.toLocaleString('en-IN')}` } },
        },
    };

    return (
        <div>
            <div className="chart-container-sm" style={{ height: '180px' }}>
                <Doughnut data={chartData} options={options} />
            </div>
            <div className="chart-meta">
                <span>Online: {data.onlineCount} txns</span>
                <span>Offline: {data.offlineCount} txns</span>
            </div>
        </div>
    );
}
