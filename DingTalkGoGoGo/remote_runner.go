package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type remoteJobClaim struct {
	ID              string            `json:"id"`
	URLs            []string          `json:"urls"`
	Thread          int               `json:"thread"`
	OutputSubdir    string            `json:"output_subdir"`
	CreateVideoList bool              `json:"create_video_list"`
	Cookies         map[string]string `json:"cookies"`
	ZipPassword     string            `json:"zip_password"`
}

type remoteManifestFile struct {
	Name         string `json:"name"`
	LocalPath    string `json:"local_path"`
	RelativePath string `json:"relative_path"`
	SizeBytes    int64  `json:"size_bytes"`
}

type remoteJobManifest struct {
	ID        string               `json:"id"`
	Status    string               `json:"status"`
	OutputDir string               `json:"output_dir"`
	Titles    []string             `json:"titles"`
	Errors    []string             `json:"errors"`
	Files     []remoteManifestFile `json:"files"`
}

type controlPlaneClient struct {
	baseURL string
	token   string
}

func runRemoteJob(controlURL, internalToken, jobID, saveRoot, resultFile string) error {
	controlURL = strings.TrimRight(strings.TrimSpace(controlURL), "/")
	internalToken = strings.TrimSpace(internalToken)
	jobID = strings.TrimSpace(jobID)
	if controlURL == "" {
		return fmt.Errorf("远程控制面地址为空")
	}
	if internalToken == "" {
		return fmt.Errorf("远程控制面内部 Token 为空")
	}
	if jobID == "" {
		return fmt.Errorf("远程任务 ID 为空")
	}

	client := controlPlaneClient{
		baseURL: controlURL,
		token:   internalToken,
	}

	claim, err := client.claimJob(jobID)
	if err != nil {
		return err
	}
	if len(claim.URLs) == 0 {
		return fmt.Errorf("远程任务没有可下载的 URL")
	}
	if claim.Thread <= 0 {
		claim.Thread = 10
	}

	jobDir := filepath.Join(saveRoot, jobID)
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		return fmt.Errorf("创建远程任务目录失败: %w", err)
	}

	cookiesPath := filepath.Join(jobDir, "cookies.json")
	cookiesContent, err := json.MarshalIndent(claim.Cookies, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化远程 Cookies 失败: %w", err)
	}
	if err := os.WriteFile(cookiesPath, cookiesContent, 0600); err != nil {
		return fmt.Errorf("写入远程 Cookies 失败: %w", err)
	}

	config := DefaultConfig()
	config.CookiesFile = cookiesPath
	config.SaveDirectory = jobDir

	var videoListFile string
	if claim.CreateVideoList {
		videoListFile = filepath.Join(jobDir, "video-list.txt")
		if err := createVideoListFile(videoListFile); err != nil {
			fmt.Printf("警告: 创建视频列表文件失败: %v\n", err)
		}
	}

	manifest := remoteJobManifest{
		ID:        claim.ID,
		Status:    jobStatusSucceeded,
		OutputDir: jobDir,
	}

	for _, rawURL := range claim.URLs {
		title, runErr := processURLWithHooks(rawURL, jobDir, claim.Thread, config, videoListFile, downloadHooks{
			OnTitle: func(title string) {
				if err := client.reportProgress(jobID, map[string]any{
					"status":        jobStatusRunning,
					"current_title": title,
				}); err != nil {
					fmt.Printf("警告: 上报标题失败: %v\n", err)
				}
			},
			OnStage: func(stage string) {
				if err := client.reportProgress(jobID, map[string]any{
					"status": jobStatusRunning,
					"stage":  stage,
				}); err != nil {
					fmt.Printf("警告: 上报阶段失败: %v\n", err)
				}
			},
			OnProgress: func(completed int, total int) {
				progress := 0.0
				if total > 0 {
					progress = float64(completed) * 100 / float64(total)
				}
				if err := client.reportProgress(jobID, map[string]any{
					"status":           jobStatusRunning,
					"stage":            "downloading",
					"completed_parts":  completed,
					"total_parts":      total,
					"progress_percent": progress,
				}); err != nil {
					fmt.Printf("警告: 上报进度失败: %v\n", err)
				}
			},
		})

		if title != "" {
			manifest.Titles = append(manifest.Titles, title)
		}
		if runErr != nil {
			manifest.Errors = append(manifest.Errors, runErr.Error())
		}

		if err := client.reportProgress(jobID, map[string]any{
			"status": jobStatusRunning,
			"titles": manifest.Titles,
			"errors": manifest.Errors,
		}); err != nil {
			fmt.Printf("警告: 上报任务汇总失败: %v\n", err)
		}
	}

	manifest.Files, err = collectRemoteManifestFiles(jobDir)
	if err != nil {
		manifest.Errors = append(manifest.Errors, fmt.Sprintf("扫描输出文件失败: %v", err))
	}
	if len(manifest.Errors) > 0 {
		manifest.Status = jobStatusFailed
	}

	// Pack mp4 files into an encrypted zip if zip password is set
	zipPassword := strings.TrimSpace(claim.ZipPassword)
	if zipPassword != "" && manifest.Status == jobStatusSucceeded {
		zipPath := filepath.Join(jobDir, "videos.zip")
		if err := packEncryptedZip(jobDir, zipPath, zipPassword); err != nil {
			manifest.Errors = append(manifest.Errors, fmt.Sprintf("加密打包失败: %v", err))
			manifest.Status = jobStatusFailed
		} else {
			// Replace file list with the single zip
			zipInfo, zipErr := os.Stat(zipPath)
			zipSize := int64(0)
			if zipErr == nil {
				zipSize = zipInfo.Size()
			}
			manifest.Files = []remoteManifestFile{{
				Name:         "videos.zip",
				LocalPath:    zipPath,
				RelativePath: "videos.zip",
				SizeBytes:    zipSize,
			}}
			// Remove original mp4 files to save artifact size
			for _, f := range collectMP4Paths(jobDir) {
				os.Remove(f)
			}
		}
	}

	if resultFile == "" {
		resultFile = filepath.Join(jobDir, "job-result.json")
	}

	content, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化远程结果清单失败: %w", err)
	}
	if err := os.WriteFile(resultFile, content, 0644); err != nil {
		return fmt.Errorf("写入远程结果清单失败: %w", err)
	}

	return nil
}

