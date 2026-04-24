#!/usr/bin/env python3
"""Train a purchase propensity model from ecommerce user behavior data.

Source dataset:
UCI Machine Learning Repository - Online Shoppers Purchasing Intention Dataset
https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np


DEFAULT_DATASET = Path("ml/data/online_shoppers_intention.csv")
DEFAULT_FEATURE_OUTPUT = Path("ml/data/user_behavior_features.csv")
DEFAULT_MODEL_OUTPUT = Path("ml/artifacts/user_behavior_model.json")
DEFAULT_METRICS_OUTPUT = Path("ml/artifacts/user_behavior_metrics.json")

FEATURE_ORDER = [
    "views",
    "add_to_cart",
    "searches",
    "clicks",
    "discount_percent",
    "recency_days",
]

MONTH_TO_NUM = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "Apr": 4,
    "May": 5,
    "June": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12,
}


def parse_bool(value: str) -> int:
    return 1 if value.strip().upper() == "TRUE" else 0


def safe_float(value: str) -> float:
    if value is None:
        return 0.0
    value = value.strip()
    if not value:
        return 0.0
    return float(value)


def engineer_features(row: Dict[str, str]) -> List[float]:
    product_related = safe_float(row["ProductRelated"])
    informational = safe_float(row["Informational"])
    administrative = safe_float(row["Administrative"])
    page_values = safe_float(row["PageValues"])
    special_day = safe_float(row["SpecialDay"])
    month_num = MONTH_TO_NUM.get(row["Month"], 6)
    weekend = parse_bool(row["Weekend"])

    # Feature engineering to align with app-level recommendation inputs.
    views = product_related
    add_to_cart = max(0.0, page_values / 20.0)
    searches = informational
    clicks = administrative + informational + product_related
    discount_percent = 5.0 + special_day * 45.0
    recency_days = float(max(1, (12 - month_num) * 2 + weekend))

    return [views, add_to_cart, searches, clicks, discount_percent, recency_days]


def load_dataset(dataset_path: Path) -> Tuple[np.ndarray, np.ndarray]:
    features: List[List[float]] = []
    labels: List[int] = []

    with dataset_path.open("r", newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            features.append(engineer_features(row))
            labels.append(parse_bool(row["Revenue"]))

    return np.array(features, dtype=np.float64), np.array(labels, dtype=np.float64)


def standardize(train_x: np.ndarray, test_x: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    mean = train_x.mean(axis=0)
    std = train_x.std(axis=0)
    std[std == 0] = 1.0

    train_scaled = (train_x - mean) / std
    test_scaled = (test_x - mean) / std
    return train_scaled, test_scaled, mean, std


def sigmoid(values: np.ndarray) -> np.ndarray:
    clipped = np.clip(values, -500, 500)
    return 1.0 / (1.0 + np.exp(-clipped))


def train_logistic_regression(
    train_x: np.ndarray,
    train_y: np.ndarray,
    learning_rate: float,
    epochs: int,
    l2_lambda: float,
) -> Tuple[np.ndarray, float]:
    samples, feature_count = train_x.shape
    weights = np.zeros(feature_count, dtype=np.float64)
    bias = 0.0

    for _ in range(epochs):
        linear = train_x @ weights + bias
        predictions = sigmoid(linear)

        error = predictions - train_y
        grad_w = (train_x.T @ error) / samples + (l2_lambda / samples) * weights
        grad_b = np.mean(error)

        weights -= learning_rate * grad_w
        bias -= learning_rate * grad_b

    return weights, bias


def compute_auc(labels: np.ndarray, probabilities: np.ndarray) -> float:
    positives = labels == 1
    negatives = labels == 0

    pos_count = int(np.sum(positives))
    neg_count = int(np.sum(negatives))

    if pos_count == 0 or neg_count == 0:
        return 0.5

    order = np.argsort(probabilities)
    ranks = np.empty_like(order)
    ranks[order] = np.arange(1, len(probabilities) + 1)

    pos_rank_sum = float(np.sum(ranks[positives]))
    auc = (pos_rank_sum - (pos_count * (pos_count + 1) / 2.0)) / (pos_count * neg_count)
    return float(auc)


def evaluate(test_x: np.ndarray, test_y: np.ndarray, weights: np.ndarray, bias: float) -> Dict[str, float]:
    probabilities = sigmoid(test_x @ weights + bias)
    predictions = (probabilities >= 0.5).astype(np.float64)

    tp = np.sum((predictions == 1) & (test_y == 1))
    tn = np.sum((predictions == 0) & (test_y == 0))
    fp = np.sum((predictions == 1) & (test_y == 0))
    fn = np.sum((predictions == 0) & (test_y == 1))

    accuracy = float((tp + tn) / len(test_y))
    precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = float((2 * precision * recall) / (precision + recall)) if (precision + recall) > 0 else 0.0
    auc = compute_auc(test_y, probabilities)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "auc": auc,
    }


def write_feature_dataset(path: Path, feature_matrix: np.ndarray, labels: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow([*FEATURE_ORDER, "redeemed"])
        for idx, row in enumerate(feature_matrix):
            writer.writerow([*row.tolist(), int(labels[idx])])


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Train user behavior model")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATASET, help="Path to raw dataset CSV")
    parser.add_argument("--model-out", type=Path, default=DEFAULT_MODEL_OUTPUT, help="Model output JSON path")
    parser.add_argument("--metrics-out", type=Path, default=DEFAULT_METRICS_OUTPUT, help="Metrics output JSON path")
    parser.add_argument(
        "--features-out",
        type=Path,
        default=DEFAULT_FEATURE_OUTPUT,
        help="Engineered feature dataset CSV path",
    )
    parser.add_argument("--test-ratio", type=float, default=0.2, help="Holdout ratio")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--epochs", type=int, default=3000, help="Training epochs")
    parser.add_argument("--learning-rate", type=float, default=0.05, help="Gradient descent learning rate")
    parser.add_argument("--l2", type=float, default=0.001, help="L2 regularization")
    return parser


def main() -> None:
    args = build_parser().parse_args()

    if not args.data.exists():
        raise FileNotFoundError(f"Dataset not found: {args.data}")

    feature_matrix, labels = load_dataset(args.data)
    write_feature_dataset(args.features_out, feature_matrix, labels)

    rng = np.random.default_rng(args.seed)
    indices = rng.permutation(len(feature_matrix))

    split_index = int(len(indices) * (1 - args.test_ratio))
    train_idx = indices[:split_index]
    test_idx = indices[split_index:]

    train_x_raw = feature_matrix[train_idx]
    train_y = labels[train_idx]
    test_x_raw = feature_matrix[test_idx]
    test_y = labels[test_idx]

    train_x, test_x, mean, std = standardize(train_x_raw, test_x_raw)
    weights, bias = train_logistic_regression(
        train_x,
        train_y,
        learning_rate=args.learning_rate,
        epochs=args.epochs,
        l2_lambda=args.l2,
    )

    metrics = evaluate(test_x, test_y, weights, bias)

    artifact = {
        "source": {
            "name": "UCI Online Shoppers Purchasing Intention Dataset",
            "url": "https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset",
            "raw_data": str(args.data),
        },
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "feature_order": FEATURE_ORDER,
        "normalization": {
            "mean": mean.tolist(),
            "std": std.tolist(),
        },
        "model": {
            "weights": weights.tolist(),
            "bias": float(bias),
        },
        "metrics": metrics,
        "train_rows": int(len(train_idx)),
        "test_rows": int(len(test_idx)),
    }

    args.model_out.parent.mkdir(parents=True, exist_ok=True)
    args.metrics_out.parent.mkdir(parents=True, exist_ok=True)

    args.model_out.write_text(json.dumps(artifact, indent=2), encoding="utf-8")
    args.metrics_out.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print("Training complete")
    print(f"Model artifact: {args.model_out}")
    print(f"Metrics artifact: {args.metrics_out}")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
