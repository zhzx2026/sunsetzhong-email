package main

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:web/dist
var serverUIAssets embed.FS

var serverUIDist = mustSubFS(serverUIAssets, "web/dist")

func mustSubFS(embedded fs.FS, dir string) fs.FS {
	sub, err := fs.Sub(embedded, dir)
	if err != nil {
		panic(err)
	}
	return sub
}

func serverUIAssetHandler() http.Handler {
	return http.FileServer(http.FS(serverUIDist))
}

func serveServerUIIndex(w http.ResponseWriter, r *http.Request) {
	r.URL.Path = "/"
	http.FileServer(http.FS(serverUIDist)).ServeHTTP(w, r)
}

func requestWantsJSON(r *http.Request) bool {
	if strings.EqualFold(strings.TrimSpace(r.URL.Query().Get("format")), "json") {
		return true
	}

	accept := strings.ToLower(r.Header.Get("Accept"))
	return strings.Contains(accept, "application/json") && !strings.Contains(accept, "text/html")
}
