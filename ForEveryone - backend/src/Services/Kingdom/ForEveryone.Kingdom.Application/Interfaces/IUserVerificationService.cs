namespace ForEveryone.Kingdom.Application.Interfaces;

public interface IUserVerificationService
{
    Task<bool> VerifyUserExistsAsync(Guid userId);
}