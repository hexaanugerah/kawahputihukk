package main

import (
	"github.com/kpr-tourism/backend/internal/bootstrap"
	"github.com/kpr-tourism/backend/internal/cache"
	"github.com/kpr-tourism/backend/internal/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func connectInfra(cfg *config.Config, log *zap.Logger) (*gorm.DB, *redis.Client) {
	gormLogLevel := gormlogger.Warn
	if cfg.App.Env == "local" {
		gormLogLevel = gormlogger.Info
	}
	db, err := config.NewDatabase(cfg.Database, gormLogLevel)
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	log.Info("database connected", zap.String("db", cfg.Database.Name))

	redisClient, err := cache.NewClient(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
	if err != nil {
		// Redis backs caching only, not correctness of core writes — degrade
		// gracefully rather than refuse to boot, but log loudly.
		log.Warn("redis unavailable, continuing without cache", zap.Error(err))
		return db, nil
	}
	log.Info("redis connected", zap.String("addr", cfg.Redis.Addr))
	return db, redisClient
}

func buildApp(cfg *config.Config, db *gorm.DB, log *zap.Logger) *bootstrap.App {
	return bootstrap.Build(cfg, db, log)
}
