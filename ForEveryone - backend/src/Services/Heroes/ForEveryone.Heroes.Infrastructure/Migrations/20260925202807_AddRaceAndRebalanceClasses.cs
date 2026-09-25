using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ForEveryone.Heroes.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRaceAndRebalanceClasses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) Se agrega la columna como nullable para poder rellenarla antes
            //    de volverla obligatoria. Sin defaultValue: "" porque la cadena
            //    vacia no es un valor valido del enum Race.
            migrationBuilder.AddColumn<string>(
                name: "Race",
                table: "Heroes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            // 2) Los heroes existentes se asignan al Humano, que es la unica
            //    raza sin bonificacion ni penalizacion.
            migrationBuilder.Sql("""
                UPDATE "Heroes" SET "Race" = 'Humano' WHERE "Race" IS NULL;
                """);

            // 3) Renombrado de las clases que sobreviven al rebalanceo.
            //    La columna se guarda como texto, asi que el enum no obliga a migrar.
            migrationBuilder.Sql("""
                UPDATE "Heroes" SET "Class" = 'Wizard' WHERE "Class" = 'Mage';
                UPDATE "Heroes" SET "Class" = 'Hunter' WHERE "Class" = 'Archer';
                """);

            // 4) Sacerdote se elimino del juego y no tiene equivalente en el
            //    rebalanceo, asi que sus heroes no se pueden seguir leyendo.
            //    Se borran en lugar de dejar filas con una clase invalida.
            migrationBuilder.Sql("""
                DELETE FROM "Heroes"
                WHERE "Class" NOT IN ('Warrior', 'Hunter', 'Wizard', 'Rogue');
                """);

            migrationBuilder.AlterColumn<string>(
                name: "Race",
                table: "Heroes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Class",
                table: "Heroes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Class",
                table: "Heroes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.DropColumn(
                name: "Race",
                table: "Heroes");
        }
    }
}
