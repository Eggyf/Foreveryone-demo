using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ForEveryone.Shop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShopItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Cost = table.Column<int>(type: "integer", nullable: false),
                    AttackBoost = table.Column<int>(type: "integer", nullable: false),
                    DefenseBoost = table.Column<int>(type: "integer", nullable: false),
                    HealToFull = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopItems", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ShopItems",
                columns: new[] { "Id", "AttackBoost", "Cost", "DefenseBoost", "Description", "HealToFull", "Name" },
                values: new object[,]
                {
                    { 1, 10, 100, 0, "Aumenta el Ataque +10 permanentemente.", false, "🗡️ Espada de Hierro" },
                    { 2, 0, 150, 10, "Aumenta la Defensa +10 permanentemente.", false, "🛡️ Armadura de Cuero" },
                    { 3, 0, 50, 0, "Restaura toda tu vida al instante.", true, "🧪 Poción de Vida" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShopItems");
        }
    }
}
