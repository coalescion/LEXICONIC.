#!/usr/bin/env python3
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sitemap.xml"
CNAME_FILE = ROOT / "CNAME"


def base_url() -> str:
    if CNAME_FILE.exists():
        host = CNAME_FILE.read_text(encoding="utf-8").strip().splitlines()[0].strip()
        if host:
            if host.startswith("http://") or host.startswith("https://"):
                return host.rstrip("/")
            return f"https://{host}"
    return "https://example.com"


def url_for(path: Path, base: str) -> str:
    if path.name == "index.html" and path.parent == ROOT:
        return f"{base}/"
    return f"{base}/{path.relative_to(ROOT).as_posix()}"


def priority_for(path: Path) -> str:
    if path.name == "index.html" and path.parent == ROOT:
        return "1.0"
    if path.parts[0] == "menu":
        return "0.8"
    if path.parts[0] == "pages":
        return "0.7"
    return "0.6"


def changefreq_for(path: Path) -> str:
    if path.name == "index.html" and path.parent == ROOT:
        return "weekly"
    if path.parts[0] == "menu":
        return "monthly"
    if path.parts[0] == "pages":
        return "monthly"
    return "yearly"


def main() -> int:
    base = base_url()
    html_files = sorted([p for p in ROOT.rglob("*.html") if p.is_file()])

    lines = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ]

    for path in html_files:
        loc = url_for(path, base)
        lastmod = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).date().isoformat()
        priority = priority_for(path)
        changefreq = changefreq_for(path)
        lines.extend([
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{lastmod}</lastmod>",
            f"    <changefreq>{changefreq}</changefreq>",
            f"    <priority>{priority}</priority>",
            "  </url>",
        ])

    lines.append("</urlset>")
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(html_files)} URLs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
