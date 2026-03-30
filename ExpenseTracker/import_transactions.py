"""
Transaction Importer with AI-Powered Categorization
Reads CSV/Excel bank statements & inserts into ExpenseTracker SQLite DB.
Uses keyword-based AI categorization (free, no API needed).
"""

import csv
import sqlite3
import uuid
import re
import sys
import os
from datetime import datetime

# ─── CONFIG ───────────────────────────────────────────────────────────
DB_PATH = r'c:\Users\haren\Desktop\Expense_Tracker\Expense-Tracker\ExpenseTracker\expense.db'
USER_ID = 'BC4C63CB-A94D-4BE8-823A-B52A0EB42C1A'  # Harenee
DEFAULT_ACCOUNT_ID = '8772FE4A-A1C1-4759-A07E-BD42DA22D2D5'  # HDFC

# ─── AI CATEGORIZATION ENGINE ─────────────────────────────────────────
# Smart keyword-to-category mapping (acts as a lightweight AI classifier)
CATEGORY_RULES = [
    # Food & Dining
    {
        'keywords': ['swiggy', 'zomato', 'food', 'restaurant', 'cafe', 'pizza', 'burger',
                      'chicken', 'biryani', 'egg', 'milk', 'bread', 'tea', 'coffee',
                      'hotel', 'mess', 'canteen', 'dine', 'eat', 'liver', 'mutton',
                      'fish', 'rice'],
        'category_name': 'Food',
        'type': 'Expense',
    },
    # Transport
    {
        'keywords': ['uber', 'ola', 'rapido', 'petrol', 'diesel', 'fuel', 'metro',
                      'bus', 'train', 'irctc', 'redbus', 'cab', 'auto', 'parking',
                      'toll', 'fastag'],
        'category_name': 'Transport',
        'type': 'Expense',
    },
    # Shopping
    {
        'keywords': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'shopping',
                      'mall', 'store', 'mart', 'retail', 'reliance', 'dmart',
                      'bigbasket', 'blinkit', 'instamart', 'zepto'],
        'category_name': 'Shopping',
        'type': 'Expense',
    },
    # Rent & Bills
    {
        'keywords': ['rent', 'electricity', 'water', 'gas', 'bill', 'maintenance',
                      'society', 'broadband', 'wifi', 'internet', 'airtel', 'jio',
                      'vodafone', 'bsnl', 'recharge', 'dth', 'tata'],
        'category_name': 'Rent & Bills',
        'type': 'Expense',
    },
    # Entertainment
    {
        'keywords': ['netflix', 'hotstar', 'prime', 'spotify', 'youtube', 'movie',
                      'theatre', 'game', 'play', 'bookmyshow', 'pvr', 'inox'],
        'category_name': 'Entertainment',
        'type': 'Expense',
    },
    # Health
    {
        'keywords': ['hospital', 'doctor', 'pharma', 'medical', 'medicine', 'apollo',
                      'medplus', 'netmed', 'health', 'gym', 'fitness', 'clinic'],
        'category_name': 'Health',
        'type': 'Expense',
    },
    # Education
    {
        'keywords': ['college', 'university', 'school', 'tuition', 'course', 'udemy',
                      'coursera', 'book', 'exam', 'fees'],
        'category_name': 'Education',
        'type': 'Expense',
    },
    # Investments / Trading
    {
        'keywords': ['trade', 'eba', 'eq trade', 'mutual fund', 'sip', 'zerodha',
                      'groww', 'upstox', 'angel', 'nse', 'bse', 'share', 'dividend',
                      'stock'],
        'category_name': 'Food',  # Will be overridden below for investments
        'type': 'Expense',
        'override_type': 'Investment',
    },
    # Salary / Income
    {
        'keywords': ['salary', 'credit', 'refund', 'cashback', 'reward', 'interest',
                      'dividend'],
        'category_name': 'Salary',
        'type': 'Income',
    },
]

