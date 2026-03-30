# Mileage Tracker Documentation

The **Mileage Tracker** is a modular component designed to help users efficiently manage vehicle performance, fuel costs, and maintenance schedules. 

## 🚗 Core Features

### 1. Vehicle Management
Users can maintain a profile for each vehicle they own:
- **Vehicle Profiles**: Names, Registration Numbers, and Icons (Car/Bike).
- **Fuel Types**: Support for Petrol, Diesel, Electric, and CNG.
- **Service Intervals**: Set a KM-based interval to receive maintenance reminders.

### 2. Fuel Log Tracking
The "Magic Button" of the tracker is the Fuel Log:
- **Odometer Readings**: Track multi-vehicle progress.
- **Cost Analysis**: Automatic calculation of **Price per Liter (₹/L)**.
- **Distance & Mileage**: Each entry calculates the distance traveled since the previous log and the resulting **km/L efficiency**.

### 3. Smart Analytics & Trends
- **Total Distance & Spending**: Aggregated stats for lifetime or monthly spans.
- **Efficiency Trends**: A visual chart (Line Graph) showing avg mileage (km/L) and fuel spend (₹) over the last 12 months.
- **Performance Breakdown**: Per-vehicle summary cards showing total distance, cost per km, and latest odometer.

### 4. Automatic Alerts 🔔
The system proactively alerts users based on their trends:
- **Mileage Drop**: Detects if recent performance is >20% below the vehicle's average.
- **Service Due**: Notifies users when they are within 500km of their service interval.
- **Cost Spike**: Flagging fuel prices that are >15% higher than the historical average.

---

## 🛠️ Technical Architecture

### Backend (C# .NET)
- **Controller**: `MileageController.cs` (Exposes RESTful endpoints).
- **Service Layer**: `MileageService.cs` (Handles complex arithmetic for mileage and trend generation).
- **Database Model**: `Vehicle.cs` and `FuelEntry.cs`.
- **DTOs**: Separate models for creating, updating, and summarizing data.

### Frontend (React/Vite)
- **Main Page**: `MileageTracker.jsx` (A unified dashboard with stats, charts, and logs).
- **Charts**: Powered by `Chart.js` for high-performance trend visualization.
- **Components**: `FuelCoach.jsx` (AI-driven insights for fuel efficiency tips).

## 🚀 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/mileage/vehicles` | List all tracked vehicles. |
| `POST` | `/api/mileage/vehicles` | Add a new vehicle. |
| `GET` | `/api/mileage/fuel-entries` | List all logs (filter by `vehicleId`). |
| `POST` | `/api/mileage/fuel-entries` | Log a new fuel filling. |
| `GET` | `/api/mileage/summary` | Get aggregated stats & alerts. |

---
*This module is part of the local self-hosted Expense Tracker.*
