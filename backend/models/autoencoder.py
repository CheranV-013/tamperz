import numpy as np
from tensorflow.keras import Model
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler


class AutoencoderModel:
    def __init__(self, input_dim):
        self.scaler = StandardScaler()
        self.input_dim = input_dim
        self.model = self._build_model()
        self.is_fitted = False

    def _build_model(self):
        inputs = Input(shape=(self.input_dim,))
        x = Dense(16, activation="relu")(inputs)
        x = Dense(8, activation="relu")(x)
        x = Dense(16, activation="relu")(x)
        outputs = Dense(self.input_dim, activation="linear")(x)
        model = Model(inputs, outputs)
        model.compile(optimizer=Adam(learning_rate=0.001), loss="mse")
        return model

    def fit(self, X, epochs=30, batch_size=32):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, X_scaled, epochs=epochs, batch_size=batch_size, verbose=0)
        self.is_fitted = True

    def score(self, X):
        if not self.is_fitted:
            return np.zeros(X.shape[0])
        X_scaled = self.scaler.transform(X)
        recon = self.model.predict(X_scaled, verbose=0)
        mse = np.mean(np.square(X_scaled - recon), axis=1)
        normalized = (mse - mse.min()) / (mse.ptp() + 1e-6)
        return normalized
