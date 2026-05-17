package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"GoDingtalk/M3u8Downloader"

	"github.com/chromedp/cdproto/network"
	cdpage "github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/makiuchi-d/gozxing"
	zxingqrcode "github.com/makiuchi-d/gozxing/qrcode"
	qrencode "github.com/skip2/go-qrcode"

	_ "image/png"
)

// Version 程序版本号，通过 -ldflags "-X main.Version=vX.X.X" 注入
var Version = "dev"

// 全局HTTP客户端，在 main 中根据配置初始化
var httpClient *http.Client

const (
	dingTalkLoginSuccessURL = "https://h5.dingtalk.com"
	dingTalkLoginPageURL    = "https://login.dingtalk.com/oauth2/challenge.htm?client_id=dingavo6at488jbofmjs&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Flv.dingtalk.com%2Fsso%2Flogin%3Fcontinue%3Dhttps%253A%252F%252Fh5.dingtalk.com%252Fgroup-live-share%252Findex.htm%253Ftype%253D2%2523%252F"
)

type pageRect struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
}

type downloadHooks struct {
	OnTitle    func(string)
	OnStage    func(string)
	OnProgress func(completed int, total int)
}

// initHTTPClient 初始化全局HTTP客户端
func initHTTPClient(timeout int) {
	httpClient = &http.Client{
		Timeout: time.Duration(timeout) * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
		},
	}
}

// ffmpeg 把ts转换mp4
func ffmpeg(ts, tempDir, saveDir string) error {
	fmt.Println("正在转换ts为mp4...")
	tsPath := filepath.Join(tempDir, ts+".ts")
	mp4Path := filepath.Join(saveDir, ts+".mp4")

	cmd := exec.Command("ffmpeg", "-i", tsPath, "-c:v", "copy", "-c:a", "copy", "-f", "mp4", "-y", mp4Path)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("FFmpeg转换失败: %v\n输出: %s\n", err, string(output))
		return fmt.Errorf("ffmpeg conversion failed: %w", err)
	}
	fmt.Println(ts + ".mp4 转换完成")

	return nil
}

func chromeExecAllocatorOptions(headless bool) []chromedp.ExecAllocatorOption {
	var opts []chromedp.ExecAllocatorOption
	if headless {
		opts = append(opts, chromedp.DefaultExecAllocatorOptions[:]...)
	} else {
		opts = append(opts, chromedp.DefaultExecAllocatorOptions[3:]...)
	}

	return append(opts,
		chromedp.Flag("disable-blink-features", "AutomationControlled"),
		chromedp.Flag("excludeSwitches", "enable-automation"),
		chromedp.NoFirstRun,
		chromedp.NoDefaultBrowserCheck,
	)
}

func saveCookiesFile(path string, siteCookies []*network.Cookie) error {
	cookies := make(map[string]string)
	for _, cookie := range siteCookies {
		cookies[cookie.Name] = cookie.Value
	}

	jsonCookies, err := json.Marshal(cookies)
	if err != nil {
		return fmt.Errorf("序列化 Cookies 失败: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return fmt.Errorf("创建 Cookies 目录失败: %w", err)
	}

	if err := os.WriteFile(path, jsonCookies, 0600); err != nil {
		return fmt.Errorf("保存 Cookies 文件失败: %w", err)
	}

	return nil
}

func waitForLoginSuccess(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("等待扫码登录超时: %w", ctx.Err())
		default:
		}

		var currentURL string
		if err := chromedp.Run(ctx, chromedp.Evaluate(`window.location.href`, &currentURL)); err != nil {
			return err
		}

		if strings.Contains(currentURL, dingTalkLoginSuccessURL) {
			fmt.Println("登录成功，正在获取Cookies...")
			return nil
		}

		time.Sleep(2 * time.Second)
	}
}

func decodeQRCodeFromImage(pngBytes []byte) (string, error) {
	img, _, err := image.Decode(bytes.NewReader(pngBytes))
	if err != nil {
		return "", err
	}

	bmp, err := gozxing.NewBinaryBitmapFromImage(img)
	if err != nil {
		return "", err
	}

	result, err := zxingqrcode.NewQRCodeReader().Decode(bmp, nil)
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(result.GetText()), nil
}

func decodeQRCodeFromSource(src string) (string, error) {
	src = strings.TrimSpace(src)
	if src == "" {
		return "", fmt.Errorf("empty QR source")
	}

	var content []byte
	if strings.HasPrefix(src, "data:image/") {
		parts := strings.SplitN(src, ",", 2)
		if len(parts) != 2 {
			return "", fmt.Errorf("invalid data URL")
		}
		decoded, err := base64.StdEncoding.DecodeString(parts[1])
		if err != nil {
			return "", err
		}
		content = decoded
	} else {
		response, err := httpClient.Get(src)
		if err != nil {
			return "", err
		}
		defer response.Body.Close()

		if response.StatusCode < 200 || response.StatusCode >= 300 {
			return "", fmt.Errorf("unexpected status %d", response.StatusCode)
		}

		body, err := io.ReadAll(response.Body)
		if err != nil {
			return "", err
		}
		content = body
	}

	return decodeQRCodeFromImage(content)
}

