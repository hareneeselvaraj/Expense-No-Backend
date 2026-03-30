import sqlite3

db_path = 'C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/ExpenseTracker/expense.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Update known missing tickers based on user screenshots and previous logs
cur.execute("UPDATE Investments SET Ticker = 'TCS.NS' WHERE Name LIKE '%TCS%' AND (Ticker IS NULL OR Ticker = '')")
cur.execute("UPDATE Investments SET Ticker = 'INFY.NS' WHERE Name LIKE '%Infosys%' AND (Ticker IS NULL OR Ticker = '')")
cur.execute("UPDATE Investments SET Ticker = '122639' WHERE Name LIKE '%Parag Parikh%' AND (Ticker IS NULL OR Ticker = '')")
conn.commit()

cur.execute("SELECT Name, Ticker FROM Investments WHERE AssetType IN ('Stock', 'MF', 'Mutual Fund')")
print("Updated Investments:")
for row in cur.fetchall():
    print(f"  {row[0]} -> {row[1]}")

conn.close()
