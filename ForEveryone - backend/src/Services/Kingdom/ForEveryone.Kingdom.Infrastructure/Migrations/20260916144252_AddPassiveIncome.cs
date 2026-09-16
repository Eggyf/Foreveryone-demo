using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Kingdom.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPassiveIncome : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastCollectedTime",
                table: "Kingdoms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastCollectedTime",
                table: "Kingdoms");
        }
    }
}
