import sqlite3

db_path = 'C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/ExpenseTracker/expense.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Find the primary user (harenee)
cur.execute("SELECT Id, Email FROM Users WHERE Email LIKE '%haren%' LIMIT 1")
user = cur.fetchone()

if not user:
    # Fallback to the first user
    cur.execute("SELECT Id, Email FROM Users LIMIT 1")
    user = cur.fetchone()

target_user_id = user[0]
print(f"Targeting user: {user[1]} ({target_user_id})")

# Force update all investments to this user and set Status to Active
cur.execute("UPDATE Investments SET UserId=?, Status='Active'", (target_user_id,))
conn.commit()

# Verify
cur.execute("SELECT Name, AssetType, Status, UserId FROM Investments")
print("All Investments Migrated:")
for row in cur.fetchall():
    print(f"  {row[0]} ({row[1]}) -> Status:{row[2]} User:{row[3].upper()}")

conn.close()
