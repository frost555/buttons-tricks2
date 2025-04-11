import React, { useState, useCallback } from "react";

// Types
interface BenchmarkResult {
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  coords?: GeolocationCoordinates;
  error?: GeolocationPositionError | Error;
}

interface BenchmarkOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  watchDuration?: number;
}

// Benchmark functions
const benchmarkGetCurrentPosition = async (
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> => {
  const result: BenchmarkResult = {
    method: "getCurrentPosition",
    startTime: performance.now(),
    endTime: 0,
    duration: 0,
  };

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        result.endTime = performance.now();
        result.duration = result.endTime - result.startTime;
        result.coords = position.coords;
        resolve(result);
      },
      (error) => {
        result.endTime = performance.now();
        result.duration = result.endTime - result.startTime;
        result.error = error;
        resolve(result);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    );
  });
};

const benchmarkWatchPosition = async (
  opts: BenchmarkOptions = {}
): Promise<BenchmarkResult> => {
  const result: BenchmarkResult = {
    method: "watchPosition",
    startTime: performance.now(),
    endTime: 0,
    duration: 0,
  };

  return new Promise<BenchmarkResult>((resolve) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        result.endTime = performance.now();
        result.duration = result.endTime - result.startTime;
        result.coords = position.coords;
        navigator.geolocation.clearWatch(watchId);
        resolve(result);
      },
      (error) => {
        result.endTime = performance.now();
        result.duration = result.endTime - result.startTime;
        result.error = error;

        navigator.geolocation.clearWatch(watchId);
        resolve(result);
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    );
  });
};

