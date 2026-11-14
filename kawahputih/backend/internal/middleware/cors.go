package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestID menandai setiap request dengan ID unik, diteruskan di header respons dan tersedia bagi handler/logger untuk melacak satu request.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.NewString()
		}
		c.Set("request_id", id)
		c.Writer.Header().Set("X-Request-ID", id)
		c.Next()
	}
}

// CORS mengizinkan origin frontend yang dikonfigurasi memanggil API dengan kredensial.
// FRONTEND_URL boleh memuat BEBERAPA origin sekaligus (dipisah koma), contoh:
//   FRONTEND_URL=http://localhost:3000,http://192.168.1.5:3000
// supaya aplikasi tetap bisa dibuka dari HP di jaringan yang sama. Origin yang
// cocok di-echo balik ke header Access-Control-Allow-Origin; origin asing tidak
// pernah diberi header izin (tetap tidak pernah tanda bintang bila ada kredensial).
func CORS(allowedOrigins []string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		if o = strings.TrimSpace(o); o != "" {
			allowed[o] = struct{}{}
		}
	}
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if _, ok := allowed[origin]; ok {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Add("Vary", "Origin")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