func collectRemoteManifestFiles(root string) ([]remoteManifestFile, error) {
	files := make([]remoteManifestFile, 0, 4)
	err := filepath.Walk(root, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if info.IsDir() || !strings.HasSuffix(strings.ToLower(info.Name()), ".mp4") {
			return nil
		}

		relativePath, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}

		files = append(files, remoteManifestFile{
			Name:         info.Name(),
			LocalPath:    path,
			RelativePath: filepath.ToSlash(relativePath),
			SizeBytes:    info.Size(),
		})
		return nil
	})
	return files, err
}

func collectMP4Paths(root string) []string {
	var paths []string
	filepath.Walk(root, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil || info.IsDir() || !strings.HasSuffix(strings.ToLower(info.Name()), ".mp4") {
			return nil
		}
		paths = append(paths, path)
		return nil
	})
	return paths
}

func packEncryptedZip(jobDir, zipPath, password string) error {
	// Collect all mp4 files in jobDir (non-recursive)
	var mp4Files []string
	filepath.Walk(jobDir, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil || info.IsDir() || !strings.HasSuffix(strings.ToLower(info.Name()), ".mp4") {
			return nil
		}
		rel, err := filepath.Rel(jobDir, path)
		if err == nil {
			mp4Files = append(mp4Files, rel)
		}
		return nil
	})
	if len(mp4Files) == 0 {
		return fmt.Errorf("no mp4 files found to pack")
	}

	// Use 7z to create password-protected zip
	args := []string{"a", "-tzip", "-p" + password, "-mx=0", zipPath}
	args = append(args, mp4Files...)
	cmd := exec.Command("7z", args...)
	cmd.Dir = jobDir
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("7z failed: %w\n%s", err, string(output))
	}
	return nil
}

func (c controlPlaneClient) claimJob(jobID string) (*remoteJobClaim, error) {
	request, err := http.NewRequest(http.MethodGet, c.baseURL+"/internal/jobs/"+jobID+"/claim", nil)
	if err != nil {
		return nil, err
	}
	request.Header.Set("Authorization", "Bearer "+c.token)
	if value := strings.TrimSpace(os.Getenv("GITHUB_RUN_ID")); value != "" {
		request.Header.Set("X-GitHub-Run-ID", value)
	}
	if value := strings.TrimSpace(os.Getenv("GITHUB_RUN_ATTEMPT")); value != "" {
		request.Header.Set("X-GitHub-Run-Attempt", value)
	}
	if value := strings.TrimSpace(os.Getenv("RUNNER_NAME")); value != "" {
		request.Header.Set("X-Runner-Name", value)
	}

	response, err := httpClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("领取远程任务失败: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("读取远程任务响应失败: %w", err)
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("领取远程任务失败: %s", strings.TrimSpace(string(body)))
	}

	var claim remoteJobClaim
	if err := json.Unmarshal(body, &claim); err != nil {
		return nil, fmt.Errorf("解析远程任务响应失败: %w", err)
	}
	return &claim, nil
}

func (c controlPlaneClient) reportProgress(jobID string, payload map[string]any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	request, err := http.NewRequest(http.MethodPost, c.baseURL+"/internal/jobs/"+jobID+"/progress", bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Authorization", "Bearer "+c.token)
	request.Header.Set("Content-Type", "application/json")

	response, err := httpClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		content, _ := io.ReadAll(response.Body)
		return fmt.Errorf("控制面返回 %d: %s", response.StatusCode, strings.TrimSpace(string(content)))
	}
	return nil
}
