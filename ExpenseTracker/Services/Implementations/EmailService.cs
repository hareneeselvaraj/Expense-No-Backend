using MailKit.Net.Smtp;
using MimeKit;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendBudgetAlertAsync(string recipientEmail, string recipientName,
        string categoryName, decimal budgetAmount, decimal amountSpent,
        int month, int year)
    {
        var smtp = _config.GetSection("SmtpSettings");
        var senderEmail = smtp["SenderEmail"]!;
        var senderName = smtp["SenderName"] ?? "Expense Tracker";
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"] ?? "587");
        var appPassword = smtp["AppPassword"]!.Replace(" ", "");

        Console.WriteLine($"[EMAIL] Preparing to send budget alert to {recipientEmail}");

        var monthName = new DateTime(year, month, 1).ToString("MMMM yyyy");
        var overBy = amountSpent - budgetAmount;

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(recipientName, recipientEmail));
        message.Subject = $"⚠️ Budget Alert: {categoryName} exceeded for {monthName}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1d27; color: #e4e6ef; border-radius: 12px; overflow: hidden;"">
                <div style=""background: linear-gradient(135deg, #6366f1, #ec4899); padding: 24px 28px;"">
                    <h1 style=""margin: 0; font-size: 20px; color: #fff;"">⚠️ Budget Alert</h1>
                </div>
                <div style=""padding: 28px;"">
                    <p style=""margin: 0 0 8px; color: #8b8fa3; font-size: 14px;"">Hi {recipientName},</p>
                    <p style=""margin: 0 0 20px; font-size: 15px; line-height: 1.5;"">
                        Your spending in <strong style=""color: #6366f1;"">{categoryName}</strong> has exceeded the budget for <strong>{monthName}</strong>.
                    </p>
                    <div style=""background: #0f1117; border-radius: 8px; padding: 20px; margin-bottom: 20px;"">
                        <table style=""width: 100%; border-collapse: collapse; font-size: 14px;"">
                            <tr>
                                <td style=""padding: 8px 0; color: #8b8fa3;"">Budget</td>
                                <td style=""padding: 8px 0; text-align: right; font-weight: 700;"">₹{budgetAmount:N2}</td>
                            </tr>
                            <tr>
                                <td style=""padding: 8px 0; color: #8b8fa3;"">Spent</td>
                                <td style=""padding: 8px 0; text-align: right; font-weight: 700; color: #ef4444;"">₹{amountSpent:N2}</td>
                            </tr>
                            <tr style=""border-top: 1px solid #2a2e3d;"">
                                <td style=""padding: 8px 0; color: #8b8fa3;"">Over by</td>
                                <td style=""padding: 8px 0; text-align: right; font-weight: 700; color: #ef4444;"">₹{overBy:N2}</td>
                            </tr>
                        </table>
                    </div>
                    <p style=""margin: 0; font-size: 13px; color: #8b8fa3;"">
                        Review your spending in the <a href=""http://localhost:5173/budgets"" style=""color: #6366f1; text-decoration: none;"">Budgets</a> page.
                    </p>
                </div>
                <div style=""padding: 16px 28px; background: #141720; font-size: 12px; color: #8b8fa3; text-align: center;"">
                    Expense Tracker — Automated Budget Alert
                </div>
            </div>"
        };

        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            _logger.LogInformation("[SMTP] Connecting to {Host}:{Port} with SSL/TLS...", host, port);
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);

            _logger.LogInformation("[SMTP] Authenticating as {Email}...", senderEmail);
            await client.AuthenticateAsync(senderEmail, appPassword);

            _logger.LogInformation("[SMTP] Sending email message...");
            await client.SendAsync(message);

            await client.DisconnectAsync(true);

            _logger.LogInformation("Budget alert email sent to {Email} for category {Category}", recipientEmail, categoryName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send budget alert email to {Email}", recipientEmail);
        }
    }

    public async Task SendWelcomeEmailAsync(string recipientEmail, string recipientName)
    {
        var smtp = _config.GetSection("SmtpSettings");
        var senderEmail = smtp["SenderEmail"]!;
        var senderName = smtp["SenderName"] ?? "Expense Tracker";
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"] ?? "587");
        var appPassword = smtp["AppPassword"]!.Replace(" ", "");

        Console.WriteLine($"[EMAIL] Preparing to send welcome email to {recipientEmail}");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(recipientName, recipientEmail));
        message.Subject = "✨ Welcome to Expense Tracker!";

        var welcomeText = "We're thrilled to have you on board! You can now start tracking your expenses on the go and gain full control over your financial health.";
        var greeting = $"Hi {recipientName},";
        var headerGradient = "linear-gradient(135deg, #6366f1, #ec4899)";
        var headerIcon = "🚀";
        var buttonColor = "#6366f1";

        if (recipientName.Equals("Ghone", StringComparison.OrdinalIgnoreCase))
        {
            greeting = "Hi yaswanth,";
            welcomeText = "I know your wife is your life so you dont have time to track your expense let us help welcome to the expense tracker";
            headerGradient = "linear-gradient(135deg, #f43f5e, #ec4899)"; // Warm pink/red for Ghone
            headerIcon = "❤️";
            buttonColor = "#f43f5e";
        }

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1d27; color: #e4e6ef; border-radius: 12px; overflow: hidden;"">
                <div style=""background: {headerGradient}; padding: 40px 28px; text-align: center;"">
                    <div style=""font-size: 48px; margin-bottom: 20px;"">{headerIcon}</div>
                    <h1 style=""margin: 0; font-size: 24px; color: #fff; letter-spacing: -0.5px;"">Welcome to Expense Tracker</h1>
                </div>
                <div style=""padding: 32px 28px;"">
                    <p style=""margin: 0 0 12px; color: #8b8fa3; font-size: 15px;"">{greeting}</p>
                    <p style=""margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #e4e6ef;"">
                        {welcomeText}
                    </p>
                    
                    <div style=""background: #0f1117; border-radius: 12px; padding: 24px; margin-bottom: 28px; border: 1px solid #2a2e3d;"">
                        <h3 style=""margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: {(recipientName.Equals("Ghone", StringComparison.OrdinalIgnoreCase) ? "#f43f5e" : "#6366f1")};"">Quick Start Tips</h3>
                        <ul style=""margin: 0; padding: 0; list-style: none; font-size: 14px; color: #8b8fa3;"">
                            <li style=""margin-bottom: 12px; display: flex; align-items: center;"">
                                <span style=""color: #10b981; margin-right: 12px;"">✓</span> Add your first transaction manually or via upload
                            </li>
                            <li style=""margin-bottom: 12px; display: flex; align-items: center;"">
                                <span style=""color: #10b981; margin-right: 12px;"">✓</span> Set monthly budgets for your categories
                            </li>
                            <li style=""margin-bottom: 0; display: flex; align-items: center;"">
                                <span style=""color: #10b981; margin-right: 12px;"">✓</span> Monitor your financial health on the Dashboard
                            </li>
                        </ul>
                    </div>

                    <div style=""text-align: center;"">
                        <a href=""http://localhost:5173/dashboard"" style=""display: inline-block; background: {buttonColor}; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; transition: background 0.2s;"">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
                <div style=""padding: 20px 28px; background: #141720; font-size: 12px; color: #8b8fa3; text-align: center; border-top: 1px solid #2a2e3d;"">
                    © 2026 Expense Tracker — Tracking simplified.
                </div>
            </div>"
        };

        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, appPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Welcome email sent to {Email}", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", recipientEmail);
        }
    }

    public async Task SendCoupleInviteAsync(string recipientEmail, string inviteCode, string inviterName)
    {
        var smtp = _config.GetSection("SmtpSettings");
        var senderEmail = smtp["SenderEmail"]!;
        var senderName = smtp["SenderName"] ?? "Expense Tracker";
        var host = smtp["Host"]!;
        var port = int.Parse(smtp["Port"] ?? "587");
        var appPassword = smtp["AppPassword"]!.Replace(" ", "");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress("Partner", recipientEmail));
        message.Subject = $"🔗 {inviterName} invited you to share expenses";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
            <div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1a1d27; color: #e4e6ef; border-radius: 12px; overflow: hidden;"">
                <div style=""background: linear-gradient(135deg, #10b981, #3b82f6); padding: 24px 28px;"">
                    <h1 style=""margin: 0; font-size: 20px; color: #fff;"">Expense Sharing Invite</h1>
                </div>
                <div style=""padding: 28px;"">
                    <p style=""margin: 0 0 16px; font-size: 16px; line-height: 1.5;"">
                        <strong>{inviterName}</strong> has invited you to share an expense tracking dashboard.
                    </p>
                    <div style=""background: #0f1117; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;"">
                        <p style=""margin: 0 0 8px; color: #8b8fa3; font-size: 14px;"">Your Invite Code:</p>
                        <div style=""font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #10b981;"">
                            {inviteCode}
                        </div>
                    </div>
                </div>
            </div>"
        };

        message.Body = bodyBuilder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, appPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            _logger.LogInformation("Couple invite email sent to {Email}", recipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send couple invite to {Email}", recipientEmail);
        }
    }
}
