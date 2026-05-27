package handler

import (
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"

	"resume/internal/apperrors"
	"resume/internal/render"
	"resume/internal/service"
)

const maxUploadSize = 5 << 20 // 5 MB

var allowedMIMETypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// PhotoHandler handles photo upload for users.
type PhotoHandler struct {
	svc       service.UserService
	uploadDir string
}

// NewPhotoHandler creates a new PhotoHandler.
func NewPhotoHandler(svc service.UserService, uploadDir string) *PhotoHandler {
	return &PhotoHandler{svc: svc, uploadDir: uploadDir}
}

func (h *PhotoHandler) upload(w http.ResponseWriter, r *http.Request) {
	userID, err := parseUUID(r, "id")
	if err != nil {
		render.Error(w, err)
		return
	}

	if err = r.ParseMultipartForm(maxUploadSize); err != nil {
		render.Error(w, fmt.Errorf("file too large or invalid form: %w", apperrors.ErrBadRequest))
		return
	}

	file, header, err := r.FormFile("photo")
	if err != nil {
		render.Error(w, fmt.Errorf("field 'photo' is required: %w", apperrors.ErrBadRequest))
		return
	}
	defer func() { _ = file.Close() }()

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		buf := make([]byte, 512)
		n, _ := file.Read(buf)
		mimeType = http.DetectContentType(buf[:n])
		if _, seekErr := file.Seek(0, io.SeekStart); seekErr != nil {
			render.Error(w, fmt.Errorf("read file: %w", seekErr))
			return
		}
	}

	// Strip parameters like "image/jpeg; charset=utf-8"
	mimeType, _, _ = mime.ParseMediaType(mimeType)

	ext, allowed := allowedMIMETypes[mimeType]
	if !allowed {
		render.Error(w, fmt.Errorf("unsupported file type, use JPEG PNG or WebP: %w", apperrors.ErrBadRequest))
		return
	}

	if err = os.MkdirAll(h.uploadDir, 0o755); err != nil {
		render.Error(w, fmt.Errorf("create upload dir: %w", err))
		return
	}

	filename := uuid.New().String() + ext
	dst, err := os.Create(filepath.Join(h.uploadDir, filename))
	if err != nil {
		render.Error(w, fmt.Errorf("create file: %w", err))
		return
	}

	if _, err = io.Copy(dst, file); err != nil {
		_ = dst.Close()
		render.Error(w, fmt.Errorf("save file: %w", err))
		return
	}

	if err = dst.Close(); err != nil {
		render.Error(w, fmt.Errorf("close file: %w", err))
		return
	}

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	publicURL := scheme + "://" + r.Host + "/uploads/" + filename
	user, err := h.svc.UpdateUserPhoto(r.Context(), userID, publicURL)
	if err != nil {
		render.Error(w, err)
		return
	}

	render.JSON(w, http.StatusOK, user)
}
