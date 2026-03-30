using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ExpenseTracker.DTOs.Auth;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;

namespace ExpenseTracker.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, ICategoryRepository categoryRepo, IEmailService emailService, IConfiguration config)
    {
        _userRepo = userRepo;
        _categoryRepo = categoryRepo;
        _emailService = emailService;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await _userRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user);

        // Seed default categories
        var defaultCategories = new List<Category>
        {
            // Income
            new Category { UserId = user.Id, Name = "cashback", Type = CategoryType.Income, Icon = "💰" },
            new Category { UserId = user.Id, Name = "Salary", Type = CategoryType.Income, Icon = "💸" },

            // Expense
            new Category { UserId = user.Id, Name = "SMS charges", Type = CategoryType.Expense, Icon = "📱" },
            new Category { UserId = user.Id, Name = "water", Type = CategoryType.Expense, Icon = "💧" },
            new Category { UserId = user.Id, Name = "electricity", Type = CategoryType.Expense, Icon = "⚡" },
            new Category { UserId = user.Id, Name = "household", Type = CategoryType.Expense, Icon = "🏠" },
            new Category { UserId = user.Id, Name = "groceries", Type = CategoryType.Expense, Icon = "🛒" },
            new Category { UserId = user.Id, Name = "travel", Type = CategoryType.Expense, Icon = "✈️" },
            new Category { UserId = user.Id, Name = "transportation", Type = CategoryType.Expense, Icon = "🚌" },
            new Category { UserId = user.Id, Name = "outsidefood", Type = CategoryType.Expense, Icon = "🍔" },
            new Category { UserId = user.Id, Name = "personal", Type = CategoryType.Expense, Icon = "👤" },
            new Category { UserId = user.Id, Name = "stationary", Type = CategoryType.Expense, Icon = "✏️" },
            new Category { UserId = user.Id, Name = "gasbill", Type = CategoryType.Expense, Icon = "🔥" },
            new Category { UserId = user.Id, Name = "clothing", Type = CategoryType.Expense, Icon = "👕" },
            new Category { UserId = user.Id, Name = "entertainment", Type = CategoryType.Expense, Icon = "🎬" },
            new Category { UserId = user.Id, Name = "vehicle", Type = CategoryType.Expense, Icon = "🚗" },
            new Category { UserId = user.Id, Name = "petrol", Type = CategoryType.Expense, Icon = "⛽" },
            new Category { UserId = user.Id, Name = "office", Type = CategoryType.Expense, Icon = "💼" },
            new Category { UserId = user.Id, Name = "missing", Type = CategoryType.Expense, Icon = "❓" },
            new Category { UserId = user.Id, Name = "others", Type = CategoryType.Expense, Icon = "📦" },
            new Category { UserId = user.Id, Name = "TV", Type = CategoryType.Expense, Icon = "📺" },
            new Category { UserId = user.Id, Name = "electronics", Type = CategoryType.Expense, Icon = "💻" },
            new Category { UserId = user.Id, Name = "Jewellery/ornament", Type = CategoryType.Expense, Icon = "💎" },
            new Category { UserId = user.Id, Name = "tax", Type = CategoryType.Expense, Icon = "🏛️" },
            new Category { UserId = user.Id, Name = "phone recharge", Type = CategoryType.Expense, Icon = "🔋" },
            new Category { UserId = user.Id, Name = "gifts", Type = CategoryType.Expense, Icon = "🎁" },
            new Category { UserId = user.Id, Name = "education", Type = CategoryType.Expense, Icon = "🎓" },
            new Category { UserId = user.Id, Name = "temple", Type = CategoryType.Expense, Icon = "🛕" },
            new Category { UserId = user.Id, Name = "wife", Type = CategoryType.Expense, Icon = "👩" },

            // Investment
            new Category { UserId = user.Id, Name = "interest", Type = CategoryType.Investment, Icon = "📈" },
            new Category { UserId = user.Id, Name = "SGB", Type = CategoryType.Investment, Icon = "🥇" },
            new Category { UserId = user.Id, Name = "Mutual fund", Type = CategoryType.Investment, Icon = "📊" },
            new Category { UserId = user.Id, Name = "Stocks", Type = CategoryType.Investment, Icon = "📉" },
            new Category { UserId = user.Id, Name = "FD", Type = CategoryType.Investment, Icon = "🏦" },
            new Category { UserId = user.Id, Name = "RD", Type = CategoryType.Investment, Icon = "⏳" },
            new Category { UserId = user.Id, Name = "PPF", Type = CategoryType.Investment, Icon = "🛡️" },
            new Category { UserId = user.Id, Name = "NPS", Type = CategoryType.Investment, Icon = "👴" }
        };

        foreach (var cat in defaultCategories)
        {
            await _categoryRepo.AddAsync(cat);
        }

        // Send welcome email asynchronously
        _ = _emailService.SendWelcomeEmailAsync(user.Email, user.Name);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Token = GenerateJwtToken(user)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponseDto
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Token = GenerateJwtToken(user)
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
