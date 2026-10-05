// Package cache wraps Redis for the whole application. Per Part 2.2's
// "cache/" spec (redis.go, cache_key.go, cache_service.go) — this is new
// infrastructure that didn't exist before this migration; Fase 0-2 used
// Redis only as a healthcheck dependency, never actually cached anything.
package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewClient(addr, password string, db int) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{Addr: addr, Password: password, DB: db})
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("cache: failed to connect to redis: %w", err)
	}
	return client, nil
}

// Service is a small typed wrapper so domains don't sprinkle raw
// client.Get/Set calls (and raw key strings) throughout their service.go
// files — every cache key goes through Key() for a consistent namespace.
type Service struct {
	client *redis.Client
}

func NewService(client *redis.Client) *Service {
	return &Service{client: client}
}

// Key builds a namespaced cache key: "kpr:<domain>:<id>", e.g.
// Key("package", "list:active") -> "kpr:package:list:active". A single
// convention here means every domain's cache invalidation is predictable.
func Key(domain string, parts ...string) string {
	key := "kpr:" + domain
	for _, p := range parts {
		key += ":" + p
	}
	return key
}

func (s *Service) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	raw, err := s.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal(raw, dest); err != nil {
		return false, err
	}
	return true, nil
}

func (s *Service) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.client.Set(ctx, key, raw, ttl).Err()
}

func (s *Service) Delete(ctx context.Context, keys ...string) error {
	if len(keys) == 0 {
		return nil
	}
	return s.client.Del(ctx, keys...).Err()
}
