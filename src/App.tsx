import React, { useState, useEffect } from "react";

interface Position {
  coords: GeolocationCoordinates;
  timestamp: number;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [getCurrentTime, setGetCurrentTime] = useState<number | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [highAccuracy, setHighAccuracy] = useState<boolean>(() => {
    // Load from localStorage on initialization
    const saved = localStorage.getItem("geoHighAccuracy");
    return saved ? JSON.parse(saved) : true; // Default to true if not saved
  });

  // Save high accuracy setting to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("geoHighAccuracy", JSON.stringify(highAccuracy));
  }, [highAccuracy]);

  // Clean up the watch when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startGeolocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);
    setPosition(null);
    setGetCurrentTime(null);

    try {
      // First get the current position
      const startTime = performance.now();

      const getCurrentPromise = new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            maximumAge: 5 * 60000, // 5 minutes
            timeout: 60000, // 60 seconds
            enableHighAccuracy: false, // initially false for faster response
          });
        }
      );

      const currentPosition = await getCurrentPromise;
      const endTime = performance.now();

      setGetCurrentTime(endTime - startTime);
      setPosition({
        coords: currentPosition.coords,
        timestamp: currentPosition.timestamp,
      });

      // Then start watching for position updates
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            coords: pos.coords,
            timestamp: pos.timestamp,
          });
        },
        (err) => {
          setError(`Watch position error: ${err.message}`);
        },
        {
          timeout: 60000, // 60 seconds
          maximumAge: 5 * 60000, // 5 minutes
          enableHighAccuracy: highAccuracy, // use the saved setting
        }
      );

      setWatchId(id);
    } catch (err) {
      if (err instanceof Error) {
        setError(`getCurrentPosition error: ${err.message}`);
      } else if (err instanceof GeolocationPositionError) {
        setError(
          `getCurrentPosition error: ${err.message} (code: ${err.code})`
        );
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const startWatchOnly = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);
    setGetCurrentTime(null);
    setPosition(null);

    const startTime = performance.now();

    let isSet = false;
    // Only start watching for position updates without getting initial position
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        // For the first position update, record the time it took
        if (!isSet) {
          isSet = true;
          const endTime = performance.now();
          setGetCurrentTime(endTime - startTime);
        }

        setPosition({
          coords: pos.coords,
          timestamp: pos.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Watch position error: ${err.message}`);
        setLoading(false);
      },
      {
        timeout: 60000, // 60 seconds
        maximumAge: 5 * 60000, // 5 minutes
        enableHighAccuracy: highAccuracy, // use the saved setting
      }
    );

    setWatchId(id);
  };

  const refreshPage = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    window.location.reload();
  };

  const toggleHighAccuracy = () => {
    setHighAccuracy(!highAccuracy);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
      <h1>Geolocation Tracker</h1>
      <p>Get your current position and track location changes</p>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={highAccuracy}
            onChange={toggleHighAccuracy}
          />
          <span>
            Enable High Accuracy Mode{" "}
            <span style={{ color: "#666", fontSize: "14px" }}>
              (more precise, but may use more battery)
            </span>
          </span>
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={startGeolocation}
          disabled={loading || watchId !== null}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor:
              loading || watchId !== null ? "#cccccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || watchId !== null ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Getting Location..." : "Get & Track Location"}
        </button>

        <button
          onClick={startWatchOnly}
          disabled={loading || watchId !== null}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor:
              loading || watchId !== null ? "#cccccc" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || watchId !== null ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Starting Watch..." : "Track Only (Skip Initial)"}
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
          }}
        >
          Refresh Page
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h2>Location Data</h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#c62828",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {getCurrentTime !== null && (
          <div
            style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            <strong>Time to get initial position:</strong>{" "}
            {getCurrentTime.toFixed(2)} ms
          </div>
        )}

        {position && (
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Current Position</h3>
            <p>
              <strong>Timestamp:</strong> {formatDate(position.timestamp)}
            </p>
            <p>
              <strong>Tracking Mode:</strong>{" "}
              {highAccuracy ? "High Accuracy" : "Standard Accuracy"}
            </p>
            <p>
              <strong>Coordinates:</strong>
            </p>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li>
                <strong>Latitude:</strong> {position.coords.latitude}
              </li>
              <li>
                <strong>Longitude:</strong> {position.coords.longitude}
              </li>
              <li>
                <strong>Accuracy:</strong> {position.coords.accuracy} meters
              </li>

              {position.coords.altitude !== null && (
                <li>
                  <strong>Altitude:</strong> {position.coords.altitude} meters
                </li>
              )}

              {position.coords.altitudeAccuracy !== null && (
                <li>
                  <strong>Altitude Accuracy:</strong>{" "}
                  {position.coords.altitudeAccuracy} meters
                </li>
              )}

              {position.coords.heading !== null && (
                <li>
                  <strong>Heading:</strong> {position.coords.heading}°
                </li>
              )}

              {position.coords.speed !== null && (
                <li>
                  <strong>Speed:</strong> {position.coords.speed} m/s
                </li>
              )}
            </ul>

            {watchId !== null && (
              <p style={{ color: "#4CAF50" }}>
                <strong>Status:</strong> Actively tracking location changes...
              </p>
            )}
          </div>
        )}

        {!position && !error && !loading && (
          <p>Click one of the tracking buttons to get your location.</p>
        )}

        {loading && !position && !error && <p>Waiting for location data...</p>}
      </div>
    </div>
  );
};

export default App;
