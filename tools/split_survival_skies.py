from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
LEGACY = ROOT / "legacy" / "index.html"
CSS_DIR = ROOT / "css"
JS_DIR = ROOT / "js"

if not INDEX.exists():
    raise SystemExit("index.html not found")

html = INDEX.read_text(encoding="utf-8")
LEGACY.parent.mkdir(parents=True, exist_ok=True)
if not LEGACY.exists():
    shutil.copy2(INDEX, LEGACY)

styles = re.findall(r"<style(?:\s[^>]*)?>(.*?)</style>", html, flags=re.I | re.S)
scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, flags=re.I | re.S)

if not styles:
    raise SystemExit("No inline style block found; refusing to overwrite the project.")
if not scripts:
    raise SystemExit("No inline script block found; refusing to overwrite the project.")
if len(scripts) != 1:
    raise SystemExit(f"Expected one game script, found {len(scripts)}; refusing to guess.")

CSS_DIR.mkdir(parents=True, exist_ok=True)
JS_DIR.mkdir(parents=True, exist_ok=True)

body_match = re.search(r"<body\b[^>]*>(.*?)</body>", html, flags=re.I | re.S)
head_match = re.search(r"<head\b[^>]*>(.*?)</head>", html, flags=re.I | re.S)
if not body_match or not head_match:
    raise SystemExit("Could not find document head/body; refusing to overwrite the project.")

body = re.sub(r"\s*<script(?:\s[^>]*)?>.*?</script>\s*", "\n", body_match.group(1), flags=re.I | re.S)
head = re.sub(r"\s*<style(?:\s[^>]*)?>.*?</style>\s*", "\n", head_match.group(1), flags=re.I | re.S)

(CSS_DIR / "main.css").write_text("\n\n".join(s.strip() for s in styles) + "\n", encoding="utf-8")

js = scripts[0].strip()
header_re = re.compile(r"/\*\s*=+\s*\n\s*(.*?)\s*\n\s*=+\s*\*/", flags=re.S)
matches = list(header_re.finditer(js))
if len(matches) < 3:
    raise SystemExit("Could not find enough section banners to safely modularize the game.")

sections = []
for i, match in enumerate(matches):
    start = match.start()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(js)
    chunk = js[start:end].strip()
    title = re.sub(r"[^a-zA-Z0-9]+", "-", match.group(1).strip().lower()).strip("-") or f"section-{i+1}"
    sections.append((title, chunk))

for old in JS_DIR.glob("*.js"):
    old.unlink()

script_paths = []
used = {}
for number, (title, chunk) in enumerate(sections, start=1):
    used[title] = used.get(title, 0) + 1
    suffix = f"-{used[title]}" if used[title] > 1 else ""
    filename = f"{number:02d}-{title}{suffix}.js"
    (JS_DIR / filename).write_text(chunk + "\n", encoding="utf-8")
    script_paths.append(f"js/{filename}")

css_link = '  <link rel="stylesheet" href="css/main.css">\n'
head = head.rstrip() + "\n" + css_link
script_tags = "\n".join(f'  <script src="{p}"></script>' for p in script_paths)
new_html = "<!doctype html>\n<html lang=\"en\">\n<head>\n" + head.strip() + "\n</head>\n<body>\n" + body.strip() + "\n\n" + script_tags + "\n</body>\n</html>\n"
INDEX.write_text(new_html, encoding="utf-8")

print(f"Created {len(script_paths)} JavaScript files and css/main.css")
