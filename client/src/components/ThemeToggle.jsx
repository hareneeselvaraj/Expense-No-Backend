import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiDroplet } from 'react-icons/fi';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const icons = {
        dark: <FiMoon />,
        light: <FiSun />,
        lavender: <FiDroplet />
    };

    const labels = {
        dark: 'Switch to Light Mode',
        light: 'Switch to Lavender Theme',
        lavender: 'Switch to Dark Mode'
    };

    return (
        <button
            className="theme-cycle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={labels[theme] || 'Toggle Theme'}
        >
            {icons[theme]}
            <span className="theme-cycle-label">
                {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
            </span>
        </button>
    );
}
