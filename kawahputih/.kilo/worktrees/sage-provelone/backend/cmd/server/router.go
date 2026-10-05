package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kpr-tourism/backend/internal/bootstrap"
	"github.com/kpr-tourism/backend/internal/routes"
	"go.uber.org/zap"
)

func buildRouter(app *bootstrap.App, log *zap.Logger) *gin.Engine {
	return routes.NewRouter(app, log)
}
