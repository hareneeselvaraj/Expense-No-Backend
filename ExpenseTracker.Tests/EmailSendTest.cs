using MailKit.Net.Smtp;
using MimeKit;

namespace ExpenseTracker.Tests;

/// <summary>
/// Direct Gmail SMTP test — bypasses all application logic.
/// If THIS fails, the Gmail credentials are the problem.
/// </summary>
public class EmailSendTest
{
    private const string SenderEmail = "hareneeselvaraj101@gmail.com";
    private const string AppPassword = "ccemtbsxavieefeo"; // spaces removed
    private const string SmtpHost = "smtp.gmail.com";
    private const int SmtpPort = 587;

    [Fact]
    public async Task DirectSmtpSend_ShouldDeliverEmail()
    {
        // Arrange
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Expense Tracker Test", SenderEmail));
        message.To.Add(new MailboxAddress("Test Recipient", SenderEmail)); // send to self
        message.Subject = "✅ ExpenseTracker Email Test — " + DateTime.Now.ToString("g");

        message.Body = new TextPart("html")
        {
            Text = @"
            <div style='font-family: Arial; padding: 20px; background: #1a1d27; color: #e4e6ef; border-radius: 12px;'>
                <h2 style='color: #6366f1;'>✅ Email Test Passed</h2>
                <p>If you see this email, Gmail SMTP is working correctly.</p>
                <p style='color: #8b8fa3; font-size: 12px;'>Sent at: " + DateTime.Now + @"</p>
            </div>"
        };

        // Act & Assert
        using var client = new SmtpClient();

        // Connect
        await client.ConnectAsync(SmtpHost, SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
        Assert.True(client.IsConnected, "Should be connected to SMTP server");

        // Authenticate
        await client.AuthenticateAsync(SenderEmail, AppPassword);
        Assert.True(client.IsAuthenticated, "Should be authenticated");

        // Send
        var result = await client.SendAsync(message);
        Assert.NotNull(result);

        await client.DisconnectAsync(true);

        // If we get here without exceptions, the email was sent successfully
        Console.WriteLine($"[TEST] Email sent successfully! Response: {result}");
    }
}
