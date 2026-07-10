"""Generate a Markdown review sheet for Motivector draft questions.

Reads docs/motivector_question_draft_v1_long.csv and writes
_docs/question_review_sheet.md for manual copy review. This does not modify
CSV or JSON question data.
"""

from __future__ import annotations

import csv
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs" / "motivector_question_draft_v1_long.csv"
NOTES_PATH = ROOT / "docs" / "question_review_notes.md"
OUTPUT_PATH = ROOT / "docs" / "question_review_sheet.md"

CHECKLIST = [
    "質問文と選択肢の粒度が一致している",
    "選択肢は欲求名の説明ではなく、具体的な行動になっている",
    "同一設問内の選択肢の文体が揃っている",
    "同一設問内の選択肢の抽象度が揃っている",
    "どれも選びたくない問題になっていない",
    "似た選択肢が並びすぎていない",
    "主配点と選択肢文の意味が対応している",
]


def normalize_question_id(value: str) -> str:
    value = value.strip()
    match = re.fullmatch(r"[Qq](\d+)", value)
    if match:
        return f"q{int(match.group(1)):03d}"
    return value.lower()


def escape_table_cell(value: Any) -> str:
    text = "" if value is None else str(value)
    return text.replace("|", "\\|").replace("\n", "<br>")


def read_csv_rows() -> list[dict[str, str]]:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def group_questions(rows: list[dict[str, str]]) -> OrderedDict[str, dict[str, Any]]:
    grouped: OrderedDict[str, dict[str, Any]] = OrderedDict()
    for row in rows:
        question_id = normalize_question_id(row["question_id"])
        question = grouped.setdefault(
            question_id,
            {
                "id": question_id,
                "source_question_id": row["question_id"].strip(),
                "question_type": row.get("question_type", "").strip(),
                "scene": row.get("scene", "").strip(),
                "question_text": row.get("question_text", "").strip(),
                "primary_need": row.get("primary_need", "").strip(),
                "secondary_need": row.get("secondary_need", "").strip(),
                "tertiary_need": row.get("tertiary_need", "").strip(),
                "choices": [],
            },
        )
        question["choices"].append(
            {
                "choice_label": row.get("choice_label", "").strip(),
                "choice_text": row.get("choice_text", "").strip(),
                "primary_need": row.get("primary_need", "").strip(),
                "secondary_need": row.get("secondary_need", "").strip(),
                "tertiary_need": row.get("tertiary_need", "").strip(),
                "score_total": row.get("score_total", "").strip(),
            }
        )
    return grouped


def parse_review_notes() -> dict[str, list[str]]:
    if not NOTES_PATH.exists():
        return {}

    notes: dict[str, list[str]] = {}
    for line in NOTES_PATH.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| q"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 9:
            continue
        question_id, current, issue, suggestion, adopted, target, priority, status, note = cells[:9]
        notes.setdefault(question_id, []).append(
            f"- 既存指摘（{priority} / {target} / {status}）: {issue}<br>"
            f"修正案: {suggestion}<br>採用文: {adopted}<br>備考: {note}"
        )
    return notes


def build_markdown() -> str:
    grouped = group_questions(read_csv_rows())
    review_notes = parse_review_notes()
    lines: list[str] = [
        "# draft質問レビューシート",
        "",
        "このファイルは `tools/generate_question_review_sheet.py` により生成されるレビュー支援用Markdownである。元CSVや生成JSONを直接変更せず、文面レビューの漏れを防ぐために使う。",
        "",
    ]

    for question in grouped.values():
        question_id = question["id"]
        lines.extend(
            [
                f"## {question_id}",
                "",
                f"- question_type: {question['question_type']}",
                f"- scene: {question['scene']}",
                f"- question_text: {question['question_text']}",
                f"- primary_need: {question['primary_need']}",
                f"- secondary_need: {question['secondary_need']}",
                f"- tertiary_need: {question['tertiary_need']}",
                "",
            ]
        )

        if question_id in review_notes:
            lines.append("### 既存レビュー注意")
            lines.append("")
            lines.extend(review_notes[question_id])
            lines.append("")

        lines.extend(
            [
                "| choice_label | choice_text | primary_need | secondary_need | tertiary_need | score_total |",
                "|---|---|---|---|---|---|",
            ]
        )
        for choice in question["choices"]:
            lines.append(
                "| {choice_label} | {choice_text} | {primary_need} | {secondary_need} | {tertiary_need} | {score_total} |".format(
                    choice_label=escape_table_cell(choice["choice_label"]),
                    choice_text=escape_table_cell(choice["choice_text"]),
                    primary_need=escape_table_cell(choice["primary_need"]),
                    secondary_need=escape_table_cell(choice["secondary_need"]),
                    tertiary_need=escape_table_cell(choice["tertiary_need"]),
                    score_total=escape_table_cell(choice["score_total"]),
                )
            )
        lines.append("")
        lines.append("### レビューチェック")
        lines.append("")
        lines.extend(f"- [ ] {item}" for item in CHECKLIST)
        lines.append("")
        lines.append("### メモ")
        lines.append("")
        lines.append("-")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    markdown = build_markdown()
    OUTPUT_PATH.write_text(markdown, encoding="utf-8")
    question_count = markdown.count("\n## q")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")
    print(f"Questions: {question_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
