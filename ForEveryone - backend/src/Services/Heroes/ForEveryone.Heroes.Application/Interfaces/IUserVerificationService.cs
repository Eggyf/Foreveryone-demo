namespace ForEveryone.Heroes.Application.Interfaces;

public interface IUserVerificationService
{
    Task<bool> VerifyUserExistsAsync(Guid userId);
}