# ─── AI DESCRIPTION GENERATOR ────────────────────────────────────────
def generate_smart_description(raw_remarks):
    """
    AI-powered description generator.
    Cleans up raw bank remarks into human-readable descriptions.
    """
    if not raw_remarks:
        return "Transaction"
    
    remarks = raw_remarks.strip()
    
    # UPI Transaction pattern
    upi_match = re.match(
        r'UPI/([^/]+)/([^/]+)/([^/]*)/([^/]*)',
        remarks, re.IGNORECASE
    )
    if upi_match:
        merchant = upi_match.group(1).strip().title()
        purpose = upi_match.group(3).strip().title() if upi_match.group(3) else ''
        if purpose:
            return f"UPI Payment to {merchant} - {purpose}"
        return f"UPI Payment to {merchant}"
    
    # EBA / Equity Trade pattern
    if remarks.upper().startswith('EBA/'):
        trade_match = re.match(r'EBA/EQ Trade (\d{2}\w{3})/(\d+)', remarks)
        if trade_match:
            trade_date = trade_match.group(1)
            return f"Equity Trade on {trade_date}"
        return "Equity/Stock Trade"
    
    # NEFT/RTGS/IMPS
    neft_match = re.match(r'(NEFT|RTGS|IMPS)/([^/]+)', remarks, re.IGNORECASE)
    if neft_match:
        transfer_type = neft_match.group(1).upper()
        details = neft_match.group(2).strip().title()
        return f"{transfer_type} Transfer - {details}"
    
    # ATM Withdrawal
    if 'ATM' in remarks.upper():
        return "ATM Cash Withdrawal"
    
    # Salary credit
    if 'salary' in remarks.lower():
        return "Salary Credit"
    
    # Generic cleanup: remove long alphanumeric strings (reference numbers)
    cleaned = re.sub(r'[A-Fa-f0-9]{20,}', '', remarks)
    cleaned = re.sub(r'/+', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    if len(cleaned) < 3:
        return remarks[:100]
    
    return cleaned[:120]


def categorize_transaction(remarks, is_deposit):
    """
    AI categorizer: matches transaction remarks against keyword rules.
    Returns (category_name, transaction_type)
    """
    if not remarks:
        if is_deposit:
            return ('Salary', 'Income')
        return ('Shopping', 'Expense')
    
    remarks_lower = remarks.lower()
    
    # Check salary/income keywords first for deposits
    if is_deposit:
        return ('Salary', 'Income')
    
    # Match against rules
    for rule in CATEGORY_RULES:
        for kw in rule['keywords']:
            if kw in remarks_lower:
                cat_name = rule['category_name']
                tx_type = rule.get('override_type', rule['type'])
                return (cat_name, tx_type)
    
    # Default for expenses
    return ('Shopping', 'Expense')


def get_category_id(conn, user_id, category_name, category_type):
    """Look up category ID from database, matching name and type."""
    row = conn.execute(
        "SELECT Id FROM Categories WHERE UserId = ? AND Name = ? AND Type = ? LIMIT 1",
        (user_id, category_name, category_type)
    ).fetchone()
    
    if row:
        return row[0]
    
    # Fallback: try just by name
    row = conn.execute(
        "SELECT Id FROM Categories WHERE UserId = ? AND Name = ? LIMIT 1",
        (user_id, category_name)
    ).fetchone()
    
    if row:
        return row[0]
    
    # Last resort: first category of matching type
    row = conn.execute(
        "SELECT Id FROM Categories WHERE UserId = ? AND Type = ? LIMIT 1",
        (user_id, category_type)
    ).fetchone()
    
    if row:
        return row[0]
    
    # Absolute fallback
    row = conn.execute(
        "SELECT Id FROM Categories WHERE UserId = ? LIMIT 1",
        (user_id,)
    ).fetchone()
    return row[0] if row else None


def parse_csv(file_path):
    """Parse CSV bank statement and return list of transaction dicts."""
    transactions = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        print(f"  CSV Headers: {headers}")
        
        for row_num, row in enumerate(reader, start=2):
            # Find date column (fuzzy)
            date_val = None
            for key in row:
                if key and 'date' in key.lower():
                    date_val = row[key]
                    break
            
            if not date_val or not date_val.strip():
                continue
            
            # Parse date (try multiple formats)
            date_obj = None
            for fmt in ['%d.%m.%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y']:
                try:
                    date_obj = datetime.strptime(date_val.strip(), fmt)
                    break
                except ValueError:
                    continue
            
            if not date_obj:
                print(f"  [SKIP] Row {row_num}: Cannot parse date '{date_val}'")
                continue
            
            # Find remarks column (fuzzy)
            remarks = ''
            for key in row:
                if key and 'remark' in key.lower():
                    remarks = (row[key] or '').strip()
                    break
            
            # Find withdrawal column (fuzzy)
            withdrawal = 0
            for key in row:
                if key and 'withdrawal' in key.lower():
                    val = (row[key] or '').strip().replace(',', '')
                    if val:
                        try:
                            withdrawal = float(val)
                        except ValueError:
                            pass
                    break
            
            # Find deposit column (fuzzy)
            deposit = 0
            for key in row:
                if key and 'deposit' in key.lower():
                    val = (row[key] or '').strip().replace(',', '')
                    if val:
                        try:
                            deposit = float(val)
                        except ValueError:
                            pass
                    break
            
            is_deposit = deposit > 0
            amount = deposit if is_deposit else withdrawal
            
            if amount <= 0:
                print(f"  [SKIP] Row {row_num}: No valid amount found")
                continue
            
            # AI Categorization
            cat_name, tx_type = categorize_transaction(remarks, is_deposit)
            
            # AI Description
            description = generate_smart_description(remarks)
            
            transactions.append({
                'date': date_obj.strftime('%Y-%m-%dT00:00:00'),
                'amount': round(amount, 2),
                'type': tx_type,
                'category_name': cat_name,
                'description': description,
                'remarks_raw': remarks,
                'online_offline': 'Online' if 'UPI' in remarks.upper() else 'Offline',
                'bank_mode': 'GPay' if 'UPI' in remarks.upper() else '',
            })
    
    return transactions


def insert_transactions(transactions, account_id=DEFAULT_ACCOUNT_ID):
    """Insert parsed transactions into the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    inserted = 0
    
    for tx in transactions:
        try:
            cat_id = get_category_id(conn, USER_ID, tx['category_name'], tx['type'])
            if not cat_id:
                print(f"  [ERROR] No category found for {tx['category_name']} / {tx['type']}")
                continue
            
            tx_id = str(uuid.uuid4()).upper()
            
            conn.execute("""
                INSERT INTO Transactions 
                (Id, AccountId, Amount, BankMode, CategoryId, Date, Description, 
                 IsAutoDebit, IsMonitor, OnlineOffline, Type, UserId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                tx_id,
                account_id,
                tx['amount'],
                tx['bank_mode'],
                cat_id,
                tx['date'],
                tx['description'],
                0,  # IsAutoDebit
                0,  # IsMonitor
                tx['online_offline'],
                tx['type'],
                USER_ID,
            ))
            inserted += 1
            print(f"  [OK] {tx['date'][:10]}  Rs.{tx['amount']:>10,.2f}  {tx['type']:<10}  {tx['category_name']:<15}  {tx['description']}")
        
        except Exception as e:
            print(f"  [ERROR] {e}")
    
    conn.commit()
    conn.close()
    return inserted


