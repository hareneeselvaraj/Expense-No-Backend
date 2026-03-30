using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Services.Implementations;

public class CoupleService : ICoupleService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<CoupleService> _logger;

    public CoupleService(AppDbContext context, IEmailService emailService, ILogger<CoupleService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<string> CreateCoupleAsync(Guid userId, string inviteEmail)
    {
        try 
        {
            
            // 1. Check if user already in an active couple
            var existing = await _context.Couples.FirstOrDefaultAsync(c => 
                (c.OwnerId == userId || c.PartnerId == userId) && 
                (c.Status == CoupleStatus.Active || c.Status == CoupleStatus.Pending));
            
            if (existing != null)
                throw new InvalidOperationException("You are already part of an active or pending couple.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new KeyNotFoundException($"User not found for id {userId}.");

            var inviteCode = GenerateInviteCode();

            // 2. CREATE THE COUPLE RECORD FIRST
            var couple = new Couple
            {
                Id = Guid.NewGuid(),
                OwnerId = userId,
                InviteEmail = inviteEmail,
                InviteCode = inviteCode,
                Status = CoupleStatus.Pending
            };

            _context.Couples.Add(couple);
            await _context.SaveChangesAsync(); // Save the couple to the DB first
            _logger.LogInformation("[COUPLE] Created couple {CoupleId} with code {Code}", couple.Id, inviteCode);

            // 3. LINK THE USER TO THE NEW COUPLE
            user.CoupleId = couple.Id;
            user.CoupleRole = "Owner";
            await _context.SaveChangesAsync(); // Update the user record
            _logger.LogInformation("[COUPLE] Linked user {UserId} to couple as Owner", userId);

            if (!string.IsNullOrWhiteSpace(inviteEmail))
            {
                _ = _emailService.SendCoupleInviteAsync(inviteEmail, inviteCode, user.Name);
            }

            return inviteCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[COUPLE] Crash in CreateCoupleAsync");
            throw; // Re-throw to be caught by Controller
        }
    }

    public async Task<bool> AcceptInviteAsync(string inviteCode, Guid partnerId)
    {
        var couple = await _context.Couples
            .FirstOrDefaultAsync(c => c.InviteCode == inviteCode && c.Status == CoupleStatus.Pending);

        if (couple == null) return false;
        if (couple.OwnerId == partnerId) return false;

        var partner = await _context.Users.FindAsync(partnerId);
        if (partner == null) return false;

        couple.PartnerId = partnerId;
        couple.Status = CoupleStatus.Active;
        partner.CoupleId = couple.Id;
        partner.CoupleRole = "Partner";

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object?> GetCoupleStatusAsync(Guid userId)
    {
        var couple = await _context.Couples
            .Include(c => c.Owner)
            .Include(c => c.Partner)
            .FirstOrDefaultAsync(c => (c.OwnerId == userId || c.PartnerId == userId) 
                                   && c.Status != CoupleStatus.Dissolved);

        if (couple == null) return null;

        var isOwner = couple.OwnerId == userId;
        var otherUser = isOwner ? couple.Partner : couple.Owner;

        return new
        {
            couple.Id,
            Role = isOwner ? "Owner" : "Partner",
            couple.Status,
            couple.InviteCode,
            PartnerName = otherUser?.Name,
            PartnerEmail = otherUser?.Email
        };
    }

    public async Task<Guid?> GetPartnerIdAsync(Guid userId)
    {
        var couple = await _context.Couples
            .FirstOrDefaultAsync(c => (c.OwnerId == userId || c.PartnerId == userId) && c.Status == CoupleStatus.Active);
            
        if (couple == null) return null;
        return couple.OwnerId == userId ? couple.PartnerId : couple.OwnerId;
    }

    public async Task<List<Guid>> GetUserScopeAsync(Guid userId, string scope)
    {
        var users = new List<Guid> { userId };
        if (string.Equals(scope, "Mine", StringComparison.OrdinalIgnoreCase)) return users;

        var partnerId = await GetPartnerIdAsync(userId);
        if (partnerId.HasValue)
        {
            if (string.Equals(scope, "Partner", StringComparison.OrdinalIgnoreCase))
            {
                return new List<Guid> { partnerId.Value };
            }
            if (string.Equals(scope, "Combined", StringComparison.OrdinalIgnoreCase))
            {
                users.Add(partnerId.Value);
            }
        }
        return users;
    }

    public async Task<bool> LeaveCoupleAsync(Guid userId)
    {
        var couple = await _context.Couples
            .Include(c => c.Owner)
            .Include(c => c.Partner)
            .OrderByDescending(c => c.CreatedAt) // Pick newest first
            .FirstOrDefaultAsync(c => (c.OwnerId == userId || c.PartnerId == userId) && c.Status != CoupleStatus.Dissolved);

        if (couple == null) 
        {
            return false;
        }

        couple.Status = CoupleStatus.Dissolved;
        
        if (couple.Owner != null)
        {
            couple.Owner.CoupleId = null;
            couple.Owner.CoupleRole = null;
        }

        if (couple.Partner != null)
        {
            couple.Partner.CoupleId = null;
            couple.Partner.CoupleRole = null;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("[COUPLE] Successfully dissolved couple {CoupleId}", couple.Id);
        return true;
    }

    private static string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
