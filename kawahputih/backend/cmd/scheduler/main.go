// Command scheduler runs background jobs as their own process, separate
// from the API server — useful once you want to scale/deploy them
// independently (e.g. only one scheduler replica should ever run, while
// the API scales to many). At this project's current scale the same
// sweeper also runs in-process inside cmd/server (see cmd/server/server.go)
// for deployment simplicity; this binary is provided for when that stops
// being sufficient.
package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/kpr-tourism/backend/internal/config"
	"github.com/kpr-tourism/backend/internal/domain/booking"
	applogger "github.com/kpr-tourism/backend/pkg/logger"

	"time"

	"github.com/kpr-tourism/backend/internal/payment/midtrans"
	"github.com/kpr-tourism/backend/internal/scheduler"
	"go.uber.org/zap"
	gormlogger "gorm.io/gorm/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	applogger.Init(cfg.App.Env)
	log := applogger.L()
	defer applogger.Sync()

	db, err := config.NewDatabase(cfg.Database, gormlogger.Warn)
	if err != nil {
		log.Fatal("scheduler: failed to connect to database", zap.Error(err))
	}

	gateway := midtrans.NewGateway(midtrans.Config{ServerKey: cfg.Midtrans.ServerKey, ClientKey: cfg.Midtrans.ClientKey, IsProduction: cfg.Midtrans.IsProduction})
	bookingRepo := booking.NewRepository(db)
	bookingService := booking.NewService(bookingRepo, gateway)
	sweeper := scheduler.NewExpiredBookingSweeper(bookingRepo, bookingService, 30*time.Minute, 5*time.Minute, log)

	ctx, cancel := context.WithCancel(context.Background())
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		cancel()
	}()

	log.Info("scheduler starting: expired-booking sweeper")
	sweeper.Run(ctx)
	log.Info("scheduler exited gracefully")
}
