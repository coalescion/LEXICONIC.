#!/usr/bin/env python3
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

BASE_URL = "https://lexiconic.global"
OG_IMAGE = "https://lexiconic.global/images/lexiconic%20torus.png"
SITE_NAME = "lexiconic."
SCHEMA_TYPE = "WebPage"


class FirstTextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_body = False
        self.in_script = False
        self.in_style = False
        self.skip_depth = 0
        self.texts = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag == "body":
            self.in_body = True
        elif tag == "script":
            self.in_script = True
        elif tag == "style":
            self.in_style = True

        classes = ""
        for key, value in attrs:
            if key.lower() == "class":
                classes = value or ""
                break
        if "sr-only" in classes.split():
            self.skip_depth += 1

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "body":
            self.in_body = False
        elif tag == "script":
            self.in_script = False
        elif tag == "style":
            self.in_style = False

        if self.skip_depth > 0 and tag not in ("script", "style"):
            self.skip_depth -= 1

    def handle_data(self, data):
        if not self.in_body or self.in_script or self.in_style or self.skip_depth:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.texts.append(text)


def first_sentence(text):
    match = re.search(r"(.+?[.!?])(?:\s|$)", text)
    if match:
        return match.group(1).strip()
    return text.strip()


def extract_title(raw):
    match = re.search(r"<title>\s*(.*?)\s*</title>", raw, re.IGNORECASE | re.DOTALL)
    if not match:
        return ""
    return re.sub(r"\s+", " ", match.group(1)).strip()


def extract_description(raw):
    match = re.search(
        r"<meta\s+name=[\"']description[\"'][^>]*content=[\"'](.*?)[\"']\s*/?>",
        raw,
        re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return ""
    return re.sub(r"\s+", " ", html.unescape(match.group(1))).strip()


def upsert_meta_description(raw, description):
    desc_tag = f'<meta name="description" content="{description}">'
    if re.search(r"<meta\s+name=[\"']description[\"'][^>]*>", raw, re.IGNORECASE):
        return re.sub(
            r"<meta\s+name=[\"']description[\"'][^>]*>",
            desc_tag,
            raw,
            flags=re.IGNORECASE,
        )

    title_match = re.search(r"</title>", raw, re.IGNORECASE)
    if title_match:
        insert_at = title_match.end()
        return raw[:insert_at] + "\n    " + desc_tag + raw[insert_at:]

    head_match = re.search(r"<head[^>]*>", raw, re.IGNORECASE)
    if head_match:
        insert_at = head_match.end()
        return raw[:insert_at] + "\n    " + desc_tag + raw[insert_at:]

    return raw


def remove_existing_meta(raw):
    raw = re.sub(r"\s*<link\s+rel=[\"']canonical[\"'][^>]*>", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*<meta\s+(?:property|name)=[\"']og:[^\"']+[\"'][^>]*>", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*<meta\s+name=[\"']twitter:[^\"']+[\"'][^>]*>", "", raw, flags=re.IGNORECASE)
    raw = re.sub(
        r"\s*<script\s+type=[\"']application/ld\+json[\"'][^>]*>.*?</script>",
        "",
        raw,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return raw


def insert_block(raw, block):
    match = re.search(r"<meta\s+name=[\"']description[\"'][^>]*>", raw, re.IGNORECASE)
    if match:
        insert_at = match.end()
        return raw[:insert_at] + "\n" + block + raw[insert_at:]

    match = re.search(r"</title>", raw, re.IGNORECASE)
    if match:
        insert_at = match.end()
        return raw[:insert_at] + "\n" + block + raw[insert_at:]

    match = re.search(r"<head[^>]*>", raw, re.IGNORECASE)
    if match:
        insert_at = match.end()
        return raw[:insert_at] + "\n" + block + raw[insert_at:]

    return raw


def build_block(title, description, canonical):
    title_escaped = html.escape(title, quote=True)
    desc_escaped = html.escape(description, quote=True)
    json_ld = {
        "@context": "https://schema.org",
        "@type": SCHEMA_TYPE,
        "name": title,
        "url": canonical,
        "description": description,
    }
    json_text = json.dumps(json_ld, ensure_ascii=True, indent=4)
    json_text = json_text.replace("\n", "\n        ")

    return "\n".join(
        [
            f'    <link rel="canonical" href="{canonical}">',
            f'    <meta property="og:site_name" content="{SITE_NAME}">',
            f'    <meta property="og:title" content="{title_escaped}">',
            f'    <meta property="og:description" content="{desc_escaped}">',
            '    <meta property="og:type" content="website">',
            f'    <meta property="og:url" content="{canonical}">',
            f'    <meta property="og:image" content="{OG_IMAGE}">',
            '    <meta name="twitter:card" content="summary_large_image">',
            f'    <meta name="twitter:title" content="{title_escaped}">',
            f'    <meta name="twitter:description" content="{desc_escaped}">',
            f'    <meta name="twitter:image" content="{OG_IMAGE}">',
            '    <script type="application/ld+json">',
            f"        {json_text}",
            "    </script>",
        ]
    )


def main():
    updated = 0
    for path in Path(".").rglob("*.html"):
        raw = path.read_text(encoding="utf-8")
        title = extract_title(raw)
        if not title:
            continue

        parser = FirstTextParser()
        parser.feed(raw)
        description = ""
        if parser.texts:
            description = first_sentence(parser.texts[0])
        if not description:
            description = extract_description(raw) or title

        desc_escaped = html.escape(description, quote=True)
        raw = upsert_meta_description(raw, desc_escaped)

        rel = path.as_posix()
        canonical = BASE_URL + "/" if rel == "index.html" else f"{BASE_URL}/{rel}"

        block = build_block(title, description, canonical)
        cleaned = remove_existing_meta(raw)
        new = insert_block(cleaned, block)

        if new != raw:
            path.write_text(new, encoding="utf-8")
            updated += 1

    print(f"updated {updated} files")


if __name__ == "__main__":
    main()
