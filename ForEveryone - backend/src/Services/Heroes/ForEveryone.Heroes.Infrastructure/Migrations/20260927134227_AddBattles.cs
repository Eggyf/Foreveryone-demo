using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Heroes.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBattles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Battles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HeroId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnemyKey = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Actions = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    HeroHealthAtStart = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Battles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Battles_HeroId",
                table: "Battles",
                column: "HeroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Battles");
        }
    }
}
