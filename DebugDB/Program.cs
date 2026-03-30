using System;
using Microsoft.Data.Sqlite;
Console.WriteLine(""Querying database..."");
try {
    var conn = new SqliteConnection(@""Data Source=C:\Users\haren\Desktop\Expense_Tracker\Expense-Tracker\ExpenseTracker\expense.db"");
    conn.Open();
    var cmd = conn.CreateCommand();
    cmd.CommandText = ""SELECT Id, Name, AssetType, Category, Status, InvestedAmount, UserId FROM Investments"";
    var reader = cmd.ExecuteReader();
    int count = 0;
    while (reader.Read()) {
        count++;
        Console.WriteLine($""[{count}] Name: {reader[""Name""]} | Type: {reader[""AssetType""]} | Cat: {reader[""Category""]} | Status: {reader[""Status""]} | UserId: {reader[""UserId""]}"");
    }
    Console.WriteLine($""Total records: {count}"");
} catch (Exception ex) {
    Console.WriteLine($""Error: {ex.Message}"");
}
