import { useEffect, useState, useRef } from "react";
import { checkBackendHealth } from "../services/healthService";

function BackendStatus() {
  const [healthInfo, setHealthInfo] = useState({
    connected: false,
    status: "Checking...",
    dbConnected: false,
    dbStatus: "Disconnected",
    api: "FastAPI",
    responseTime: null,
    error: null
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const performCheck = async () => {
      const result = await checkBackendHealth();
      if (isMounted) {
        setHealthInfo(result);
      }
    };

    performCheck();
    const intervalId = setInterval(performCheck, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { connected, dbConnected, dbStatus, responseTime } = healthInfo;

  return (
    <div
      className="backend-status-container"
      ref={containerRef}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip((prev) => !prev)}
      aria-label="Backend & Database Connection Status"
      role="button"
      tabIndex={0}
    >
      <div className={`backend-status-pill ${connected ? "connected" : "disconnected"}`}>
        <span className={`status-dot ${connected ? "dot-green" : "dot-red"}`} />
        <span className="status-label">
          {connected ? "Backend Connected" : "Backend Disconnected"}
        </span>
      </div>

      {showTooltip && (
        <div className="backend-status-tooltip">
          <div className="tooltip-title">System Status</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Backend:</span>
            <span className={`tooltip-value ${connected ? "text-green" : "text-red"}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {connected ? (
            <>
              <div className="tooltip-row">
                <span className="tooltip-label">API:</span>
                <span className="tooltip-value">FastAPI</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Database:</span>
                <span className={`tooltip-value ${dbConnected ? "text-green" : "text-red"}`}>
                  {dbConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Response:</span>
                <span className="tooltip-value">
                  {responseTime !== null ? `${responseTime} ms` : "N/A"}
                </span>
              </div>
            </>
          ) : (
            <div className="tooltip-error-msg">
              Unable to connect to backend.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BackendStatus;
