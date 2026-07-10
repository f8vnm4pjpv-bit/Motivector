"""Convert Motivector long-form question CSV into app-compatible JSON.

This script reads docs/motivector_question_draft_v1_long.csv and writes
$data/questions_draft_v1.json without replacing data/questions.json.
"""

from __future__ import annotations

import csv
import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "docs" / "motivector_question_draft_v1_long.csv"
DESIRES_PATH = ROOT / "data" / "desires.json"
OUTPUT_PATH = ROOT / "data" / "questions_draft_v1.json"

DESIRE_NAME_TO_ID = {
    "安定欲求": "stability",
    "自律欲求": "autonomy",
    "成長欲求": "growth",
    "探究欲求": "exploration",
    "関係欲求": "relationship",
    "評価欲求": "recognition",
    "影響欲求": "influence",
    "秩序欲求": "order",
    "刺激欲求": "stimulation",
    "創造欲求": "creation",
    "意味欲求": "meaning",
}

REQUIRED_COLUMNS = [
    "question_id",
    "question_text",
    "choice_label",
    "choice_text",
]

META_COLUMNS = [
    "question_type",
    "scene",
    "primary_need",
    "secondary_need",
    "tertiary_need",
    "score_total",
    "source_bundle_id",
    "source_example_ids",
    "review_note",
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_question_id(value: str) -> str:
    value = value.strip()
    match = re.fullmatch(r"[Qq](\d+)", value)
    if match:
        return f"q{int(match.group(1)):03d}"
    return value.lower()


def parse_float(value: str | None, *, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    return float(value)


def split_ids(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in re.split(r"[,/、]", value) if item.strip()]


def build_need_meta(row: dict[str, str], key: str) -> dict[str, str] | None:
    name = row.get(key, "").strip()
    if not name:
        return None
    return {
        "name": name,
        "id": DESIRE_NAME_TO_ID.get(name, ""),
    }


def validate_mapping(desires: list[dict[str, Any]]) -> None:
    desire_ids = {desire["id"] for desire in desires}
    missing_ids = sorted(set(DESIRE_NAME_TO_ID.values()) - desire_ids)
    if missing_ids:
        raise ValueError(f"DESIRE_NAME_TO_ID has ids not found in desires.json: {missing_ids}")

    desire_names = {desire["name"] for desire in desires}
    missing_names = sorted(set(DESIRE_NAME_TO_ID) - desire_names)
    if missing_names:
        raise ValueError(f"DESIRE_NAME_TO_ID has names not found in desires.json: {missing_names}")


def read_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        rows = list(reader)
    return fieldnames, rows


def assert_required_columns(fieldnames: list[str]) -> None:
    missing = [column for column in REQUIRED_COLUMNS if column not in fieldnames]
    missing.extend(name for name in DESIRE_NAME_TO_ID if name not in fieldnames)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")


def convert_rows(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    grouped: OrderedDict[str, dict[str, Any]] = OrderedDict()

    for row in rows:
        source_question_id = row["question_id"].strip()
        question_id = normalize_question_id(source_question_id)
        question_text = row["question_text"].strip()
        choice_text = row["choice_text"].strip()

        if not source_question_id or not question_text or not choice_text:
            raise ValueError(f"Required value is empty in row: {row}")

        question = grouped.setdefault(
            question_id,
            {
                "id": question_id,
                "text": question_text,
                "choices": [],
                "meta": {
                    "source_question_id": source_question_id,
                    "question_type": row.get("question_type", "").strip(),
                    "scene": row.get("scene", "").strip(),
                },
            },
        )

        if question["text"] != question_text:
            raise ValueError(f"question_text mismatch for {source_question_id}")

        scores: dict[str, float] = {}
        for need_name, desire_id in DESIRE_NAME_TO_ID.items():
            score = parse_float(row.get(need_name))
            if score > 0:
                scores[desire_id] = score

        meta: dict[str, Any] = {
            "choice_label": row.get("choice_label", "").strip(),
            "score_total": parse_float(row.get("score_total"), default=sum(scores.values())),
            "source_id": row.get("source_bundle_id", "").strip(),
            "source_example_ids": split_ids(row.get("source_example_ids")),
            "primary_need": build_need_meta(row, "primary_need"),
            "secondary_need": build_need_meta(row, "secondary_need"),
            "tertiary_need": build_need_meta(row, "tertiary_need"),
            "review_note": row.get("review_note", "").strip(),
        }
        meta = {key: value for key, value in meta.items() if value not in ("", [], None)}

        question["choices"].append({
            "text": choice_text,
            "scores": scores,
            "meta": meta,
        })

    return list(grouped.values())


def main() -> int:
    desires = load_json(DESIRES_PATH)
    validate_mapping(desires)

    fieldnames, rows = read_rows(CSV_PATH)
    assert_required_columns(fieldnames)
    questions = convert_rows(rows)

    OUTPUT_PATH.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    choice_count = sum(len(question["choices"]) for question in questions)
    print(f"CSV columns: {', '.join(fieldnames)}")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")
    print(f"Questions: {len(questions)}")
    print(f"Choices: {choice_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
