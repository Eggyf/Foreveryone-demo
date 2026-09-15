using ForEveryone.Identity.Application;
using ForEveryone.Identity.Infrastructure;
using ForEveryone.Identity.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
