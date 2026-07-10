"""Validate GitHub Pages paths and dataset counts for Motivector."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXPECTED_DATASETS = {
    None: ("production", ROOT / "data" / "questions.json", 30, 120),
    "": ("production", ROOT / "data" / "questions.json", 30, 120),
    "production": ("production", ROOT / "data" / "questions.json", 30, 120),
    "sample": ("sample", ROOT / "data" / "questions_sample.json", 5, 20),
    "draft": ("draft", ROOT / "data" / "questions_draft_v1.json", 30, 120),
    "unknown": ("production", ROOT / "data" / "questions.json", 30, 120),
}

TEXT_FILE_SUFFIXES = {".html", ".css", ".js", ".md"}
ROOT_FIXED_PATH_PATTERNS = [
    re.compile(r"""(?:src|href)=["']/"""),
    re.compile(r"""fetch\(["']/"""),
    re.compile(r"""url\(["']?/"""),
    re.compile(r"""/data/"""),
]
VALID_DATASETS = {"production", "sample", "draft"}


def load_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def count_choices(questions: object) -> int:
    if not isinstance(questions, list):
        raise ValueError("questions JSON must be an array")
    return sum(len(question.get("choices", [])) for question in questions if isinstance(question, dict))


def resolve_dataset(value: str | None) -> tuple[str, Path, bool]:
    dataset = value or "production"
    if dataset not in VALID_DATASETS:
        return "production", ROOT / "data" / "questions.json", True
    return dataset, EXPECTED_DATASETS[dataset][1], False


def validate_dataset_counts() -> list[str]:
    errors: list[str] = []
    for requested, (expected_dataset, expected_path, expected_questions, expected_choices) in EXPECTED_DATASETS.items():
        actual_dataset, actual_path, warned = resolve_dataset(requested)
        questions = load_json(actual_path)
        question_count = len(questions) if isinstance(questions, list) else 0
        choice_count = count_choices(questions)
        expected_warning = requested == "unknown"

        print(
            f"dataset={requested if requested is not None else '<missing>'}: "
            f"{actual_dataset}, questions={question_count}, choices={choice_count}, warning={warned}"
        )

        if actual_dataset != expected_dataset:
            errors.append(f"dataset {requested!r} resolved to {actual_dataset}, expected {expected_dataset}")
        if actual_path != expected_path:
            errors.append(f"dataset {requested!r} resolved to {actual_path}, expected {expected_path}")
        if question_count != expected_questions:
            errors.append(f"dataset {requested!r} has {question_count} questions, expected {expected_questions}")
        if choice_count != expected_choices:
            errors.append(f"dataset {requested!r} has {choice_count} choices, expected {expected_choices}")
        if warned != expected_warning:
            errors.append(f"dataset {requested!r} warning={warned}, expected {expected_warning}")
    return errors


def validate_relative_paths() -> list[str]:
    errors: list[str] = []
    for path in ROOT.rglob("*"):
        if ".git" in path.parts or not path.is_file() or path.suffix not in TEXT_FILE_SUFFIXES:
            continue
        text = path.read_text(encoding="utf-8")
        for pattern in ROOT_FIXED_PATH_PATTERNS:
            if pattern.search(text):
                errors.append(f"{path.relative_to(ROOT)} contains root-fixed path matching {pattern.pattern}")
    return errors


def main() -> int:
    errors = validate_dataset_counts()
    errors.extend(validate_relative_paths())

    if errors:
        print("Errors:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("GitHub Pages dataset and relative path checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
