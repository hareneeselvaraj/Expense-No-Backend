import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CoupleProvider } from './context/CoupleContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageSkeleton from './components/PageSkeleton';

// Lazy load all pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Investments = lazy(() => import('./pages/Investments'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Categories = lazy(() => import('./pages/Categories'));
const Tags = lazy(() => import('./pages/Tags'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const MileageTracker = lazy(() => import('./pages/MileageTracker'));
const Goals = lazy(() => import('./pages/Goals'));
const UpcomingReminders = lazy(() => import('./pages/UpcomingReminders'));
const History = lazy(() => import('./pages/History'));
const Couple = lazy(() => import('./pages/Couple'));
const Stocks = lazy(() => import('./pages/Stocks'));
const MutualFunds = lazy(() => import('./pages/MutualFunds'));
const OtherAssets = lazy(() => import('./pages/OtherAssets'));
const TaxReports = lazy(() => import('./pages/TaxReports'));
const TaxAdvisor = lazy(() => import('./pages/TaxAdvisor'));
const StatementImport = lazy(() => import('./pages/StatementImport'));
const WealthDashboard = lazy(() => import('./pages/WealthDashboard'));
const Migrate = lazy(() => import('./pages/Migrate'));
const Settings = lazy(() => import('./pages/Settings'));

// Simple loading fallback
const PageLoader = () => <PageSkeleton />;

function SIPRunner() {
    const { user } = useAuth();
    useEffect(() => {
        if (user) {
            import('./services/sipCatchup.js').then(m => m.executeSIPCatchup());
        }
    }, [user]);
    return null;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CoupleProvider>
                    <ToastProvider>
                        <BrowserRouter future={{ 
                            v7_startTransition: true, 
                            v7_relativeSplatPath: true,
                            v7_fetcherPersist: true,
                            v7_normalizeFormMethod: true,
                            v7_partialHydration: true,
                            v7_skipActionErrorRevalidation: true
                        }}>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/migrate" element={<Migrate />} />
                                    <Route path="/sips" element={<MutualFunds />} /> {/* Legacy route alias */}
                                    <Route element={<ProtectedRoute><><SIPRunner /><Layout /></></ProtectedRoute>}>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/wealth" element={<WealthDashboard />} />
                                        <Route path="/transactions" element={<Transactions />} />
                                        <Route path="/statement-import" element={<StatementImport />} />
                                        <Route path="/accounts" element={<Accounts />} />
                                        <Route path="/categories" element={<Categories />} />
                                        <Route path="/tags" element={<Tags />} />
                                        <Route path="/budgets" element={<Budgets />} />
                                        <Route path="/investments" element={<Investments />} />
                                        <Route path="/mutual-funds" element={<MutualFunds />} />
                                        <Route path="/stocks" element={<Stocks />} />
                                        <Route path="/other-assets" element={<OtherAssets />} />
                                        <Route path="/tax-reports" element={<TaxReports />} />
                                        <Route path="/tax-advisor" element={<TaxAdvisor />} />
                                        <Route path="/portfolio" element={<Portfolio />} />
                                        <Route path="/mileage" element={<MileageTracker />} />
                                        <Route path="/ai-insights" element={<AIInsights />} />
                                        <Route path="/goals" element={<Goals />} />
                                        <Route path="/reminders" element={<UpcomingReminders />} />
                                        <Route path="/history" element={<History />} />
                                        <Route path="/couple" element={<Couple />} />
                                        <Route path="/settings" element={<Settings />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                    </ToastProvider>
                </CoupleProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
