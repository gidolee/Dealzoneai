# ML Module: User Behavior Model

## Dataset Source

- Name: UCI Online Shoppers Purchasing Intention Dataset
- Citation page: https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset
- Raw CSV URL: https://archive.ics.uci.edu/ml/machine-learning-databases/00468/online_shoppers_intention.csv
- Local raw file: `ml/data/online_shoppers_intention.csv`

## What Training Script Does

`ml/scripts/train_user_behavior_model.py`:

1. Loads raw ecommerce session behavior data.
2. Engineers app-aligned features (`views`, `add_to_cart`, `searches`, `clicks`, `discount_percent`, `recency_days`).
3. Trains a logistic regression model (NumPy implementation).
4. Exports model + normalization stats + metrics as JSON.

## Run

```bash
python3 ml/scripts/train_user_behavior_model.py
```

or

```bash
npm run ml:train
```

## Output

- `ml/data/user_behavior_features.csv`
- `ml/artifacts/user_behavior_model.json`
- `ml/artifacts/user_behavior_metrics.json`
