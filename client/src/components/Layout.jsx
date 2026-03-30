import useDeviceDetect from '../hooks/useDeviceDetect';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';

export default function Layout() {
    const { isMobile } = useDeviceDetect(768);

    return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
