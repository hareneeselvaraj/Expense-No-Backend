import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CoupleProvider } from './context/CoupleContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Budgets from './pages/Budgets';
import Investments from './pages/Investments';
import Portfolio from './pages/Portfolio';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import AIInsights from './pages/AIInsights';
import MileageTracker from './pages/MileageTracker';
import Goals from './pages/Goals';
import UpcomingReminders from './pages/UpcomingReminders';
import History from './pages/History';
import Couple from './pages/Couple';
import Stocks from './pages/Stocks';
import MutualFunds from './pages/MutualFunds';
import OtherAssets from './pages/OtherAssets';
import TaxReports from './pages/TaxReports';
import TaxAdvisor from './pages/TaxAdvisor';
import StatementImport from './pages/StatementImport';
import WealthDashboard from './pages/WealthDashboard';

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
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/sips" element={<MutualFunds />} /> {/* Legacy route alias */}
                                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </ToastProvider>
                </CoupleProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
