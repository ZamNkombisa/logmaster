using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace logmaster.api.Migrations
{
    /// <inheritdoc />
    public partial class AddTripCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DestinationLat",
                table: "Trips",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DestinationLng",
                table: "Trips",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLat",
                table: "Trips",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLng",
                table: "Trips",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DestinationLat",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "DestinationLng",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "OriginLat",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "OriginLng",
                table: "Trips");
        }
    }
}
