namespace ExpenseTracker.DTOs.AIChat;

public class AIChatMessageDto
{
    public string Role    { get; set; } = string.Empty; // "user" | "assistant"
    public string Content { get; set; } = string.Empty;
}

public class AIChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public List<AIChatMessageDto> History { get; set; } = new();
}

public class AIChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
}
