package main

import (
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const (
	jobStatusQueued    = "queued"
	jobStatusRunning   = "running"
	jobStatusSucceeded = "succeeded"
	jobStatusFailed    = "failed"
)

var jobCounter uint64

type DownloadFile struct {
	Name         string `json:"name"`
	RelativePath string `json:"relative_path"`
	DownloadURL  string `json:"download_url,omitempty"`
}

type DownloadJob struct {
	ID              string         `json:"id"`
	Status          string         `json:"status"`
	Stage           string         `json:"stage,omitempty"`
	URLs            []string       `json:"urls"`
	Thread          int            `json:"thread"`
	RelativeSaveDir string         `json:"relative_save_dir"`
	CurrentTitle    string         `json:"current_title,omitempty"`
	CompletedParts  int            `json:"completed_parts,omitempty"`
	TotalParts      int            `json:"total_parts,omitempty"`
	ProgressPercent float64        `json:"progress_percent,omitempty"`
	VideoListPath   string         `json:"video_list_path,omitempty"`
	Titles          []string       `json:"titles,omitempty"`
	Files           []DownloadFile `json:"files,omitempty"`
	Errors          []string       `json:"errors,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	StartedAt       *time.Time     `json:"started_at,omitempty"`
	FinishedAt      *time.Time     `json:"finished_at,omitempty"`
}

type downloadRequest struct {
	URL             string   `json:"url"`
	URLs            []string `json:"urls"`
	Thread          int      `json:"thread"`
	OutputSubdir    string   `json:"output_subdir"`
	CreateVideoList *bool    `json:"create_video_list,omitempty"`
}

type cookiesRequest struct {
	Cookies map[string]string `json:"cookies"`
}

type serverStatus struct {
	Version             string `json:"version"`
	Listen              string `json:"listen"`
	SaveRoot            string `json:"save_root"`
	PublicBaseURL       string `json:"public_base_url,omitempty"`
	CookiesFile         string `json:"cookies_file"`
	CookiesValid        bool   `json:"cookies_valid"`
	MaxConcurrentJobs   int    `json:"max_concurrent_jobs"`
	QueuedOrRunningJobs int    `json:"queued_or_running_jobs"`
}

type Server struct {
	config      *Config
	saveRoot    string
	publicBase  string
	authToken   string
	concurrency chan struct{}

	mu   sync.RWMutex
	jobs map[string]*DownloadJob
}

func runServer(config *Config) error {
	saveRoot, err := filepath.Abs(config.SaveDirectory)
	if err != nil {
		return fmt.Errorf("解析保存目录失败: %w", err)
	}

	if err := os.MkdirAll(saveRoot, 0755); err != nil {
		return fmt.Errorf("创建保存目录失败: %w", err)
	}

	if config.CookiesFile == "" {
		configDir, dirErr := getConfigDir()
		if dirErr != nil {
			return fmt.Errorf("获取配置目录失败: %w", dirErr)
		}
		config.CookiesFile = filepath.Join(configDir, "cookies.json")
	}

	if err := os.MkdirAll(filepath.Dir(config.CookiesFile), 0755); err != nil {
		return fmt.Errorf("创建 cookies 目录失败: %w", err)
	}

	if config.ServerListen == "" {
		config.ServerListen = ":8080"
	}

	if config.ServerMaxConcurrentJobs <= 0 {
		config.ServerMaxConcurrentJobs = 1
	}

	server := &Server{
		config:      config,
		saveRoot:    saveRoot,
		publicBase:  strings.TrimRight(config.PublicBaseURL, "/"),
		authToken:   config.ServerAuthToken,
		concurrency: make(chan struct{}, config.ServerMaxConcurrentJobs),
		jobs:        make(map[string]*DownloadJob),
	}

	log.Printf("server mode enabled listen=%s save_root=%s", config.ServerListen, saveRoot)
	return http.ListenAndServe(config.ServerListen, server.routes())
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/assets/", serverUIAssetHandler())
	mux.HandleFunc("/", s.handleIndex)
	mux.HandleFunc("/healthz", s.handleHealth)
	mux.Handle("/files/", s.withAuth(http.StripPrefix("/files/", http.FileServer(http.Dir(s.saveRoot)))))
	mux.Handle("/api/status", s.withAuth(http.HandlerFunc(s.handleStatus)))
	mux.Handle("/api/cookies", s.withAuth(http.HandlerFunc(s.handleCookies)))
	mux.Handle("/api/downloads", s.withAuth(http.HandlerFunc(s.handleDownloads)))
	mux.Handle("/api/downloads/", s.withAuth(http.HandlerFunc(s.handleDownload)))
	return s.withCORS(mux)
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if s.config.ServerEnableCORS {
			origin := r.Header.Get("Origin")
			if origin == "" {
				origin = "*"
			} else {
				w.Header().Set("Vary", "Origin")
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) withAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if s.authToken == "" {
			next.ServeHTTP(w, r)
			return
		}

		token := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
		if subtle.ConstantTimeCompare([]byte(token), []byte(s.authToken)) != 1 {
			writeJSON(w, http.StatusUnauthorized, map[string]string{
				"error": "missing or invalid bearer token",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	if requestWantsJSON(r) {
		writeJSON(w, http.StatusOK, map[string]any{
			"name":    "GoDingtalk Server",
			"version": Version,
			"routes": []string{
				"GET /",
				"GET /healthz",
				"GET /api/status",
				"POST /api/cookies",
				"POST /api/downloads",
				"GET /api/downloads",
				"GET /api/downloads/{jobId}",
				"GET /files/{path}",
			},
		})
		return
	}

	serveServerUIIndex(w, r)
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleStatus(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, serverStatus{
		Version:             Version,
		Listen:              s.config.ServerListen,
		SaveRoot:            s.saveRoot,
		PublicBaseURL:       s.publicBase,
		CookiesFile:         s.config.CookiesFile,
		CookiesValid:        checkCookiesValid(s.config.CookiesFile),
		MaxConcurrentJobs:   cap(s.concurrency),
		QueuedOrRunningJobs: s.activeJobCount(),
	})
}

func (s *Server) handleCookies(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var request cookiesRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}

	if len(request.Cookies) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "cookies payload is empty"})
		return
	}

	if _, ok := request.Cookies["LV_PC_SESSION"]; !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "LV_PC_SESSION cookie is required"})
		return
	}

	content, err := json.MarshalIndent(request.Cookies, "", "  ")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to encode cookies"})
		return
	}

	if err := os.MkdirAll(filepath.Dir(s.config.CookiesFile), 0755); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create cookies directory"})
		return
	}

	if err := os.WriteFile(s.config.CookiesFile, content, 0600); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save cookies"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":       "cookies saved",
		"cookies_file":  s.config.CookiesFile,
		"cookies_valid": true,
	})
}

func (s *Server) handleDownloads(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.handleListDownloads(w, r)
	case http.MethodPost:
		s.handleCreateDownload(w, r)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

func (s *Server) handleListDownloads(w http.ResponseWriter, _ *http.Request) {
	jobs := s.listJobs()
	writeJSON(w, http.StatusOK, map[string]any{"jobs": jobs})
}

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	jobID := strings.TrimPrefix(r.URL.Path, "/api/downloads/")
	if jobID == "" {
		http.NotFound(w, r)
		return
	}

	job, ok := s.getJob(jobID)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "job not found"})
		return
	}

	writeJSON(w, http.StatusOK, job)
}

func (s *Server) handleCreateDownload(w http.ResponseWriter, r *http.Request) {
	var request downloadRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}

	urls := normalizeURLs(request.URL, request.URLs)
	if len(urls) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "at least one url is required"})
		return
	}

	threadCount := request.Thread
	if threadCount <= 0 {
		threadCount = s.config.ThreadCount
	}
	if threadCount <= 0 || threadCount > 100 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "thread must be between 1 and 100"})
		return
	}

	jobID := nextJobID()
	saveDir, relativeSaveDir, err := s.resolveOutputDir(request.OutputSubdir, jobID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	createVideoList := true
	if request.CreateVideoList != nil {
		createVideoList = *request.CreateVideoList
	}

	job := &DownloadJob{
		ID:              jobID,
		Status:          jobStatusQueued,
		Stage:           "queued",
		URLs:            urls,
		Thread:          threadCount,
		RelativeSaveDir: relativeSaveDir,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	if createVideoList {
		job.VideoListPath = filepath.Join(saveDir, "video-list.txt")
	}

	s.mu.Lock()
	s.jobs[job.ID] = job
	s.mu.Unlock()

	go s.runJob(job.ID, saveDir)

	writeJSON(w, http.StatusAccepted, job)
}

func (s *Server) runJob(jobID, saveDir string) {
	defer func() {
		if recovered := recover(); recovered != nil {
			log.Printf("job panic recovered job=%s err=%v", jobID, recovered)
			s.finishJob(jobID, jobStatusFailed, nil, []string{fmt.Sprintf("任务执行异常: %v", recovered)})
		}
	}()

	s.concurrency <- struct{}{}
	defer func() {
		<-s.concurrency
	}()

	startedAt := time.Now()
	s.updateJob(jobID, func(job *DownloadJob) {
		job.Status = jobStatusRunning
		job.Stage = "resolving"
		job.StartedAt = &startedAt
		job.UpdatedAt = startedAt
	})

	if !checkCookiesValid(s.config.CookiesFile) {
		s.finishJob(jobID, jobStatusFailed, nil, []string{"cookies are missing or invalid, upload cookies first"})
		return
	}

	if err := os.MkdirAll(saveDir, 0755); err != nil {
		s.finishJob(jobID, jobStatusFailed, nil, []string{fmt.Sprintf("创建任务目录失败: %v", err)})
		return
	}

	job, ok := s.getJob(jobID)
	if !ok {
		return
	}

	if job.VideoListPath != "" {
		if err := createVideoListFile(job.VideoListPath); err != nil {
			log.Printf("create video list file failed job=%s err=%v", jobID, err)
		}
	}

	var (
		titles []string
		errors []string
	)

	for _, rawURL := range job.URLs {
		title, err := processURLWithHooks(rawURL, saveDir, job.Thread, s.config, job.VideoListPath, downloadHooks{
			OnTitle: func(title string) {
				s.updateJob(jobID, func(current *DownloadJob) {
					current.CurrentTitle = title
					current.UpdatedAt = time.Now()
				})
			},
			OnStage: func(stage string) {
				s.updateJob(jobID, func(current *DownloadJob) {
					current.Stage = stage
					if stage == "converting" && current.TotalParts > 0 {
						current.CompletedParts = current.TotalParts
						current.ProgressPercent = 100
					}
					current.UpdatedAt = time.Now()
				})
			},
			OnProgress: func(completed int, total int) {
				s.updateJob(jobID, func(current *DownloadJob) {
					current.Stage = "downloading"
					current.CompletedParts = completed
					current.TotalParts = total
					if total > 0 {
						current.ProgressPercent = float64(completed) * 100 / float64(total)
					} else {
						current.ProgressPercent = 0
					}
					current.UpdatedAt = time.Now()
				})
			},
		})
		if title != "" {
			titles = append(titles, title)
		}
		if err != nil {
			errors = append(errors, err.Error())
		}
		s.updateJob(jobID, func(current *DownloadJob) {
			current.Titles = append([]string(nil), titles...)
			current.Errors = append([]string(nil), errors...)
			current.UpdatedAt = time.Now()
		})
	}

	files := s.collectFiles(saveDir, job.RelativeSaveDir)
	status := jobStatusSucceeded
	if len(errors) > 0 {
		status = jobStatusFailed
	}
	s.finishJob(jobID, status, files, errors)
}

func (s *Server) finishJob(jobID, status string, files []DownloadFile, errors []string) {
	finishedAt := time.Now()
	s.updateJob(jobID, func(job *DownloadJob) {
		job.Status = status
		if status == jobStatusSucceeded {
			job.Stage = "completed"
			if job.TotalParts > 0 {
				job.CompletedParts = job.TotalParts
				job.ProgressPercent = 100
			}
		} else {
			job.Stage = "failed"
		}
		job.Files = files
		job.Errors = append([]string(nil), errors...)
		job.FinishedAt = &finishedAt
		job.UpdatedAt = finishedAt
	})
}

func (s *Server) resolveOutputDir(outputSubdir, jobID string) (string, string, error) {
	relativeDir := strings.TrimSpace(outputSubdir)
	if relativeDir == "" {
		relativeDir = jobID
	}

	relativeDir = filepath.Clean(relativeDir)
	if relativeDir == "." {
		relativeDir = jobID
	}
	if filepath.IsAbs(relativeDir) {
		return "", "", fmt.Errorf("output_subdir must be relative")
	}
	if relativeDir == ".." || strings.HasPrefix(relativeDir, ".."+string(filepath.Separator)) {
		return "", "", fmt.Errorf("output_subdir cannot escape save root")
	}

	return filepath.Join(s.saveRoot, relativeDir), filepath.ToSlash(relativeDir), nil
}

func (s *Server) collectFiles(saveDir, relativeSaveDir string) []DownloadFile {
	entries, err := os.ReadDir(saveDir)
	if err != nil {
		return nil
	}

	files := make([]DownloadFile, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".mp4") {
			continue
		}

		relativePath := path.Join(relativeSaveDir, entry.Name())
		files = append(files, DownloadFile{
			Name:         entry.Name(),
			RelativePath: relativePath,
			DownloadURL:  s.buildDownloadURL(urlPathEscape(relativePath)),
		})
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Name < files[j].Name
	})

	return files
}

func (s *Server) buildDownloadURL(escapedRelativePath string) string {
	if s.publicBase == "" {
		return ""
	}
	return s.publicBase + "/files/" + strings.TrimLeft(escapedRelativePath, "/")
}

func (s *Server) listJobs() []*DownloadJob {
	s.mu.RLock()
	defer s.mu.RUnlock()

	jobs := make([]*DownloadJob, 0, len(s.jobs))
	for _, job := range s.jobs {
		jobs = append(jobs, cloneJob(job))
	}

	sort.Slice(jobs, func(i, j int) bool {
		return jobs[i].CreatedAt.After(jobs[j].CreatedAt)
	})

	return jobs
}

func (s *Server) getJob(jobID string) (*DownloadJob, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	job, ok := s.jobs[jobID]
	if !ok {
		return nil, false
	}

	return cloneJob(job), true
}

func (s *Server) updateJob(jobID string, update func(*DownloadJob)) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job, ok := s.jobs[jobID]
	if !ok {
		return
	}

	update(job)
}

func (s *Server) activeJobCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	count := 0
	for _, job := range s.jobs {
		if job.Status == jobStatusQueued || job.Status == jobStatusRunning {
			count++
		}
	}
	return count
}

func cloneJob(job *DownloadJob) *DownloadJob {
	if job == nil {
		return nil
	}

	cloned := *job
	cloned.URLs = append([]string(nil), job.URLs...)
	cloned.Titles = append([]string(nil), job.Titles...)
	cloned.Errors = append([]string(nil), job.Errors...)
	cloned.Files = append([]DownloadFile(nil), job.Files...)
	return &cloned
}

func normalizeURLs(primary string, batch []string) []string {
	normalized := make([]string, 0, 1+len(batch))
	if trimmed := strings.TrimSpace(primary); trimmed != "" {
		normalized = append(normalized, trimmed)
	}

	for _, item := range batch {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			normalized = append(normalized, trimmed)
		}
	}

	return normalized
}

func nextJobID() string {
	return fmt.Sprintf("job-%d-%04d", time.Now().Unix(), atomic.AddUint64(&jobCounter, 1))
}

func urlPathEscape(value string) string {
	parts := strings.Split(filepath.ToSlash(value), "/")
	for i, part := range parts {
		parts[i] = url.PathEscape(part)
	}
	return strings.Join(parts, "/")
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if payload == nil {
		return
	}

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json response failed: %v", err)
	}
}
