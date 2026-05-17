package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// Config 配置文件结构
type Config struct {
	// 下载线程数
	ThreadCount int `json:"thread_count"`
	// 视频保存目录
	SaveDirectory string `json:"save_directory"`
	// Cookies文件路径
	CookiesFile string `json:"cookies_file"`
	// Chrome超时时间（分钟）
	ChromeTimeout int `json:"chrome_timeout"`
	// HTTP超时时间（秒）
	HTTPTimeout int `json:"http_timeout"`
	// HTTP 服务监听地址
	ServerListen string `json:"server_listen"`
	// HTTP 服务鉴权 Token
	ServerAuthToken string `json:"server_auth_token"`
	// 服务端最大并发任务数
	ServerMaxConcurrentJobs int `json:"server_max_concurrent_jobs"`
	// 对外访问基础 URL
	PublicBaseURL string `json:"public_base_url"`
	// 是否启用 CORS
	ServerEnableCORS bool `json:"server_enable_cors"`
	// 远程控制面地址
	ControlBaseURL string `json:"control_base_url"`
	// 控制面内部调用 Token
	InternalAPIToken string `json:"internal_api_token"`
}

// getConfigDir 获取配置文件夹路径
func getConfigDir() (string, error) {
	if dir := os.Getenv("GODINGTALK_CONFIG_DIR"); dir != "" {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return "", err
		}
		return dir, nil
	}

	candidates := make([]string, 0, 4)

	if userConfigDir, err := os.UserConfigDir(); err == nil {
		candidates = append(candidates, filepath.Join(userConfigDir, "GoDingtalk"))
	}

	if homeDir, err := os.UserHomeDir(); err == nil {
		candidates = append(candidates, filepath.Join(homeDir, ".goDingtalkConfig"))
	}

	if exePath, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exePath), ".goDingtalkConfig"))
	}

	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates, filepath.Join(cwd, ".goDingtalkConfig"))
	}

	var lastErr error
	for _, dir := range candidates {
		if dir == "" {
			continue
		}
		if err := os.MkdirAll(dir, 0755); err == nil {
			return dir, nil
		} else {
			lastErr = err
		}
	}

	if lastErr != nil {
		return "", lastErr
	}

	return "", os.ErrPermission
}

// DefaultConfig 返回默认配置
func DefaultConfig() *Config {
	configDir, err := getConfigDir()
	if err != nil {
		// 如果获取配置文件夹失败，使用当前目录
		configDir = "."
	}

	return &Config{
		ThreadCount:             10,
		SaveDirectory:           "video/",
		CookiesFile:             filepath.Join(configDir, "cookies.json"),
		ChromeTimeout:           20,
		HTTPTimeout:             30,
		ServerListen:            ":8080",
		ServerMaxConcurrentJobs: 1,
		ServerEnableCORS:        true,
	}
}

// LoadConfig 从文件加载配置，如果文件不存在则创建默认配置文件并返回默认配置
func LoadConfig(path string) (*Config, error) {
	// 如果未指定路径，使用配置文件夹中的默认配置文件
	if path == "" || path == "config.json" {
		configDir, err := getConfigDir()
		if err != nil {
			return nil, err
		}
		path = filepath.Join(configDir, "config.json")
	}

	// 检查文件是否存在
	if _, err := os.Stat(path); os.IsNotExist(err) {
		// 文件不存在，创建默认配置文件
		config := DefaultConfig()
		if saveErr := SaveConfig(path, config); saveErr != nil {
			// 保存失败不影响程序运行，只是提示
			return config, nil
		}
		return config, nil
	}

	// 读取配置文件
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// 解析配置
	config := DefaultConfig()
	if err := json.Unmarshal(data, config); err != nil {
		return nil, err
	}

	return config, nil
}

// SaveConfig 保存配置到文件
func SaveConfig(path string, config *Config) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

// ApplyEnvOverrides 用环境变量覆盖配置。
func ApplyEnvOverrides(config *Config) {
	if value := strings.TrimSpace(os.Getenv("GODINGTALK_THREAD_COUNT")); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			config.ThreadCount = parsed
		}
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_SAVE_DIR")); value != "" {
		config.SaveDirectory = value
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_COOKIES_FILE")); value != "" {
		config.CookiesFile = value
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_CHROME_TIMEOUT")); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			config.ChromeTimeout = parsed
		}
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_HTTP_TIMEOUT")); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			config.HTTPTimeout = parsed
		}
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_SERVER_LISTEN")); value != "" {
		config.ServerListen = value
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_SERVER_AUTH_TOKEN")); value != "" {
		config.ServerAuthToken = value
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_SERVER_MAX_CONCURRENT_JOBS")); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			config.ServerMaxConcurrentJobs = parsed
		}
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_PUBLIC_BASE_URL")); value != "" {
		config.PublicBaseURL = strings.TrimRight(value, "/")
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_SERVER_ENABLE_CORS")); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			config.ServerEnableCORS = parsed
		}
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_CONTROL_URL")); value != "" {
		config.ControlBaseURL = strings.TrimRight(value, "/")
	}

	if value := strings.TrimSpace(os.Getenv("GODINGTALK_INTERNAL_API_TOKEN")); value != "" {
		config.InternalAPIToken = value
	}
}