func saveDebugFile(path string, data []byte) error {
	if len(data) == 0 {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func saveDebugJSON(path string, value any) error {
	content, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return saveDebugFile(path, content)
}

func extractQRCodeImageSources(ctx context.Context) ([]string, error) {
	var sources []string
	err := chromedp.Run(ctx, chromedp.Evaluate(`(() => {
		const result = [];
		const push = (value) => {
		  if (typeof value === 'string' && value.trim() && !result.includes(value.trim())) {
		    result.push(value.trim());
		  }
		};

		const visibleSquares = (elements) => Array.from(elements)
		  .map((node) => {
		    const rect = node.getBoundingClientRect();
		    const style = window.getComputedStyle(node);
		    const squareRatio = rect.width > 0 && rect.height > 0
		      ? Math.min(rect.width, rect.height) / Math.max(rect.width, rect.height)
		      : 0;
		    return { node, rect, style, squareRatio, area: rect.width * rect.height };
		  })
		  .filter((item) => item.rect.width >= 120 && item.rect.height >= 120 && item.squareRatio >= 0.75 && item.style.display !== 'none' && item.style.visibility !== 'hidden')
		  .sort((a, b) => b.area - a.area)
		  .slice(0, 5);

		visibleSquares(document.querySelectorAll('img')).forEach((item) => push(item.node.currentSrc || item.node.src));
		visibleSquares(document.querySelectorAll('canvas')).forEach((item) => {
		  try {
		    push(item.node.toDataURL('image/png'));
		  } catch (error) {}
		});

		return result;
	})()`, &sources))
	return sources, err
}

func captureQRCodeScreenshot(ctx context.Context) ([]byte, error) {
	var rect pageRect
	err := chromedp.Run(ctx, chromedp.Evaluate(`(() => {
		const candidates = Array.from(document.querySelectorAll('img'))
		  .map((img) => {
		    const rect = img.getBoundingClientRect();
		    const style = window.getComputedStyle(img);
		    const area = rect.width * rect.height;
		    const squareRatio = rect.width > 0 && rect.height > 0
		      ? Math.min(rect.width, rect.height) / Math.max(rect.width, rect.height)
		      : 0;
		    return {
		      x: rect.left,
		      y: rect.top,
		      width: rect.width,
		      height: rect.height,
		      area,
		      squareRatio,
		      visible: rect.width >= 120 && rect.height >= 120 && style.visibility !== 'hidden' && style.display !== 'none'
		    };
		  })
		  .filter((item) => item.visible && item.squareRatio >= 0.75)
		  .sort((a, b) => b.area - a.area);

		return candidates[0] || null;
	})()`, &rect))
	if err == nil && rect.Width > 0 && rect.Height > 0 {
		padding := 12.0
		clip := &cdpage.Viewport{
			X:      maxFloat(rect.X-padding, 0),
			Y:      maxFloat(rect.Y-padding, 0),
			Width:  rect.Width + padding*2,
			Height: rect.Height + padding*2,
			Scale:  2,
		}
		var screenshot []byte
		shotErr := chromedp.Run(ctx, chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			screenshot, err = cdpage.CaptureScreenshot().WithFormat(cdpage.CaptureScreenshotFormatPng).WithClip(clip).Do(ctx)
			return err
		}))
		if shotErr == nil {
			return screenshot, nil
		}
	}

	var screenshot []byte
	if err := chromedp.Run(ctx, chromedp.FullScreenshot(&screenshot, 100)); err != nil {
		return nil, err
	}
	return screenshot, nil
}

func captureViewportScreenshot(ctx context.Context) ([]byte, error) {
	var screenshot []byte
	err := chromedp.Run(ctx, chromedp.ActionFunc(func(ctx context.Context) error {
		var err error
		screenshot, err = cdpage.CaptureScreenshot().WithFormat(cdpage.CaptureScreenshotFormatPng).Do(ctx)
		return err
	}))
	return screenshot, err
}

