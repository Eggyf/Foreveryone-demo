using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ForEveryone.Kingdom.Application.Features.Kingdom.Commands.CreateKingdom;
using ForEveryone.Kingdom.Application.Interfaces;
using ForEveryone.Kingdom.Infrastructure.Persistence;
using ForEveryone.Kingdom.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext
builder.Services.AddDbContext<KingdomDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("KingdomDb")));

// 2. MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.Load("ForEveryone.Kingdom.Application")));

// 3. FluentValidation
builder.Services.AddValidatorsFromAssembly(Assembly.Load("ForEveryone.Kingdom.Application"));

// 4. Dependency Inversion
builder.Services.AddScoped<IKingdomRepository, KingdomRepository>();
builder.Services.AddHttpClient<IUserVerificationService, UserVerificationService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["IdentityServiceUrl"]!);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KingdomDbContext>();
    db.Database.Migrate();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();