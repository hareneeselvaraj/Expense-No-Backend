namespace ExpenseTracker.Models;

public enum AccountType
{
    Bank,
    CreditCard,
    Wallet,
    Cash,
    Investment
}

public enum CategoryType
{
    Income,
    Expense,
    Investment
}

public enum TransactionType
{
    Income,
    Expense,
    Investment,
    Transfer,
    Withdraw
}

public enum OnlineOffline
{
    Online,
    Offline
}

public enum BankMode
{
    GPay,
    NetBanking,
    Debit,
    Credit,
    Other
}
