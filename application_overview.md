# Expense Tracker & Wealth Dashboard
**A Full-Stack Personal Finance & Portfolio Management System**

## Tech Stack
-   **Frontend:** React, Vite, React-Hook-Form, Chart.js, Vanilla CSS styling
-   **Backend:** .NET 8 ASP.NET Core Web API
-   **Database:** SQLite (via Entity Framework Core)
-   **Authentication:** JWT Bearer Tokens

---

## 🏗️ Backend Architecture (`/ExpenseTracker`)

### Core Services
1.  **`PnLCalculationService`**: The heart of the portfolio. Aggregates all user investments, calculates holding periods (LTCG / STCG), automatically fetches batch market data via `PriceFeedService`, and strictly computes real-time `CurrentValue` entirely on the fly.
2.  **`PriceFeedService`**: A caching layer that dynamically scrapes Yahoo Finance (`INR=X`, `TCS.NS`) for global stocks and crypto, and queries `AMFI` for Indian Mutual Funds. Prices are cached in the SQLite `PriceCaches` table (5 min TTL during market, 6 hours outside).
3.  **`SIPService`**: A background hosted service executing daily checks to automatically register systematic Monthly/Yearly mutual fund and RD installments.
4.  **`DashboardService`**: Aggregates general expense tracking metrics (Income, Expense, Transfer) vs Budget, while segregating Portfolio data explicitly.
5.  **`InvestmentService`**: Generic CRUD handler translating broad asset categories (Deposit, Market, Physical) into specific database records.

### Controllers
-   `PortfolioAnalyticsController` (Serves the dashboard charting and breakdown)
-   `InvestmentController` (CRUD)
-   `PriceFeedController` (Manual price forcing and API checks)
-   *Standard controllers for auth, budget, and expenses.*

---

## 🎨 Frontend Architecture (`/client`)

### Dashboards & Views
1.  **Stocks & Equity (`Stocks.jsx`)**: Dedicated dashboard for `AssetType = "Stock"`. Shows Doughnut charts for stock allocation, total PnL, and live prices.
2.  **Mutual Funds & SIPs (`SIPs.jsx`)**: Dedicated dashboard tracking mutual fund NAVs and highlighting active/paused SIP execution dates.
3.  **Other Assets (`OtherAssets.jsx`)**: Consolidated tracking of fixed-income and physical assets without public tickers (e.g. FDs, RDs, Real Estate, Gold).
4.  **Manage All (`Investments.jsx`)**: A core master settings page displaying generic tabulated logs of every single transaction.

### Component Design
-   **Inline Modals**: Uses localized React-Hook-Form wrappers (e.g., `AddAssetModal` isolated perfectly to each Dashboard to constrain inputs).
-   **ThemeContext**: Controls dark/light mode CSS variable toggles.
-   **Toast**: Native notification provider for immediate API feedback.

---

## 🛠️ Data Models (`ExpenseTracker/Models`)
-   **`Investment`**: Base trackable asset
    -   `UserId` (Security binding)
    -   `AssetType` (Stock, Mutual Fund, FD, Real Estate, etc.)
    -   `Ticker` (Used for fetching dynamic prices)
    -   `Status` ("Active", "Matured", etc.)
-   **`SIP`** & **`SIPHistory`**: Manages the schedule and transactional logs of automated installments.
-   **`AssetTransaction`**: General ledger for Buys/Sells for deep Capital Gains calculations.
