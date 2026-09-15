using ForEveryone.Identity.Domain.Entities;
using ForEveryone.Identity.Domain.Repositories;
using ForEveryone.Identity.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace ForEveryone.Identity.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly IdentityDbContext _context;

    public UserRepository(IdentityDbContext context) => _context = context;

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

    public Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken = default) =>
        _context.Users.FirstOrDefaultAsync(u => u.Email.Value == email.Value, cancellationToken);

    public Task<bool> ExistsByEmailAsync(Email email, CancellationToken cancellationToken = default) =>
        _context.Users.AnyAsync(u => u.Email.Value == email.Value, cancellationToken);

    public void Add(User user) => _context.Users.Add(user);
}
