using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models;

public enum CoupleStatus { Pending, Active, Dissolved }

public class Couple
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid OwnerId { get; set; }
    
    public Guid? PartnerId { get; set; }
    
    [Required, MaxLength(8)]
    public string InviteCode { get; set; } = string.Empty;
    
    [Required, MaxLength(200)]
    public string InviteEmail { get; set; } = string.Empty;
    
    public CoupleStatus Status { get; set; } = CoupleStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Owner { get; set; } = null!;
    public User? Partner { get; set; }
}
