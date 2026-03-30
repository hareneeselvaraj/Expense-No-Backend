namespace ExpenseTracker.Services.Interfaces;

public interface ICoupleService
{
    Task<string> CreateCoupleAsync(Guid userId, string inviteEmail);
    Task<bool> AcceptInviteAsync(string inviteCode, Guid partnerId);
    Task<object?> GetCoupleStatusAsync(Guid userId);
    Task<Guid?> GetPartnerIdAsync(Guid userId);
    Task<List<Guid>> GetUserScopeAsync(Guid userId, string scope);
    Task<bool> LeaveCoupleAsync(Guid userId);
}