func ensureQRCodeTab(ctx context.Context, debugDir string) error {
	type tabTarget struct {
		Clicked bool    `json:"clicked"`
		X       float64 `json:"x"`
		Y       float64 `json:"y"`
	}

	var target tabTarget
	err := chromedp.Run(ctx, chromedp.Evaluate(`(() => {
		const labels = ['qr code', 'scan', '扫码'];
		const textMatches = (node) => {
		  const text = (node.textContent || '').trim().toLowerCase();
		  return labels.some((label) => text === label || text.includes(label));
		};
		const isVisible = (node) => {
		  const rect = node.getBoundingClientRect();
		  const style = window.getComputedStyle(node);
		  return rect.width > 8 && rect.height > 8 && style.display !== 'none' && style.visibility !== 'hidden';
		};
		const scoreNode = (node) => {
		  const rect = node.getBoundingClientRect();
		  const text = (node.textContent || '').trim().toLowerCase();
		  let score = 0;
		  if (text === 'qr code' || text === '扫码') score += 100;
		  if (text.includes('qr code') || text.includes('扫码')) score += 50;
		  if (node.getAttribute('role') === 'tab') score += 40;
		  if (node.tagName === 'BUTTON') score += 20;
		  if (rect.width < 260 && rect.height < 80) score += 20;
		  return score;
		};

		const elements = Array.from(document.querySelectorAll('*')).filter((node) => textMatches(node) && isVisible(node));
		let best = null;
		let bestScore = -1;

		for (const node of elements) {
		  let current = node;
		  for (let depth = 0; current && depth < 4; depth += 1) {
		    if (!isVisible(current)) {
		      current = current.parentElement;
		      continue;
		    }
		    const rect = current.getBoundingClientRect();
		    if (rect.width > 320 || rect.height > 120) {
		      current = current.parentElement;
		      continue;
		    }
		    const score = scoreNode(current);
		    if (score > bestScore) {
		      best = current;
		      bestScore = score;
		    }
		    current = current.parentElement;
		  }
		}

		if (!best) return { clicked: false, x: 0, y: 0 };
		const rect = best.getBoundingClientRect();
		return {
		  clicked: true,
		  x: rect.left + rect.width / 2,
		  y: rect.top + rect.height / 2
		};
	})()`, &target))
	if err != nil {
		return err
	}

	if target.Clicked {
		if err := chromedp.Run(ctx, chromedp.MouseClickXY(target.X, target.Y)); err != nil {
			return err
		}
	}

	if strings.TrimSpace(debugDir) != "" {
		message := time.Now().Format(time.RFC3339) + " 尝试切换到二维码登录页签: " + strconv.FormatBool(target.Clicked) +
			" @" + strconv.FormatFloat(target.X, 'f', 1, 64) + "," + strconv.FormatFloat(target.Y, 'f', 1, 64) + "\n"
		_ = saveDebugFile(filepath.Join(debugDir, "login-qr-tab.log"), []byte(message))
	}

	// Give the page a moment to render the QR code panel after the tab switch.
	time.Sleep(1500 * time.Millisecond)
	return nil
}

func waitForLoginQRCodeURL(ctx context.Context, debugDir string) (string, []byte, error) {
	deadline := time.Now().Add(45 * time.Second)
	var lastErr error
	var attempt int
	var attemptLogs []string

	appendLog := func(message string) {
		line := fmt.Sprintf("%s %s", time.Now().Format(time.RFC3339), message)
		fmt.Println(line)
		attemptLogs = append(attemptLogs, line)
		if strings.TrimSpace(debugDir) != "" {
			_ = saveDebugFile(filepath.Join(debugDir, "login-qr-debug.log"), []byte(strings.Join(attemptLogs, "\n")+"\n"))
		}
	}

	for time.Now().Before(deadline) {
		attempt++
		appendLog("二维码识别尝试 #" + strconv.Itoa(attempt))

		screenshot, err := captureViewportScreenshot(ctx)
		if err == nil {
			if strings.TrimSpace(debugDir) != "" {
				_ = saveDebugFile(filepath.Join(debugDir, "login-page-latest.png"), screenshot)
			}
			qrURL, decodeErr := decodeQRCodeFromImage(screenshot)
			if decodeErr == nil && qrURL != "" {
				appendLog("通过整页截图识别到登录二维码")
				return qrURL, screenshot, nil
			}
			appendLog("整页截图未识别到二维码: " + decodeErr.Error())
			lastErr = decodeErr
		} else if !strings.Contains(strings.ToLower(err.Error()), "invalid context") {
			appendLog("整页截图失败: " + err.Error())
			lastErr = err
		} else {
			appendLog("整页截图命中 invalid context，等待页面稳定后重试")
		}

		sources, err := extractQRCodeImageSources(ctx)
		if err == nil {
			if strings.TrimSpace(debugDir) != "" {
				_ = saveDebugJSON(filepath.Join(debugDir, "login-qr-sources-latest.json"), sources)
			}
			appendLog("发现候选二维码源数量: " + strconv.Itoa(len(sources)))
			for _, src := range sources {
				qrURL, decodeErr := decodeQRCodeFromSource(src)
				if decodeErr == nil && qrURL != "" {
					appendLog("通过页面二维码源识别到登录二维码")
					return qrURL, nil, nil
				}
				appendLog("页面二维码源识别失败: " + decodeErr.Error())
				lastErr = decodeErr
			}
		} else if !strings.Contains(strings.ToLower(err.Error()), "invalid context") {
			appendLog("读取页面二维码源失败: " + err.Error())
			lastErr = err
		} else {
			appendLog("读取页面二维码源命中 invalid context，等待页面稳定后重试")
		}

		screenshot, err = captureQRCodeScreenshot(ctx)
		if err == nil {
			if strings.TrimSpace(debugDir) != "" {
				_ = saveDebugFile(filepath.Join(debugDir, "login-page-crop-latest.png"), screenshot)
			}
			qrURL, decodeErr := decodeQRCodeFromImage(screenshot)
			if decodeErr == nil && qrURL != "" {
				appendLog("通过裁切二维码区域识别到登录二维码")
				return qrURL, screenshot, nil
			}
			appendLog("裁切二维码区域未识别到二维码: " + decodeErr.Error())
			lastErr = decodeErr
		} else if !strings.Contains(strings.ToLower(err.Error()), "invalid context") {
			appendLog("裁切二维码区域失败: " + err.Error())
			lastErr = err
		} else {
			appendLog("裁切二维码区域命中 invalid context，等待页面稳定后重试")
		}

		time.Sleep(1500 * time.Millisecond)
	}

	if lastErr == nil {
		lastErr = fmt.Errorf("未识别到登录二维码")
	}
	appendLog("二维码识别结束，最终失败: " + lastErr.Error())
	return "", nil, lastErr
}

