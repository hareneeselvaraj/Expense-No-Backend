using ExpenseTracker.DTOs.AIChat;

namespace ExpenseTracker.Services.Interfaces;

public interface IAIChatService
{
    Task<AIChatResponseDto> ChatAsync(Guid userId, AIChatRequestDto request);
}
