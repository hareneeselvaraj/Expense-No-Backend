namespace ExpenseTracker.Services.Interfaces;

public interface IEmailService
{
    Task SendBudgetAlertAsync(string recipientEmail, string recipientName,
        string categoryName, decimal budgetAmount, decimal amountSpent,
        int month, int year);
    Task SendWelcomeEmailAsync(string recipientEmail, string recipientName);
    Task SendCoupleInviteAsync(string recipientEmail, string inviteCode, string inviterName);
}
