"""Promote validated draft questions to the production question file."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from validate_questions_json import validate

ROOT = Path(__file__).resolve().parents[1]
DESIRES_PATH = ROOT / "data" / "desires.json"
SOURCE_PATH = ROOT / "data" / "questions_draft_v1.json"
TARGET_PATH = ROOT / "data" / "questions.json"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    desires = load_json(DESIRES_PATH)
    questions = load_json(SOURCE_PATH)
    report = validate(desires, questions)

    question_count = report["question_count"]
    choice_count = report["choice_count"]
    print(f"Questions: {question_count}")
    print(f"Choices: {choice_count}")
    print(f"Errors: {len(report['errors'])}")
    print(f"Warnings: {len(report['warnings'])}")

    if report["errors"]:
        for error in report["errors"]:
            print(f"  [{error['code']}] {error['path']}: {error['message']}")
        print("Promotion aborted because validation errors were found.")
        return 1

    source_bytes = SOURCE_PATH.read_bytes()
    TARGET_PATH.write_bytes(source_bytes)
    if TARGET_PATH.read_bytes() != source_bytes:
        print("Promotion failed because output does not match the source.")
        return 1

    promoted_questions = load_json(TARGET_PATH)
    if promoted_questions != questions:
        print("Promotion failed because parsed output does not match the source.")
        return 1

    print(f"Promoted {SOURCE_PATH.relative_to(ROOT)} to {TARGET_PATH.relative_to(ROOT)}")
    print("Output matches source: yes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