func writeLoginQRCodeArtifacts(qrURL, outputPath string) error {
	if strings.TrimSpace(outputPath) == "" {
		outputPath = "login-qr.png"
	}
	outputPath = filepath.Clean(outputPath)

	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		return fmt.Errorf("创建二维码输出目录失败: %w", err)
	}

	qrCode, err := qrencode.New(qrURL, qrencode.Medium)
	if err != nil {
		return fmt.Errorf("生成二维码失败: %w", err)
	}

	if err := qrCode.WriteFile(320, outputPath); err != nil {
		return fmt.Errorf("写入二维码图片失败: %w", err)
	}

	fmt.Println("扫码登录链接:")
	fmt.Println(qrURL)
	fmt.Println()
	fmt.Println("请使用钉钉扫一扫扫描下面的二维码完成登录:")
	fmt.Println(qrCode.ToSmallString(false))
	fmt.Printf("二维码图片已生成: %s\n", outputPath)

	return nil
}

func maxFloat(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func startChromeQRLogin(config *Config, qrOutputPath string) error {
	fmt.Println("正在启动无头Chrome生成登录二维码...")
	debugDir := filepath.Dir(filepath.Clean(qrOutputPath))
	if err := os.MkdirAll(debugDir, 0755); err != nil {
		return fmt.Errorf("创建调试目录失败: %w", err)
	}
	fmt.Printf("二维码调试产物目录: %s\n", debugDir)

	log.SetOutput(io.Discard)
	defer log.SetOutput(os.Stderr)

	parentCtx, cancel := chromedp.NewExecAllocator(context.Background(), chromeExecAllocatorOptions(true)...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(parentCtx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, time.Duration(config.ChromeTimeout)*time.Minute)
	defer cancel()

	if err := chromedp.Run(ctx,
		network.Enable(),
		chromedp.EmulateViewport(1440, 1100),
		chromedp.Navigate(dingTalkLoginPageURL),
		chromedp.WaitVisible(`body`, chromedp.ByQuery),
	); err != nil {
		return fmt.Errorf("打开登录页失败: %w", err)
	}
	_ = saveDebugFile(filepath.Join(debugDir, "login-qr-debug.log"), []byte(time.Now().Format(time.RFC3339)+" 登录页已打开，开始识别二维码\n"))
	if err := ensureQRCodeTab(ctx, debugDir); err != nil {
		return fmt.Errorf("切换二维码登录页签失败: %w", err)
	}

	qrURL, rawQRImage, err := waitForLoginQRCodeURL(ctx, debugDir)
	if err != nil {
		return fmt.Errorf("提取登录二维码失败: %w", err)
	}
	if len(rawQRImage) > 0 {
		_ = saveDebugFile(filepath.Join(debugDir, "login-qr-raw-success.png"), rawQRImage)
	}
	_ = saveDebugFile(filepath.Join(debugDir, "login-qr-url.txt"), []byte(qrURL+"\n"))

	if err := writeLoginQRCodeArtifacts(qrURL, qrOutputPath); err != nil {
		return err
	}
	fmt.Printf("二维码图片路径: %s\n", qrOutputPath)
	fmt.Printf("二维码原始链接已保存: %s\n", filepath.Join(debugDir, "login-qr-url.txt"))

	fmt.Println("等待扫码确认...")
	if err := waitForLoginSuccess(ctx); err != nil {
		return err
	}

	var siteCookies []*network.Cookie
	err = chromedp.Run(ctx, chromedp.ActionFunc(func(ctx context.Context) error {
		var innerErr error
		siteCookies, innerErr = network.GetCookies().Do(ctx)
		return innerErr
	}))
	if err != nil {
		return fmt.Errorf("获取 Cookies 失败: %w", err)
	}

	if err := saveCookiesFile(config.CookiesFile, siteCookies); err != nil {
		return err
	}
	fmt.Printf("Cookies 文件已保存: %s\n", config.CookiesFile)

	fmt.Println("Cookies保存成功")
	return nil
}

// startChrome 函数启动Chrome浏览器，访问钉钉登录页面，获取并保存Cookies到本地文件。
func startChrome(config *Config) error {
	fmt.Println("正在启动Chrome获取Cookies...")

	// 抑制 chromedp 的日志输出
	log.SetOutput(io.Discard)
	defer log.SetOutput(os.Stderr)

	var siteCookies []*network.Cookie
	parentCtx, cancel := chromedp.NewExecAllocator(context.Background(), chromeExecAllocatorOptions(false)...)
	defer cancel()

	ctx, cancel := chromedp.NewContext(parentCtx)
	defer cancel()

	// 使用配置文件中的超时时间
	ctx, cancel = context.WithTimeout(ctx, time.Duration(config.ChromeTimeout)*time.Minute)
	defer cancel()

	fmt.Println("请在浏览器中完成登录...")
	err := chromedp.Run(ctx,
		network.Enable(), // 启用网络事件
		chromedp.Navigate(dingTalkLoginPageURL),
		chromedp.WaitVisible(`body`, chromedp.ByQuery),
		chromedp.ActionFunc(func(ctx context.Context) error {
			return waitForLoginSuccess(ctx)
		}),
		chromedp.ActionFunc(func(ctx context.Context) error {
			// 到达此处，说明已经跳转到了指定的URL
			var err error
			siteCookies, err = network.GetCookies().Do(ctx)
			if err != nil {
				return fmt.Errorf("获取 Cookies 失败: %w", err)
			}
			return nil
		}),
	)

	if err != nil {
		return fmt.Errorf("Chrome 自动化操作失败: %w", err)
	}

	if err := saveCookiesFile(config.CookiesFile, siteCookies); err != nil {
		return err
	}

	fmt.Println("Cookies保存成功")
	return nil
}

// M3u8Down 函数用于下载直播回放视频
// title：直播标题
// playbackUrl：直播回放链接
// saveDir: 保存目录
// Thread：线程数
func M3u8Down(title, playbackUrl, saveDir string, Thread int) error {
	return m3u8Down(title, playbackUrl, saveDir, Thread, downloadHooks{})
}

func m3u8Down(title, playbackUrl, saveDir string, Thread int, hooks downloadHooks) error {
	if strings.TrimSpace(playbackUrl) == "" {
		return fmt.Errorf("回放地址为空，可能 cookies 无效、回放未生成，或当前链接没有下载权限")
	}

	if _, err := url.ParseRequestURI(playbackUrl); err != nil {
		return fmt.Errorf("回放地址无效: %w", err)
	}

	// 创建临时文件夹
	tempDir := filepath.Join(saveDir, ".videoTemp")

	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("创建临时文件夹失败: %w", err)
	}

	m3u8 := M3u8Downloader.NewDownloader()
	m3u8.SetUrl(playbackUrl)
	m3u8.SetMovieName(title)
	m3u8.SetNumOfThread(Thread)
	m3u8.SetIfShowTheBar(true)
	m3u8.SetSaveDirectory(tempDir)
	m3u8.SetProgressCallback(hooks.OnProgress)

	if hooks.OnStage != nil {
		hooks.OnStage("downloading")
	}
	if !m3u8.DefaultDownload() {
		// 下载失败时清理临时文件夹
		os.RemoveAll(tempDir)
		return fmt.Errorf("下载失败")
	}
	fmt.Println("下载成功")

	if hooks.OnStage != nil {
		hooks.OnStage("converting")
	}
	if err := ffmpeg(title, tempDir, saveDir); err != nil {
		// 转换失败时清理临时文件夹
		os.RemoveAll(tempDir)
		return fmt.Errorf("视频转换失败: %w", err)
	}

	// 转换成功后清理临时文件夹
	if err := os.RemoveAll(tempDir); err != nil {
		fmt.Printf("警告: 删除临时文件夹失败: %v\n", err)
	} else {
		fmt.Println("临时文件夹清理完成")
	}

	return nil
}

// getLiveRoomPublicInfo 函数用于获取钉钉直播间的公开信息
// roomId：直播间ID
// liveUuid：直播UUID
func getLiveRoomPublicInfo(roomId, liveUuid, saveDir string, Thread int, config *Config) (string, error) {
	return getLiveRoomPublicInfoWithHooks(roomId, liveUuid, saveDir, Thread, config, downloadHooks{})
}

func getLiveRoomPublicInfoWithHooks(roomId, liveUuid, saveDir string, Thread int, config *Config, hooks downloadHooks) (string, error) {
	// 构造URL
	urlStr := "https://lv.dingtalk.com/getOpenLiveInfo?roomId=" + roomId + "&liveUuid=" + liveUuid
	urlObj, err := url.Parse(urlStr)
	if err != nil {
		return "", fmt.Errorf("URL 解析失败: %w", err)
	}

	// 创建请求
	req, err := http.NewRequest("GET", urlObj.String(), nil)
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	// 读取Cookies文件
	jsonCookies, err := os.ReadFile(config.CookiesFile)
	if err != nil {
		return "", fmt.Errorf("读取 Cookies 文件失败: %w", err)
	}

	var cookies map[string]string
	if err := json.Unmarshal(jsonCookies, &cookies); err != nil {
		return "", fmt.Errorf("解析 Cookies 失败: %w", err)
	}

	// 添加Cookies到请求
	var cookieStr strings.Builder
	for name, value := range cookies {
		cookieStr.WriteString(fmt.Sprintf("%s=%s; ", name, value))
	}
	// 确保 PC_SESSION 使用 LV_PC_SESSION 的值
	CookiepcSession, ok := cookies["LV_PC_SESSION"]
	if !ok {
		return "", fmt.Errorf("未找到 LV_PC_SESSION Cookie，请重新登录")
	}
	cookieStr.WriteString(fmt.Sprintf("PC_SESSION=%s", CookiepcSession))
	cookieHeader := cookieStr.String()

	// 设置请求头
	req.Header.Set("Host", "lv.dingtalk.com")
	req.Header.Set("Cookie", cookieHeader)
	req.Header.Set("Sec-Ch-Ua", `"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"`)
	req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
	req.Header.Set("Sec-Ch-Ua-Platform", "macOS")
	req.Header.Set("Dnt", "1")
	req.Header.Set("Upgrade-Insecure-Requests", "1")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
	req.Header.Set("Sec-Fetch-Site", "none")
	req.Header.Set("Sec-Fetch-Mode", "navigate")
	req.Header.Set("Sec-Fetch-User", "?1")
	req.Header.Set("Sec-Fetch-Dest", "document")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")

	// 发送请求（使用全局 HTTP 客户端）
	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("发送请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 读取响应内容
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应内容失败: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析响应 JSON 失败: %w", err)
	}

	// 安全地获取嵌套字段
	openLiveDetailModel, ok := result["openLiveDetailModel"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("响应格式错误: 未找到 openLiveDetailModel 字段")
	}

	title, ok := openLiveDetailModel["title"].(string)
	if !ok {
		return "", fmt.Errorf("响应格式错误: 未找到 title 字段")
	}

	playbackUrl, ok := openLiveDetailModel["playbackUrl"].(string)
	if !ok {
		return "", fmt.Errorf("响应格式错误: 未找到 playbackUrl 字段")
	}
	playbackUrl = strings.TrimSpace(playbackUrl)

	fmt.Println("标题:", title)
	fmt.Println("回放地址:", playbackUrl)

	if hooks.OnTitle != nil {
		hooks.OnTitle(title)
	}

	if playbackUrl == "" {
		return title, fmt.Errorf("未获取到回放地址，可能 cookies 无效、直播回放未就绪，或该回放没有权限访问")
	}

	if err := m3u8Down(title, playbackUrl, saveDir, Thread, hooks); err != nil {
		return title, err
	}

	return title, nil
}

// processURL 函数接收一个URL字符串作为参数，并解析出其中的roomId和liveUuid参数
// 然后调用getLiveRoomPublicInfo函数进行处理
// 如果URL解析出错或缺少roomId或liveUuid参数，则打印错误信息并返回
func processURL(urlStr, saveDir string, Thread int, config *Config, videoListFile string) (string, error) {
	return processURLWithHooks(urlStr, saveDir, Thread, config, videoListFile, downloadHooks{})
}

func processURLWithHooks(urlStr, saveDir string, Thread int, config *Config, videoListFile string, hooks downloadHooks) (string, error) {
	// 解析 URL
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return "", fmt.Errorf("解析 URL 时出错: %w", err)
	}

	// 提取查询参数中的 roomId 和 liveUuid
	queryParams := parsedURL.Query()
	roomId := queryParams.Get("roomId")
	liveUuid := queryParams.Get("liveUuid")
	if roomId == "" || liveUuid == "" {
		return "", fmt.Errorf("URL 中缺少 roomId 或 liveUuid 参数")
	}

	title, err := getLiveRoomPublicInfoWithHooks(roomId, liveUuid, saveDir, Thread, config, hooks)

	// 下载完成后立即追加标题到视频列表文件
	if err == nil && videoListFile != "" && title != "" {
		if appendErr := appendTitleToVideoListFile(videoListFile, title); appendErr != nil {
			fmt.Printf("警告: 追加标题到视频列表文件失败: %v\n", appendErr)
		} else {
			fmt.Printf("标题已添加到视频列表文件: %s\n", title)
		}
	}

	return title, err
}

