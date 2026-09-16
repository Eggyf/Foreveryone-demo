using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Heroes.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroGold : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Gold",
                table: "Heroes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gold",
                table: "Heroes");
        }
    }
}
