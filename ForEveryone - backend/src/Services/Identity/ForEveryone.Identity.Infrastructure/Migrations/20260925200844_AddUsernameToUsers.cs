using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Identity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUsernameToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Se agrega la columna como nullable para poder rellenarla antes
            //    de volverla obligatoria.
            migrationBuilder.AddColumn<string>(
                name: "username",
                schema: "identity",
                table: "users",
                type: "character varying(24)",
                maxLength: 24,
                nullable: true);

            // 2) Backfill de las cuentas existentes. Se toma la parte local del email
            //    como candidato; si no cumple las reglas del Value Object Username
            //    o ya esta en uso por otra cuenta, se genera uno con un sufijo
            //    derivado del Id para garantizar la unicidad.
            migrationBuilder.Sql("""
                WITH candidates AS (
                    SELECT
                        u."Id" AS id,
                        regexp_replace(lower(split_part(u."email", '@', 1)), '[^a-z0-9._-]', '', 'g') AS candidate
                    FROM "identity"."users" u
                ),
                resolved AS (
                    SELECT
                        c.id,
                        CASE
                            WHEN c.candidate ~ '^[a-z0-9][a-z0-9._-]{1,22}[a-z0-9]$'
                                 AND NOT EXISTS (
                                     SELECT 1 FROM candidates o
                                     WHERE o.id <> c.id AND o.candidate = c.candidate
                                 )
                            THEN c.candidate
                            ELSE 'user_' || substr(replace(c.id::text, '-', ''), 1, 12)
                        END AS username
                    FROM candidates c
                )
                UPDATE "identity"."users" u
                SET "username" = r.username
                FROM resolved r
                WHERE r.id = u."Id";
                """);

            migrationBuilder.AlterColumn<string>(
                name: "username",
                schema: "identity",
                table: "users",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(24)",
                oldMaxLength: 24,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                schema: "identity",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_username",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "username",
                schema: "identity",
                table: "users");
        }
    }
}
