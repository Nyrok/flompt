# ──────────────────────────────────────────────────────────────────────────────
#  Flompt Extension — Makefile
# ──────────────────────────────────────────────────────────────────────────────

EXTENSION_DIR := $(shell pwd)
DIST_DIR      := $(EXTENSION_DIR)/dist

ZIP_CHROME  := flompt-extension.zip
ZIP_FIREFOX := flompt-firefox.zip

# Shared files (manifest added separately per target)
# To add a new integration: add its file to SHARED_FILES (and update manifests).
SHARED_FILES := background.js \
                content-script.js \
                content-script.css \
                integrations/index.js \
                integrations/chatgpt.js \
                integrations/claude.js \
                integrations/gemini.js \
                icons/icon16.png \
                icons/icon32.png \
                icons/icon48.png \
                icons/icon128.png \
                icons/icon.svg \
                icons/logo.svg \
                fonts/caveat-bold.woff2

.PHONY: all icons pack firefox all-browsers clean help

all: icons pack

all-browsers: icons pack firefox

## icons — Generate PNG icons from icons/icon.svg
icons:
	@echo "🎨 Generating PNG icons…"
	@node generate-icons.js
	@echo ""

## pack — Create the distributable zip for the Chrome Web Store
pack:
	@echo "📦 Packaging Chrome Web Store…"
	@mkdir -p $(DIST_DIR)
	@python3 -c "\
import zipfile, os; \
files = ['manifest.json'] + '$(SHARED_FILES)'.split(); \
out = '$(DIST_DIR)/$(ZIP_CHROME)'; \
zf = zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED); \
[zf.write(f) for f in files if os.path.exists(f)]; \
zf.close(); \
size = os.path.getsize(out); \
print(f'✅ Chrome  → dist/$(ZIP_CHROME)  ({size/1024:.1f} KB)')"

## firefox — Create the distributable zip for Firefox Add-ons (AMO)
## Uses manifest.firefox.json renamed to manifest.json inside the archive
firefox:
	@echo "📦 Packaging Firefox AMO…"
	@mkdir -p $(DIST_DIR)
	@python3 -c "\
import zipfile, os; \
shared = '$(SHARED_FILES)'.split(); \
out = '$(DIST_DIR)/$(ZIP_FIREFOX)'; \
zf = zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED); \
zf.write('manifest.firefox.json', 'manifest.json'); \
[zf.write(f) for f in shared if os.path.exists(f)]; \
zf.close(); \
size = os.path.getsize(out); \
print(f'✅ Firefox → dist/$(ZIP_FIREFOX)  ({size/1024:.1f} KB)')"

## clean — Delete the dist/ directory
clean:
	@echo "🧹 Cleaning…"
	@rm -rf $(DIST_DIR)
	@echo "✅ dist/ deleted"

## help — Display this help
help:
	@echo ""
	@echo "  make icons         Generate PNG icons from icons/icon.svg"
	@echo "  make pack          Create dist/$(ZIP_CHROME)  (Chrome Web Store)"
	@echo "  make firefox       Create dist/$(ZIP_FIREFOX) (Firefox AMO)"
	@echo "  make all           icons + pack (Chrome)"
	@echo "  make all-browsers  icons + pack + firefox (both)"
	@echo "  make clean         Delete dist/"
	@echo ""
