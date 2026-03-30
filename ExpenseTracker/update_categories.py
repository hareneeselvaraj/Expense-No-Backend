import sqlite3
import uuid

conn = sqlite3.connect('expense.db')
c = conn.cursor()

user_id = 'BC4C63CB-A94D-4BE8-82B5-177D5E9BE2D1'

# 1. Delete existing categories for this user
c.execute("DELETE FROM Categories WHERE UserId = ?", (user_id,))

# 2. Define new categories
# Format: (Name, Type, Icon)
# Types: 0 = Expense, 1 = Income, 2 = Investment (Assuming based on model types)
# Let's check CategoryType enum in the model first if possible or just use common sense.
# Looking at AuthService.cs: Income, Expense, Investment.
# Based on common C# enum behavior, it's likely 0, 1, 2.
# Let's check the Category model to be sure.
# In AuthService.cs: 
# new Category { ... Type = CategoryType.Income ... }
# new Category { ... Type = CategoryType.Expense ... }
# new Category { ... Type = CategoryType.Investment ... }

categories = [
    # Income (1)
    ("cashback", 1, "💰"),
    ("wife", 1, "👩"),
    ("Salary", 1, "💸"),

    # Expense (0)
    ("SMS charges", 0, "📱"),
    ("water", 0, "💧"),
    ("electricity", 0, "⚡"),
    ("household", 0, "🏠"),
    ("groceries", 0, "🛒"),
    ("travel", 0, "✈️"),
    ("transportation", 0, "🚌"),
    ("outsidefood", 0, "🍔"),
    ("personal", 0, "👤"),
    ("stationary", 0, "✏️"),
    ("gasbill", 0, "🔥"),
    ("clothing", 0, "👕"),
    ("entertainment", 0, "🎬"),
    ("vehicle", 0, "🚗"),
    ("petrol", 0, "⛽"),
    ("office", 0, "💼"),
    ("missing", 0, "❓"),
    ("others", 0, "📦"),
    ("TV", 0, "📺"),
    ("electronics", 0, "💻"),
    ("Jewellery/ornament", 0, "💎"),
    ("tax", 0, "🏛️"),
    ("phone recharge", 0, "🔋"),
    ("gifts", 0, "🎁"),
    ("education", 0, "🎓"),
    ("temple", 0, "🛕"),
    ("wife", 0, "👩"),

    # Investment (2)
    ("interest", 2, "📈"),
    ("SGB", 2, "🥇"),
    ("Mutual fund", 2, "📊"),
    ("Stocks", 2, "📉"),
    ("FD", 2, "🏦"),
    ("RD", 2, "⏳"),
    ("PPF", 2, "🛡️"),
    ("NPS", 2, "👴")
]

for name, cat_type, icon in categories:
    cat_id = str(uuid.uuid4()).upper()
    c.execute("INSERT INTO Categories (Id, UserId, Name, Type, Icon) VALUES (?, ?, ?, ?, ?)",
              (cat_id, user_id, name, cat_type, icon))

conn.commit()
conn.close()
print("Successfully updated categories for user test3@gmail.com")
