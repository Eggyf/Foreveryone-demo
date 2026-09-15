using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ForEveryone.Heroes.Application.Features.Heroes.Commands.CreateHero;
using ForEveryone.Heroes.Application.Interfaces;
using ForEveryone.Heroes.Infrastructure.Persistence;
using ForEveryone.Heroes.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext
builder.Services.AddDbContext<HeroesDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("HeroesDb")));

// 2. MediatR (Application)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.Load("ForEveryone.Heroes.Application")));

// 3. FluentValidation (Application)
builder.Services.AddValidatorsFromAssembly(Assembly.Load("ForEveryone.Heroes.Application"));

// 4. Dependency Inversion (Infraestructura)
builder.Services.AddScoped<IHeroRepository, HeroRepository>();
builder.Services.AddHttpClient<IUserVerificationService, UserVerificationService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["IdentityServiceUrl"]!);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Puerto por defecto de Vite
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