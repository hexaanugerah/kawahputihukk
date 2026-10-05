// Command server is the API entrypoint. Per Part 2.2's cmd/ rule
// ("Executable application entry point. Contains no business logic"), this
// file only loads config and hands off to bootstrap.go + server.go.
package main

import (
	"github.com/kpr-tourism/backend/internal/demo"
	"github.com/kpr-tourism/backend/internal/config"
	applogger "github.com/kpr-tourism/backend/pkg/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	applogger.Init(cfg.App.Env)
	log := applogger.L()
	defer applogger.Sync()
	if cfg.App.DemoMode {
		demo.Run(cfg, log)
		return
	}

	db, redisClient := connectInfra(cfg, log)
	if redisClient != nil {
		defer redisClient.Close()
	}

	app := buildApp(cfg, db, log)
	runServer(cfg, app, log)
}
