using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ForEveryone.Heroes.Application.Common.Behaviors;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;
using Heroes.Application.Interfaces;
using ForEveryone.Heroes.Application.Interfaces;
using ForEveryone.Heroes.Infrastructure.Persistence;
using ForEveryone.Heroes.Infrastructure.Services;
using Heroes.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext
builder.Services.AddDbContext<HeroesDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("HeroesDb")));

// 2. MediatR (Application)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.Load("ForEveryone.Heroes.Application")));

// Sin este registro los validators de FluentValidation no se ejecutan nunca.
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// 3. FluentValidation (Application)
builder.Services.AddValidatorsFromAssembly(Assembly.Load("ForEveryone.Heroes.Application"));

// 4. Dependency Inversion (Infraestructura)
builder.Services.AddScoped<IHeroRepository, HeroRepository>();
builder.Services.AddHttpClient<IUserVerificationService, UserVerificationService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["IdentityServiceUrl"]!);
});

// Comunicación con Shop.Api
builder.Services.AddHttpClient<IShopCatalogService, ShopCatalogService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ShopServiceUrl"]!);
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

    // Auto-migración
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<HeroesDbContext>();
    db.Database.Migrate();
}
app.UseCors("AllowReact");
// app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();