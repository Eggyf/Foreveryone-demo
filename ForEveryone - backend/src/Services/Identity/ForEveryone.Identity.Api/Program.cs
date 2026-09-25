using ForEveryone.Identity.Application;
using ForEveryone.Identity.Infrastructure;
using ForEveryone.Identity.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Aplica migraciones pendientes automaticamente solo en Development.
    // En Staging/Production esto se hace manualmente o via pipeline de CI/CD.
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await db.Database.MigrateAsync();
}
app.UseCors("AllowReact");
// app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
