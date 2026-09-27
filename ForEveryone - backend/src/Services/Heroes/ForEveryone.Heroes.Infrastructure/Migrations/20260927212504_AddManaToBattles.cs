using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Heroes.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddManaToBattles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Actions",
                table: "Battles",
                type: "character varying(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

            migrationBuilder.AddColumn<int>(
                name: "HeroManaAtStart",
                table: "Battles",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroManaAtStart",
                table: "Battles");

            migrationBuilder.AlterColumn<string>(
                name: "Actions",
                table: "Battles",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(512)",
                oldMaxLength: 512);
        }
    }
}
