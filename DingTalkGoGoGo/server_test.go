package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
)

func TestNormalizeURLs(t *testing.T) {
	urls := normalizeURLs(" https://example.com/a ", []string{"", " https://example.com/b "})
	if len(urls) != 2 {
		t.Fatalf("normalizeURLs() count = %d, want 2", len(urls))
	}

	if urls[0] != "https://example.com/a" {
		t.Fatalf("normalizeURLs() first = %q", urls[0])
	}

	if urls[1] != "https://example.com/b" {
		t.Fatalf("normalizeURLs() second = %q", urls[1])
	}
}

func TestResolveOutputDir(t *testing.T) {
	server := &Server{saveRoot: "/tmp/godingtalk"}

	saveDir, relativeDir, err := server.resolveOutputDir("batch/job-1", "job-1")
	if err != nil {
		t.Fatalf("resolveOutputDir() error = %v", err)
	}

	if saveDir != filepath.Join("/tmp/godingtalk", "batch/job-1") {
		t.Fatalf("resolveOutputDir() saveDir = %q", saveDir)
	}

	if relativeDir != "batch/job-1" {
		t.Fatalf("resolveOutputDir() relativeDir = %q", relativeDir)
	}
}

func TestResolveOutputDirRejectsEscape(t *testing.T) {
	server := &Server{saveRoot: "/tmp/godingtalk"}

	if _, _, err := server.resolveOutputDir("../bad", "job-1"); err == nil {
		t.Fatal("resolveOutputDir() expected error for parent traversal")
	}
}

func TestWithAuth(t *testing.T) {
	server := &Server{authToken: "secret-token"}
	handler := server.withAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/status", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("without token status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/status", nil)
	req.Header.Set("Authorization", "Bearer secret-token")
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("with token status = %d, want %d", rec.Code, http.StatusNoContent)
	}
}

func TestHandleIndexServesHTML(t *testing.T) {
	server := &Server{}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	server.handleIndex(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("handleIndex() status = %d, want %d", rec.Code, http.StatusOK)
	}

	contentType := rec.Header().Get("Content-Type")
	if !strings.Contains(contentType, "text/html") {
		t.Fatalf("handleIndex() content-type = %q, want text/html", contentType)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "DingTalkGoGoGo") {
		t.Fatalf("handleIndex() body missing console title: %q", body)
	}
}

func TestHandleIndexJSONFallback(t *testing.T) {
	server := &Server{}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Accept", "application/json")
	rec := httptest.NewRecorder()
	server.handleIndex(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("handleIndex() status = %d, want %d", rec.Code, http.StatusOK)
	}

	if got := rec.Header().Get("Content-Type"); !strings.Contains(got, "application/json") {
		t.Fatalf("handleIndex() content-type = %q, want application/json", got)
	}

	var payload struct {
		Name   string   `json:"name"`
		Routes []string `json:"routes"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("handleIndex() decode json: %v", err)
	}
	if payload.Name != "GoDingtalk Server" {
		t.Fatalf("handleIndex() name = %q", payload.Name)
	}
	if len(payload.Routes) == 0 {
		t.Fatal("handleIndex() expected routes")
	}
}

func TestRoutesServeEmbeddedAsset(t *testing.T) {
	server := &Server{config: DefaultConfig()}

	req := httptest.NewRequest(http.MethodGet, "/assets/app.css", nil)
	rec := httptest.NewRecorder()
	server.routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("routes() asset status = %d, want %d", rec.Code, http.StatusOK)
	}

	contentType := rec.Header().Get("Content-Type")
	if !strings.Contains(contentType, "text/css") {
		t.Fatalf("routes() asset content-type = %q, want text/css", contentType)
	}

	if !strings.Contains(rec.Body.String(), "--bg:") {
		t.Fatalf("routes() asset body missing css variables")
	}
}
