"""Convert the supplied legacy SCP HTML files into structured JSON.

This one-off utility preserves the original text while grouping it into
sections that the React catalogue can render dynamically.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from lxml import html


IMAGE_NAMES = {
    "scp-002": "images/scp-002.jpg",
    "scp-004": "images/scp-004.jpg",
    "scp-005": "images/scp-005.jpg",
}


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def element_text(element) -> str:
    if element.tag == "ol":
        items = [clean_text(" ".join(item.itertext())).lstrip(": ") for item in element.findall(".//li")]
        return "\n".join(f"{index}. {item}" for index, item in enumerate(items, 1))
    return clean_text(" ".join(element.itertext()))


def convert_file(path: Path) -> dict:
    parser = html.HTMLParser(encoding="utf-8")
    document = html.parse(str(path), parser=parser).getroot()
    body = document.find("body")
    item_id = clean_text(" ".join(body.find("h1").itertext())).replace("Item #: ", "")
    object_class = clean_text(" ".join(body.find("h2").itertext())).replace("Object Class: ", "")

    subject = {
        "id": item_id,
        "slug": item_id.lower(),
        "objectClass": object_class,
        "status": "CONTAINED",
        "image": IMAGE_NAMES.get(item_id.lower()),
        "sections": [],
    }

    current = None
    for child in body:
        tag = child.tag.lower() if isinstance(child.tag, str) else ""
        if tag in {"h1", "h2"}:
            continue
        if tag in {"h3", "h4"}:
            current = {"title": clean_text(" ".join(child.itertext())).rstrip(":"), "content": []}
            subject["sections"].append(current)
            continue
        if tag == "p" and current is not None:
            image = child.find(".//img")
            if image is not None and not element_text(child):
                continue
            nested_list = child.find(".//ol")
            text = element_text(nested_list if nested_list is not None else child)
            if text:
                current["content"].append(text)

    description = next(
        (section for section in subject["sections"] if section["title"].lower() == "description"),
        subject["sections"][0],
    )
    first_description = description["content"][0]
    subject["summary"] = first_description if len(first_description) <= 190 else first_description[:187].rstrip() + "..."
    subject["sectionCount"] = len(subject["sections"])
    subject["recordLength"] = sum(len(text.split()) for section in subject["sections"] for text in section["content"])
    return subject


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: convert_html_to_json.py SOURCE_DIRECTORY OUTPUT_FILE")
    source_directory = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    records = [convert_file(path) for path in sorted(source_directory.glob("scp-*.html"))]
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Converted {len(records)} subject files to {output_file}")


if __name__ == "__main__":
    main()
