using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Kingdom.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArmySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ArmySize",
                table: "Kingdoms",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArmySize",
                table: "Kingdoms");
        }
    }
}
