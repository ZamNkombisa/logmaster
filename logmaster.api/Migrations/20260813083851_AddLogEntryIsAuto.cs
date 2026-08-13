using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace logmaster.api.Migrations
{
    /// <inheritdoc />
    public partial class AddLogEntryIsAuto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAuto",
                table: "LogEntries",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAuto",
                table: "LogEntries");
        }
    }
}
