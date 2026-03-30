namespace ExpenseTracker.DTOs.AIFeatures;

// ── Natural Language Budget Setup ──────────────────────────────

public class AIBudgetRequestDto
{
    /// <summary>e.g. "I earn ₹80,000 and want to save 20% each month"</summary>
    public string Prompt { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year  { get; set; }

    /// <summary>
    /// Category IDs the user wants to EXCLUDE from budget generation.
    /// Backend filters these out before processing — avoids frontend UUID case-mismatch bugs.
    /// </summary>
    public List<Guid> ExcludedCategoryIds { get; set; } = new();
}

public class AIBudgetSuggestionDto
{
    public Guid   CategoryId      { get; set; }
    public string CategoryName    { get; set; } = string.Empty;
    public decimal SuggestedAmount { get; set; }
    public string Reasoning       { get; set; } = string.Empty;
}

public class AIBudgetResponseDto
{
    public List<AIBudgetSuggestionDto> Suggestions { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class AIBudgetApplyDto
{
    public List<AIBudgetSuggestionDto> Budgets { get; set; } = new();
    public int Month { get; set; }
    public int Year  { get; set; }
}

// ── Fuel Efficiency AI Coach ───────────────────────────────────

public class FuelCoachResponseDto
{
    public List<VehicleCoachDto> Vehicles { get; set; } = new();
    public string OverallSummary { get; set; } = string.Empty;
}

public class VehicleCoachDto
{
    public string VehicleName { get; set; } = string.Empty;
    public string VehicleType { get; set; } = string.Empty;
    public string FuelType    { get; set; } = string.Empty;
    public List<string> Tips  { get; set; } = new();
    public string StatusEmoji { get; set; } = "✅";
}
