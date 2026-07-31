package middleware

import (
	"log/slog"
	"net/http"
	"time"
)

type statusWriter struct {
	http.ResponseWriter
	status  int
	written bool
}

func (sw *statusWriter) WriteHeader(status int) {
	if !sw.written {
		sw.status = status
		sw.written = true
		sw.ResponseWriter.WriteHeader(status)
	}
}

func (sw *statusWriter) Write(b []byte) (int, error) {
	if !sw.written {
		sw.WriteHeader(http.StatusOK)
	}
	return sw.ResponseWriter.Write(b)
}

// Logger logs each request using slog: method, path, status, latency, request_id.
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(sw, r)

		slog.Info("request",
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Int("status", sw.status),
			slog.Duration("latency", time.Since(start)),
			slog.String("request_id", GetRequestID(r.Context())),
		)
	})
}
