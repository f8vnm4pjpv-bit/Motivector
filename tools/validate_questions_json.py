"""Validate Motivector question JSON data before production adoption."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DESIRES_PATH = ROOT / "data" / "desires.json"
QUESTIONS_PATH = ROOT / "data" / "questions_draft_v1.json"

LOW_TOTAL = 0.8
HIGH_TOTAL = 1.2
LOW_MAX_RATIO = 0.4
HIGH_MAX_RATIO = 1.6


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def add_issue(issues: list[dict[str, str]], code: str, path: str, message: str) -> None:
    issues.append({"code": code, "path": path, "message": message})


def calculate_max_possible_scores(desires: list[dict[str, Any]], questions: list[dict[str, Any]]) -> dict[str, float]:
    max_scores = {desire["id"]: 0.0 for desire in desires}
    for question in questions:
        choices = question.get("choices") if isinstance(question, dict) else []
        if not isinstance(choices, list):
            continue
        for desire in desires:
            desire_id = desire["id"]
            question_max = 0.0
            for choice in choices:
                scores = choice.get("scores", {}) if isinstance(choice, dict) else {}
                if isinstance(scores, dict):
                    question_max = max(question_max, float(scores.get(desire_id) or 0))
            max_scores[desire_id] += question_max
    return max_scores


def validate(desires: list[dict[str, Any]], questions: list[dict[str, Any]]) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    if not isinstance(desires, list):
        add_issue(errors, "desires_not_array", "desires", "desires.json must be an array")
        desires = []
    if not isinstance(questions, list):
        add_issue(errors, "questions_not_array", "questions", "questions JSON must be an array")
        questions = []

    desire_ids = {desire.get("id") for desire in desires if isinstance(desire, dict)}
    question_count = len(questions)
    choice_count = 0

    for question_index, question in enumerate(questions):
        question_path = f"questions[{question_index}]"
        if not isinstance(question, dict):
            add_issue(errors, "question_not_object", question_path, "question must be an object")
            continue
        if not question.get("id") or not question.get("text") or not isinstance(question.get("choices"), list):
            add_issue(errors, "question_required_field", question_path, "question requires id, text, choices")
            continue

        for choice_index, choice in enumerate(question["choices"]):
            choice_count += 1
            choice_path = f"{question_path}.choices[{choice_index}]"
            if not isinstance(choice, dict):
                add_issue(errors, "choice_not_object", choice_path, "choice must be an object")
                continue
            if not choice.get("text") or not isinstance(choice.get("scores"), dict):
                add_issue(errors, "choice_required_field", choice_path, "choice requires text and scores")
                continue

            scores = choice["scores"]
            score_ids = list(scores.keys())
            total = 0.0
            for desire_id, score_value in scores.items():
                if desire_id not in desire_ids:
                    add_issue(errors, "unknown_score_id", f"{choice_path}.scores.{desire_id}", "score id is not defined in desires.json")
                try:
                    score = float(score_value)
                except (TypeError, ValueError):
                    add_issue(errors, "invalid_score_value", f"{choice_path}.scores.{desire_id}", "score must be numeric")
                    continue
                if score < 0:
                    add_issue(errors, "negative_score_value", f"{choice_path}.scores.{desire_id}", "score must be zero or greater")
                total += score

            if len(score_ids) < 2 or len(score_ids) > 3:
                add_issue(warnings, "score_target_count", f"{choice_path}.scores", "score target count should be about 2 to 3")
            if total < LOW_TOTAL or total > HIGH_TOTAL:
                add_issue(warnings, "score_total_range", f"{choice_path}.scores", f"score total is {total:.3f}")

    max_scores = calculate_max_possible_scores(desires, questions)
    positive_max_scores = [value for value in max_scores.values() if value > 0]
    average_max_score = sum(positive_max_scores) / len(positive_max_scores) if positive_max_scores else 0.0

    for desire_id, value in max_scores.items():
        if value == 0:
            add_issue(warnings, "max_score_zero", f"max_possible_score.{desire_id}", "max_possible_score is zero")
        elif average_max_score and (value < average_max_score * LOW_MAX_RATIO or value > average_max_score * HIGH_MAX_RATIO):
            add_issue(warnings, "max_score_imbalance", f"max_possible_score.{desire_id}", f"max_possible_score is {value:.3f}; average is {average_max_score:.3f}")

    return {
        "question_count": question_count,
        "choice_count": choice_count,
        "max_possible_score": max_scores,
        "average_max_possible_score": average_max_score,
        "errors": errors,
        "warnings": warnings,
    }


def main() -> int:
    desires = load_json(DESIRES_PATH)
    questions = load_json(QUESTIONS_PATH)
    report = validate(desires, questions)

    print(f"Questions: {report['question_count']}")
    print(f"Choices: {report['choice_count']}")
    print("max_possible_score:")
    for desire_id, score in report["max_possible_score"].items():
        print(f"  {desire_id}: {score:.3f}")
    print(f"Average max_possible_score: {report['average_max_possible_score']:.3f}")
    print(f"Errors: {len(report['errors'])}")
    print(f"Warnings: {len(report['warnings'])}")

    if report["warnings"]:
        print("Warnings detail:")
        for warning in report["warnings"]:
            print(f"  [{warning['code']}] {warning['path']}: {warning['message']}")
    if report["errors"]:
        print("Errors detail:")
        for error in report["errors"]:
            print(f"  [{error['code']}] {error['path']}: {error['message']}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