def main():
    if len(sys.argv) < 2:
        csv_path = r'c:\Users\haren\Desktop\Expense_Tracker\Expense-Tracker\ExpenseTracker\sample.csv'
    else:
        csv_path = sys.argv[1]
    
    account_id = DEFAULT_ACCOUNT_ID
    if len(sys.argv) >= 3:
        account_id = sys.argv[2]
    
    if not os.path.exists(csv_path):
        print(f"Error: File not found: {csv_path}")
        sys.exit(1)
    
    print(f"\n{'='*70}")
    print(f"  Transaction Importer with AI Categorization")
    print(f"{'='*70}")
    print(f"  File:    {csv_path}")
    print(f"  Account: {account_id}")
    print(f"  User:    Harenee ({USER_ID[:8]}...)")
    print(f"{'='*70}\n")
    
    # Step 1: Parse
    print("[1/3] Parsing CSV file...")
    transactions = parse_csv(csv_path)
    print(f"  Found {len(transactions)} valid transactions.\n")
    
    if not transactions:
        print("No transactions found to import. Check file format.")
        sys.exit(0)
    
    # Step 2: AI Summary
    print("[2/3] AI Categorization Summary:")
    expense_total = sum(t['amount'] for t in transactions if t['type'] == 'Expense')
    income_total = sum(t['amount'] for t in transactions if t['type'] == 'Income')
    invest_total = sum(t['amount'] for t in transactions if t['type'] == 'Investment')
    print(f"  Total Expenses:    Rs.{expense_total:,.2f}")
    print(f"  Total Income:      Rs.{income_total:,.2f}")
    print(f"  Total Investments: Rs.{invest_total:,.2f}")
    print()
    
    # Step 3: Insert
    print("[3/3] Inserting into database...")
    count = insert_transactions(transactions, account_id)
    print(f"\n{'='*70}")
    print(f"  SUCCESS: Imported {count}/{len(transactions)} transactions!")
    print(f"  Refresh your browser to see the updates.")
    print(f"{'='*70}\n")


if __name__ == '__main__':
    main()
