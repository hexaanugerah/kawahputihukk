// Command migration exists to satisfy Part 2.2's cmd/migration structure.
// This project does NOT use a Go-based migration runner (golang-migrate,
// goose, etc) — schema changes are plain numbered SQL files in
// database/migrations/*.up.sql, applied automatically by MySQL's
// docker-entrypoint-initdb.d on first container start, or manually via
// scripts/migrate.sh against a running container. That approach was
// chosen because it requires zero additional Go dependencies and is
// trivial to read/audit as plain SQL. This binary is a documented no-op
// rather than a half-built wrapper around a migration library nothing
// else in the project uses.
package main

import "fmt"

func main() {
	fmt.Println("Migrations are plain SQL in database/migrations/ — run ./scripts/migrate.sh instead of this binary.")
}
