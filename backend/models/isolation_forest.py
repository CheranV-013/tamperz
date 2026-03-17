import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


class IsolationForestModel:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = IsolationForest(
            n_estimators=150,
            contamination=0.03,
            random_state=42,
        )
        self.is_fitted = False

    def fit(self, X):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_fitted = True

    def score(self, X):
        if not self.is_fitted:
            return np.zeros(X.shape[0])
        X_scaled = self.scaler.transform(X)
        # Higher scores should mean more anomalous
        raw_scores = -self.model.decision_function(X_scaled)
        normalized = (raw_scores - raw_scores.min()) / (raw_scores.ptp() + 1e-6)
        return normalized
