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

// Orígenes permitidos por CORS. Se lee de "Cors:AllowedOrigins" en appsettings
// y, si no está definido, se usan los puertos habituales de Vite (5173 y 5174).
// Vite puede arrancar en 5174 si el 5173 está ocupado, así que se aceptan ambos
// para no romper el desarrollo local.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    is { Length: > 0 } configuredOrigins
        ? configuredOrigins
        : ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KingdomDbContext>();
    db.Database.Migrate();
}
app.UseCors("AllowReact");
// app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();