// Main App Component
const App: React.FC = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>(
    "No benchmark results yet. Click a button to start."
  );

  // Benchmark options state
  const [options, setOptions] = useState<BenchmarkOptions>({
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 0,
  });

  // Options panel visibility state
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value,
    });
  };

  const formatResults = useCallback(
    (benchmarkResults: BenchmarkResult[]): string => {
      let output = "GEOLOCATION BENCHMARK RESULTS\n";
      output += "============================\n\n";

      output += "Benchmark Settings:\n";
      output += `- High Accuracy: ${
        options.enableHighAccuracy ? "Enabled" : "Disabled"
      }\n`;
      output += `- Timeout: ${options.timeout}ms\n`;
      output += `- Maximum Age: ${options.maximumAge}ms\n\n`;

      benchmarkResults.forEach((result) => {
        output += `Method: ${result.method}\n`;
        output += `Duration: ${result.duration.toFixed(2)}ms\n`;

        if (result.coords) {
          output += "Position:\n";
          output += `  - Latitude: ${result.coords.latitude}\n`;
          output += `  - Longitude: ${result.coords.longitude}\n`;
          output += `  - Accuracy: ${result.coords.accuracy} meters\n`;

          if (result.coords.altitude !== null) {
            output += `  - Altitude: ${result.coords.altitude} meters\n`;
            output += `  - Altitude Accuracy: ${result.coords.altitudeAccuracy} meters\n`;
          }

          if (result.coords.heading !== null) {
            output += `  - Heading: ${result.coords.heading} degrees\n`;
          }

          if (result.coords.speed !== null) {
            output += `  - Speed: ${result.coords.speed} m/s\n`;
          }
        }

        if (result.error) {
          output += "Error:\n";
          if ("code" in result.error && "message" in result.error) {
            const geoError = result.error as GeolocationPositionError;
            output += `  - Code: ${geoError.code}\n`;
            output += `  - Message: ${geoError.message}\n`;
          } else {
            output += `  - ${result.error.message || "Unknown error"}\n`;
          }
        }

        output += "\n";
      });

      // Add a comparison section
      if (benchmarkResults.length >= 2) {
        output += "COMPARISON\n";
        output += "==========\n";
        const sorted = [...benchmarkResults].sort(
          (a, b) => a.duration - b.duration
        );
        output += `Fastest method: ${
          sorted[0].method
        } (${sorted[0].duration.toFixed(2)}ms)\n`;
        output += `Slowest method: ${
          sorted[sorted.length - 1].method
        } (${sorted[sorted.length - 1].duration.toFixed(2)}ms)\n`;

        if (sorted.length >= 2) {
          const diff = sorted[sorted.length - 1].duration - sorted[0].duration;
          output += `Difference: ${diff.toFixed(2)}ms\n`;
        }
      }

      return output;
    },
    [options]
  );

  const runGetCurrentPositionBenchmark = async () => {
    if (!navigator.geolocation) {
      setResultText("Geolocation API is not supported in your browser");
      return;
    }

    setLoading("getCurrentPosition");
    setResultText("Running getCurrentPosition benchmark...");

    try {
      // Run getCurrentPosition benchmark
      const getCurrentPositionResult = await benchmarkGetCurrentPosition(
        options
      );

      const updatedResults = [
        ...results.filter((r) => r.method !== "getCurrentPosition"),
        getCurrentPositionResult,
      ];
      setResults(updatedResults);
      setResultText(formatResults(updatedResults));
    } catch (error) {
      setResultText(
        `Error running getCurrentPosition benchmark: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  const runWatchPositionBenchmark = async () => {
    if (!navigator.geolocation) {
      setResultText("Geolocation API is not supported in your browser");
      return;
    }

    setLoading("watchPosition");
    setResultText("Running watchPosition benchmark...");

    try {
      // Run watchPosition benchmark
      const watchPositionResult = await benchmarkWatchPosition(options);

      const updatedResults = [
        ...results.filter((r) => r.method !== "watchPosition"),
        watchPositionResult,
      ];
      setResults(updatedResults);
      setResultText(formatResults(updatedResults));
    } catch (error) {
      setResultText(
        `Error running watchPosition benchmark: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  const runAllBenchmarks = async () => {
    if (!navigator.geolocation) {
      setResultText("Geolocation API is not supported in your browser");
      return;
    }

    setLoading("all");
    setResultText("Running all benchmarks...");

    try {
      // Run getCurrentPosition benchmark
      const getCurrentPositionResult = await benchmarkGetCurrentPosition(
        options
      );

      // Run watchPosition benchmark
      const watchPositionResult = await benchmarkWatchPosition(options);

      const benchmarkResults = [getCurrentPositionResult, watchPositionResult];
      setResults(benchmarkResults);
      setResultText(formatResults(benchmarkResults));
    } catch (error) {
      setResultText(
        `Error running benchmarks: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const buttonStyle = (isLoading: boolean) => ({
    padding: "10px 20px",
    fontSize: "16px",
    cursor: isLoading ? "not-allowed" : "pointer",
    backgroundColor: isLoading ? "#cccccc" : "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    margin: "0 10px 10px 0",
  });

  const toggleOptionsStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: showOptions ? "#f44336" : "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "0 10px 10px 0",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1>Geolocation Method Benchmark</h1>
      <p>Click the buttons below to benchmark different geolocation methods.</p>

      <button
        onClick={() => setShowOptions(!showOptions)}
        style={toggleOptionsStyle}
      >
        {showOptions ? "Hide Options" : "Show Options"}
      </button>

      {showOptions && (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Benchmark Options</h3>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                name="enableHighAccuracy"
                checked={options.enableHighAccuracy}
                onChange={handleOptionChange}
                style={{ marginRight: "8px" }}
              />
              Enable High Accuracy
            </label>
            <div style={{ fontSize: "0.8em", color: "#666", marginTop: "3px" }}>
              When enabled, provides a more accurate position, but might be
              slower and use more battery
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Timeout (ms):
            </label>
            <input
              type="number"
              name="timeout"
              value={options.timeout}
              onChange={handleOptionChange}
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              min="0"
            />
            <div style={{ fontSize: "0.8em", color: "#666", marginTop: "3px" }}>
              Maximum time (in milliseconds) to wait for a position. 0 means no
              timeout.
            </div>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Maximum Age (ms):
            </label>
            <input
              type="number"
              name="maximumAge"
              value={options.maximumAge}
              onChange={handleOptionChange}
              style={{
                width: "100%",
                padding: "8px",
                boxSizing: "border-box",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              min="0"
            />
            <div style={{ fontSize: "0.8em", color: "#666", marginTop: "3px" }}>
              Maximum age (in milliseconds) of a cached position. 0 means no
              cache will be used.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={runGetCurrentPositionBenchmark}
          disabled={loading !== null}
          style={buttonStyle(loading === "getCurrentPosition")}
        >
          {loading === "getCurrentPosition"
            ? "Running getCurrentPosition..."
            : "Benchmark getCurrentPosition"}
        </button>

        <button
          onClick={runWatchPositionBenchmark}
          disabled={loading !== null}
          style={buttonStyle(loading === "watchPosition")}
        >
          {loading === "watchPosition"
            ? "Running watchPosition..."
            : "Benchmark watchPosition"}
        </button>

        <button
          onClick={runAllBenchmarks}
          disabled={loading !== null}
          style={buttonStyle(loading === "all")}
        >
          {loading === "all"
            ? "Running All Benchmarks..."
            : "Run All Benchmarks"}
        </button>

        <button
          onClick={refreshPage}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            margin: "0 10px 10px 0",
          }}
        >
          Refresh Page
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Results</h2>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "5px",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {resultText}
        </pre>
      </div>
    </div>
  );
};

export default App;