// processURLFromFile 从文件中读取URL进行处理
func processURLFromFile(filePath, saveDir string, Thread int, config *Config, videoListFile string) ([]string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("打开文件时出错: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNum := 0
	var errors []error
	var titles []string

	for scanner.Scan() {
		lineNum++
		urlStr := strings.TrimSpace(scanner.Text())
		if urlStr == "" || strings.HasPrefix(urlStr, "#") {
			continue // 跳过空行和注释
		}

		fmt.Printf("\n[%d] 处理 URL: %s\n", lineNum, urlStr)
		title, err := processURL(urlStr, saveDir, Thread, config, videoListFile)
		if err != nil {
			errMsg := fmt.Errorf("第 %d 行处理失败: %w", lineNum, err)
			fmt.Println(errMsg)
			errors = append(errors, errMsg)
		} else {
			titles = append(titles, title)
			// 标题已经在 processURL 函数中追加到视频列表文件，这里不需要重复追加
		}
	}

	if err := scanner.Err(); err != nil {
		return titles, fmt.Errorf("读取文件时出错: %w", err)
	}

	if len(errors) > 0 {
		return titles, fmt.Errorf("批量处理完成，%d 个 URL 处理失败", len(errors))
	}

	return titles, nil
}

// checkCookiesValid 检查cookies文件是否存在且有效
func checkCookiesValid(cookiesFile string) bool {
	// 检查文件是否存在
	if _, err := os.Stat(cookiesFile); os.IsNotExist(err) {
		return false
	}

	// 尝试读取和解析
	jsonCookies, err := os.ReadFile(cookiesFile)
	if err != nil {
		return false
	}

	var cookies map[string]string
	if err := json.Unmarshal(jsonCookies, &cookies); err != nil {
		return false
	}

	// 检查关键cookie是否存在
	if _, ok := cookies["LV_PC_SESSION"]; !ok {
		return false
	}

	return true
}

// main 函数是程序的入口点
func main() {
	fmt.Println("  _______   _______   _______   _______   _______   _______ ")
	fmt.Println(" |       | |       | |   _   | |   _   | |   _   | |   _   |")
	fmt.Println(" |   Go  | |  Ding | |  | |  | |  | |  | |  | |  | |  | |  |")
	fmt.Println(" |       | |  talk | |  |_|  | |  |_|  | |  |_|  | |  |_|  |")
	fmt.Println(" |_______| |_______| |_______| |_______| |_______| |_______|")

	// 判断系统类型
	fmt.Printf("当前系统:")
	switch runtime.GOOS {
	case "windows":
		fmt.Println("Windows")
	case "linux":
		fmt.Println("Linux")
	case "darwin":
		fmt.Println("macOS")
	default:
		fmt.Println("Others")
	}

	// 命令行参数
	versionFlag := flag.Bool("version", false, "显示版本号")
	configFile := flag.String("config", "", "配置文件路径")
	serveFlag := flag.Bool("serve", false, "以 HTTP 服务模式运行")
	runRemoteJobFlag := flag.Bool("runRemoteJob", false, "运行远程控制面的单个任务（给 GitHub Actions runner 使用）")
	listenFlag := flag.String("listen", "", "HTTP 服务监听地址 (默认: :8080)")
	authTokenFlag := flag.String("authToken", "", "HTTP 服务 Bearer Token")
	publicBaseURLFlag := flag.String("publicBaseURL", "", "服务对外访问基础 URL，用于生成下载链接")
	maxJobsFlag := flag.Int("maxJobs", 0, "HTTP 服务最大并发任务数")
	controlURLFlag := flag.String("controlURL", "", "远程控制面基础 URL")
	internalTokenFlag := flag.String("internalToken", "", "远程控制面内部 Token")
	jobIDFlag := flag.String("jobID", "", "远程任务 ID")
	resultFileFlag := flag.String("resultFile", "", "远程任务结果清单输出路径")
	loginFlag := flag.Bool("login", false, "强制重新登录获取Cookies")
	loginQRFlag := flag.Bool("loginQR", false, "无头模式生成钉钉登录二维码，适合 GitHub Actions / 远程环境")
	loginQRFileFlag := flag.String("loginQRFile", "login-qr.png", "二维码登录模式输出的二维码图片路径")
	urlFlag := flag.String("url", "", "需要下载的回放URL，格式为 -url \"https://n.dingtalk.com/dingding/live-room/index.html?roomId=XXXX&liveUuid=XXXX\"")
	urlFile := flag.String("urlFile", "", "包含需要下载的回放URL的文件路径，格式为 -urlFile \"/path/to/file\"")
	Thread := flag.Int("thread", 0, "下载线程数 (默认: 10)")
	saveDir := flag.String("saveDir", "", "视频保存目录 (默认: video/)")
	videoListFile := flag.String("videoList", "", "视频列表文件路径，格式为 -videoList \"/path/to/video_list.txt\"")
	httpTimeout := flag.Int("httpTimeout", 0, "HTTP超时时间，单位秒 (默认: 30)")
	chromeTimeout := flag.Int("chromeTimeout", 0, "Chrome登录超时时间，单位分钟 (默认: 20)")
	cookiesFile := flag.String("cookies", "", "Cookies文件路径")

	flag.Parse()

	// 显示版本号
	if *versionFlag {
		fmt.Printf("GoDingtalk %s\n", Version)
		os.Exit(0)
	}

	// 加载配置文件
	config, err := LoadConfig(*configFile)
	if err != nil {
		fmt.Printf("警告: 加载配置文件失败: %v，使用默认配置\n", err)
		config = DefaultConfig()
	}
	ApplyEnvOverrides(config)

	// 命令行参数覆盖配置文件
	if *Thread <= 0 {
		*Thread = config.ThreadCount
	}
	if *saveDir == "" {
		*saveDir = config.SaveDirectory
	}
	if *httpTimeout > 0 {
		config.HTTPTimeout = *httpTimeout
	}
	if *chromeTimeout > 0 {
		config.ChromeTimeout = *chromeTimeout
	}
	if *cookiesFile != "" {
		config.CookiesFile = *cookiesFile
	}
	if *listenFlag != "" {
		config.ServerListen = *listenFlag
	}
	if *authTokenFlag != "" {
		config.ServerAuthToken = *authTokenFlag
	}
	if *publicBaseURLFlag != "" {
		config.PublicBaseURL = strings.TrimRight(*publicBaseURLFlag, "/")
	}
	if *maxJobsFlag > 0 {
		config.ServerMaxConcurrentJobs = *maxJobsFlag
	}
	if *controlURLFlag != "" {
		config.ControlBaseURL = strings.TrimRight(*controlURLFlag, "/")
	}
	if *internalTokenFlag != "" {
		config.InternalAPIToken = *internalTokenFlag
	}

	// 初始化全局 HTTP 客户端
	initHTTPClient(config.HTTPTimeout)

	if *runRemoteJobFlag {
		if *saveDir == "" {
			*saveDir = filepath.Join(os.TempDir(), "godingtalk-remote")
		}
		if err := runRemoteJob(config.ControlBaseURL, config.InternalAPIToken, *jobIDFlag, *saveDir, *resultFileFlag); err != nil {
			fmt.Printf("错误: 远程任务执行失败: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("远程任务处理完成")
		return
	}

	if *serveFlag {
		if *saveDir != "" {
			config.SaveDirectory = *saveDir
		}
		if err := runServer(config); err != nil {
			fmt.Printf("错误: 启动服务失败: %v\n", err)
			os.Exit(1)
		}
		return
	}

	// 参数验证
	if *urlFlag == "" && *urlFile == "" && !*loginFlag && !*loginQRFlag {
		fmt.Println("错误: 未提供 URL 或 URL 文件路径")
		flag.Usage()
		os.Exit(1)
	}

	if *Thread <= 0 || *Thread > 100 {
		fmt.Println("错误: 线程数必须在 1-100 之间")
		os.Exit(1)
	}

	// 规范化保存目录路径
	*saveDir = filepath.Clean(*saveDir) + string(filepath.Separator)

	// 检查cookies是否有效，无效则重新登录
	if *loginQRFlag {
		if err := startChromeQRLogin(config, *loginQRFileFlag); err != nil {
			fmt.Printf("错误: 二维码登录失败: %v\n", err)
			os.Exit(1)
		}
	} else if *loginFlag || !checkCookiesValid(config.CookiesFile) {
		if *loginFlag {
			fmt.Println("强制重新登录...")
		} else {
			fmt.Println("Cookies无效或不存在，需要重新登录...")
		}
		if err := startChrome(config); err != nil {
			fmt.Printf("错误: 获取Cookies失败: %v\n", err)
			os.Exit(1)
		}
	} else {
		fmt.Println("使用现有Cookies...")
	}

	// 仅登录模式：只登录不下载
	if *urlFlag == "" && *urlFile == "" {
		fmt.Println("\n登录完成！")
		os.Exit(0)
	}

	// 创建视频列表文件（在下载前创建）
	if *videoListFile != "" {
		if err := createVideoListFile(*videoListFile); err != nil {
			fmt.Printf("\n警告: 创建视频列表文件失败: %v\n", err)
		} else {
			fmt.Printf("视频列表文件已创建: %s\n", *videoListFile)
		}
	}

	// 处理URL
	if *urlFlag != "" {
		_, err = processURL(*urlFlag, *saveDir, *Thread, config, *videoListFile)
	} else if *urlFile != "" {
		_, err = processURLFromFile(*urlFile, *saveDir, *Thread, config, *videoListFile)
	}

	if err != nil {
		fmt.Printf("\n错误: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\n所有任务完成！")
}

// createVideoListFile 创建视频列表文件（在下载前创建空文件）
func createVideoListFile(filePath string) error {
	// 创建或清空文件
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("创建文件失败: %w", err)
	}
	defer file.Close()

	return nil
}

// appendTitleToVideoListFile 向视频列表文件追加标题
func appendTitleToVideoListFile(filePath, title string) error {
	// 以追加模式打开文件
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("打开文件失败: %w", err)
	}
	defer file.Close()

	// 写入标题
	_, err = file.WriteString(title + "\n")
	if err != nil {
		return fmt.Errorf("写入文件失败: %w", err)
	}

	return nil
}
