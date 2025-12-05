using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjetoFinal_MVC.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFotoPerfilToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FotoPerfil",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FotoPerfil",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "AspNetUsers");
        }
    }
}
