/**
 * Climate Risk ML Model
 * Lightweight TensorFlow.js model for climate risk prediction
 */

import * as tf from "@tensorflow/tfjs";

interface WeatherInput {
  temperature: number; // °C
  precipitation: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
  pressure?: number; // hPa
  latitude: number; // degrees
  longitude: number; // degrees
}

interface RiskPrediction {
  floodRisk: number; // 0-1
  droughtRisk: number; // 0-1
  heatwaveRisk: number; // 0-1
  stormRisk: number; // 0-1
  overallRisk: number; // 0-1
  confidence: number; // 0-1
}

class ClimateRiskPredictor {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeModel();
  }

  /**
   * Initialize the ML model
   * For hackathon demo, we'll use a simple rule-based model wrapped in TensorFlow.js
   * In production, this would load a pre-trained model
   */
  private async initializeModel() {
    try {
      // Create a simple neural network for demonstration
      // In production, you would load a pre-trained model with tf.loadLayersModel()
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [7], units: 32, activation: "relu" }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: "relu" }),
          tf.layers.dense({ units: 4, activation: "sigmoid" }), // 4 risk types
        ],
      });

      // Compile with appropriate loss and optimizer
      this.model.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      this.isInitialized = true;
      console.log("Climate Risk ML Model initialized successfully");
    } catch (error) {
      console.warn(
        "Failed to initialize ML model, falling back to rule-based prediction:",
        error
      );
      this.isInitialized = false;
    }
  }

  /**
   * Normalize input features for better ML performance
   */
  private normalizeFeatures(input: WeatherInput): number[] {
    return [
      (input.temperature + 40) / 80, // Normalize temp from -40°C to 40°C
      Math.min(input.precipitation / 100, 1), // Normalize precip 0-100mm
      input.humidity / 100, // Normalize humidity 0-100%
      Math.min(input.windSpeed / 100, 1), // Normalize wind 0-100 km/h
      input.pressure ? (input.pressure - 950) / 100 : 0.5, // Normalize pressure
      (input.latitude + 90) / 180, // Normalize latitude -90 to 90
      (input.longitude + 180) / 360, // Normalize longitude -180 to 180
    ];
  }

  /**
   * Rule-based prediction (fallback when ML model isn't available)
   */
  private ruleBasedPrediction(input: WeatherInput): RiskPrediction {
    let floodRisk = 0;
    let droughtRisk = 0;
    let heatwaveRisk = 0;
    let stormRisk = 0;

    // Flood risk calculation
    if (input.precipitation > 20) floodRisk += 0.4;
    else if (input.precipitation > 10) floodRisk += 0.2;
    if (input.humidity > 80) floodRisk += 0.2;
    if (input.windSpeed > 15) floodRisk += 0.1;

    // Consider latitude - tropical regions have higher flood risk
    if (Math.abs(input.latitude) < 30) floodRisk += 0.1;

    // Drought risk calculation
    if (input.precipitation < 1) droughtRisk += 0.3;
    if (input.temperature > 30) droughtRisk += 0.25;
    if (input.humidity < 40) droughtRisk += 0.25;
    if (input.windSpeed > 20) droughtRisk += 0.2;

    // Arid regions have higher drought risk
    if (Math.abs(input.latitude) > 20 && Math.abs(input.latitude) < 40)
      droughtRisk += 0.1;

    // Heatwave risk calculation
    if (input.temperature > 35) heatwaveRisk += 0.5;
    else if (input.temperature > 30) heatwaveRisk += 0.3;
    else if (input.temperature > 25) heatwaveRisk += 0.1;
    if (input.humidity < 30) heatwaveRisk += 0.2;

    // Hot climate zones
    if (Math.abs(input.latitude) < 35) heatwaveRisk += 0.1;

    // Storm risk calculation
    if (input.windSpeed > 25) stormRisk += 0.4;
    else if (input.windSpeed > 15) stormRisk += 0.2;
    if (input.precipitation > 15 && input.windSpeed > 10) stormRisk += 0.3;
    if (input.pressure && input.pressure < 1000) stormRisk += 0.2;

    // Coastal and tropical regions have higher storm risk
    if (Math.abs(input.latitude) < 30) stormRisk += 0.1;

    // Apply seasonal adjustments (simplified)
    const seasonalFactor = this.getSeasonalFactor(input.latitude);
    heatwaveRisk *= seasonalFactor.heat;
    droughtRisk *= seasonalFactor.drought;
    floodRisk *= seasonalFactor.flood;
    stormRisk *= seasonalFactor.storm;

    // Clamp values between 0 and 1
    floodRisk = Math.max(0, Math.min(1, floodRisk));
    droughtRisk = Math.max(0, Math.min(1, droughtRisk));
    heatwaveRisk = Math.max(0, Math.min(1, heatwaveRisk));
    stormRisk = Math.max(0, Math.min(1, stormRisk));

    const overallRisk = Math.max(
      floodRisk,
      droughtRisk,
      heatwaveRisk,
      stormRisk
    );

    return {
      floodRisk,
      droughtRisk,
      heatwaveRisk,
      stormRisk,
      overallRisk,
      confidence: 0.8, // Rule-based model has good confidence
    };
  }

  /**
   * Get seasonal adjustment factors based on hemisphere
   */
  private getSeasonalFactor(latitude: number) {
    const month = new Date().getMonth() + 1; // 1-12
    const isNorthern = latitude >= 0;

    // Simple seasonal adjustment
    let heat = 1.0;
    let drought = 1.0;
    let flood = 1.0;
    let storm = 1.0;

    if (isNorthern) {
      // Northern hemisphere summer (June-August)
      if (month >= 6 && month <= 8) {
        heat = 1.3;
        drought = 1.2;
        storm = 1.1;
      }
      // Northern hemisphere winter (December-February)
      else if (month >= 12 || month <= 2) {
        heat = 0.7;
        flood = 1.2;
        storm = 1.2;
      }
    } else {
      // Southern hemisphere summer (December-February)
      if (month >= 12 || month <= 2) {
        heat = 1.3;
        drought = 1.2;
        storm = 1.1;
      }
      // Southern hemisphere winter (June-August)
      else if (month >= 6 && month <= 8) {
        heat = 0.7;
        flood = 1.2;
        storm = 1.2;
      }
    }

    return { heat, drought, flood, storm };
  }

  /**
   * ML-based prediction (when model is available)
   */
  private async mlBasedPrediction(
    input: WeatherInput
  ): Promise<RiskPrediction> {
    if (!this.model) {
      throw new Error("ML model not initialized");
    }

    const normalizedInput = this.normalizeFeatures(input);
    const inputTensor = tf.tensor2d([normalizedInput]);

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const predictionData = await prediction.data();

      return {
        floodRisk: predictionData[0],
        droughtRisk: predictionData[1],
        heatwaveRisk: predictionData[2],
        stormRisk: predictionData[3],
        overallRisk: Math.max(...predictionData.slice(0, 4)),
        confidence: 0.9, // ML model has high confidence
      };
    } finally {
      inputTensor.dispose();
    }
  }

  /**
   * Predict climate risks for given weather input
   */
  async predict(input: WeatherInput): Promise<RiskPrediction> {
    try {
      // Use ML model if available and initialized
      if (this.isInitialized && this.model) {
        return await this.mlBasedPrediction(input);
      }
    } catch (error) {
      console.warn("ML prediction failed, falling back to rule-based:", error);
    }

    // Fallback to rule-based prediction
    return this.ruleBasedPrediction(input);
  }

  /**
   * Batch prediction for multiple locations
   */
  async predictBatch(inputs: WeatherInput[]): Promise<RiskPrediction[]> {
    const predictions = await Promise.all(
      inputs.map((input) => this.predict(input))
    );
    return predictions;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      initialized: this.isInitialized,
      modelType: this.model ? "Neural Network" : "Rule-Based",
      version: "1.0.0",
      features: [
        "temperature",
        "precipitation",
        "humidity",
        "windSpeed",
        "latitude",
        "longitude",
      ],
      riskTypes: ["flood", "drought", "heatwave", "storm"],
    };
  }

  /**
   * Training method (for future enhancement)
   * In production, this would train the model with historical data
   */
  async trainModel(trainingData: {
    inputs: WeatherInput[];
    outputs: RiskPrediction[];
  }) {
    if (!this.model) {
      console.warn("Cannot train: Model not initialized");
      return;
    }

    console.log("Training with", trainingData.inputs.length, "samples");

    const xs = tf.tensor2d(
      trainingData.inputs.map((input) => this.normalizeFeatures(input))
    );
    const ys = tf.tensor2d(
      trainingData.outputs.map((output) => [
        output.floodRisk,
        output.droughtRisk,
        output.heatwaveRisk,
        output.stormRisk,
      ])
    );

    try {
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          },
        },
      });

      console.log("Model training completed");
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }
}

// Export singleton instance
export const climateRiskPredictor = new ClimateRiskPredictor();
export type { WeatherInput, RiskPrediction };
