using ExpenseTracker.DTOs.Tag;
using ExpenseTracker.Models;
using ExpenseTracker.Repositories.Interfaces;
using ExpenseTracker.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;

namespace ExpenseTracker.Services.Implementations;

public class TagService : ITagService
{
    private readonly AppDbContext _context;

    public TagService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TagResponseDto> CreateAsync(Guid userId, CreateTagDto dto)
    {
        var tag = new Tag
        {
            UserId = userId,
            Name = dto.Name
        };
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();
        return new TagResponseDto { Id = tag.Id, Name = tag.Name };
    }

    public async Task<IEnumerable<TagResponseDto>> GetAllAsync(Guid userId)
    {
        return await _context.Tags
            .Where(t => t.UserId == userId)
            .Select(t => new TagResponseDto 
            { 
                Id = t.Id, 
                Name = t.Name,
                TransactionCount = _context.Transactions.Count(tx => tx.TagId == t.Id)
            })
            .ToListAsync();
    }

    public async Task<TagDetailDto?> GetDetailAsync(Guid userId, Guid tagId)
    {
        var tag = await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == tagId && t.UserId == userId);

        if (tag == null) return null;

        var transactions = await _context.Transactions
            .Include(t => t.Category)
            .Include(t => t.Account)
            .Where(t => t.UserId == userId && t.TagId == tagId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        return new TagDetailDto
        {
            Id = tag.Id,
            Name = tag.Name,
            TotalSpent = transactions.Sum(t => t.Amount),
            TransactionCount = transactions.Count,
            Transactions = transactions.Select(t => new TagTransactionDto
            {
                Id = t.Id,
                CategoryName = t.Category?.Name ?? "",
                AccountName = t.Account?.Name ?? "",
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Description = t.Description,
                Date = t.Date
            }).ToList()
        };
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid id)
    {
        var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (tag == null) return false;

        // Unlink transactions from this tag
        var linkedTx = await _context.Transactions.Where(t => t.TagId == id).ToListAsync();
        foreach (var tx in linkedTx) tx.TagId = null;

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();
        return true;
    }
}
