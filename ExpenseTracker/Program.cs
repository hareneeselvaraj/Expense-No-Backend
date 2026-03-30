using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ExpenseTracker.Data;
using ExpenseTracker.Repositories.Implementations;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Implementations;
using ExpenseTracker.Services.Interfaces;
using ExpenseTracker.Services;
using ExpenseTracker.Models;

var builder = WebApplication.CreateBuilder(args);

// Register encoding provider for ExcelDataReader to support old .xls format
System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

// ───────────────────── Database ─────────────────────
// var sqlServerConn = builder.Configuration.GetConnectionString("SqlServerConnection")!;
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(sqlServerConn));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=expense.db"));

// ───────────────────── JWT Authentication ─────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();

// ───────────────────── Repositories ─────────────────────
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IFuelEntryRepository, FuelEntryRepository>();

// ───────────────────── Services ─────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IInvestmentService, InvestmentService>();
builder.Services.AddScoped<ICoupleService, CoupleService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IMileageService, MileageService>();
builder.Services.AddScoped<IAIChatService, AIChatService>();
builder.Services.AddScoped<IAIFeaturesService, AIFeaturesService>();
builder.Services.AddHttpClient("google");

// ───────────────────── Wealth Dashboard ─────────────────────
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<IPriceFeedService, PriceFeedService>();
builder.Services.AddSingleton<AMFIService>();
builder.Services.AddScoped<SIPService>();
builder.Services.AddScoped<PnLCalculationService>();
builder.Services.AddScoped<XIRRService>();
builder.Services.AddScoped<ImportService>();
builder.Services.AddScoped<SnapshotService>();
builder.Services.AddSingleton<BackupService>();
builder.Services.AddHostedService<ExpenseTracker.Services.SIPBackgroundService>();
builder.Services.AddHostedService<ExpenseTracker.Services.SnapshotBackgroundService>();
builder.Services.AddHostedService<ExpenseTracker.Services.BackupBackgroundService>();

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Expense Tracker API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Name = "Authorization", Type = SecuritySchemeType.Http, Scheme = "Bearer", BearerFormat = "JWT", In = ParameterLocation.Header });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() } });
});

builder.Services.AddCors(o => o.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// ───────────────────── Startup Migrations ─────────────────────
var app = builder.Build();

try 
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // ── Create DB & tables from current model ──
        // Startup Migrations (SQL Server handles this via EnsureCreated/Migrations)
        var created = await db.Database.EnsureCreatedAsync();
        
        // RD Catch-up Logic
        var today = DateTime.UtcNow;
        var rds = await db.Investments.Where(i => i.AssetType == "RD" && i.Status == "Active").ToListAsync();
        foreach (var rd in rds)
        {
            if (rd.DateInvested == null || rd.MonthlyAmount == null || rd.TenureMonths == null) continue;
            var start = rd.DateInvested.Value;
            int elapsed = Math.Max(1, ((today.Year - start.Year) * 12) + today.Month - start.Month + (today.Day >= start.Day ? 1 : 0));
            elapsed = Math.Min(elapsed, rd.TenureMonths.Value);
            int current = rd.MonthsCompleted ?? 1;
            if (elapsed > current)
            {
                rd.InvestedAmount += rd.MonthlyAmount.Value * (elapsed - current);
                rd.CurrentValue = rd.InvestedAmount;
                rd.MonthsCompleted = elapsed;
                rd.LastProcessedDate = today;
            }
            if (rd.MonthsCompleted >= rd.TenureMonths) rd.Status = "Matured";
        }
        if (rds.Count > 0) await db.SaveChangesAsync();
    }
}
catch (Exception ex) 
{ 
    var logMsg = $"[{DateTime.UtcNow}] Startup Migration Error: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{Environment.NewLine}";
    try { System.IO.File.AppendAllText("startup_error.log", logMsg); } catch { }
    Console.WriteLine($"Startup Migration Error: {ex.Message}"); 
}


app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();
