using ForEveryone.Identity.Domain.Entities;

namespace ForEveryone.Identity.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
