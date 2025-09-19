import React, { useState, useEffect } from 'react';
import { isOnline, onNetworkChange, getCacheInfo } from '../util/offlineCache';
import { useQuizData } from '../../hooks/useQuizData';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get refresh function from useQuizData hook
  const { refreshData } = useQuizData();

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshData();
      // Update cache info after refresh
      getCacheInfo().then(setCacheInfo);
    } catch (error) {
      // Manual refresh failed
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initialize offline state
    setIsOffline(!isOnline());
    
    // Get initial cache info
    getCacheInfo().then(setCacheInfo);

    // Listen for network changes
    const cleanup = onNetworkChange((online) => {
      setIsOffline(!online);
    });

    return cleanup;
  }, []);

  // Update cache info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      getCacheInfo().then(setCacheInfo);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Show a small refresh button when online, or full details when offline
  if (!isOffline && !showDetails) {
    return (
      <div className="offline-indicator">
        <div className="online-refresh-bar">
          <button 
            className="online-refresh-button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh data to get latest questions"
          >
            {isRefreshing ? '🔄' : '🔄'}
          </button>
        </div>
        <style jsx>{`
          .online-refresh-bar {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
          }
          
          .online-refresh-button {
            background: rgba(52, 152, 219, 0.9);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.2s;
          }
          
          .online-refresh-button:hover:not(:disabled) {
            background: rgba(41, 128, 185, 0.9);
            transform: scale(1.1);
          }
          
          .online-refresh-button:disabled {
            background: rgba(189, 195, 199, 0.9);
            cursor: not-allowed;
            transform: none;
          }
        `}</style>
      </div>
    );
  }

  const formatTime = (ms) => {
    if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    return `${Math.floor(ms / 3600000)}h ago`;
  };

  return (
    <div className="offline-indicator">
      {isOffline && (
        <div className="offline-banner">
          <div className="offline-content">
            <span className="offline-icon">📡</span>
            <span className="offline-text">
              {cacheInfo?.hasCache ? 'Working offline with cached data' : 'No internet connection'}
            </span>
            <button 
              className="offline-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '−' : '+'}
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="offline-details">
          <div className="cache-info">
            <h4>Cache Status</h4>
            {cacheInfo?.hasCache ? (
              <div className="cache-details">
                <p>✅ Data cached {formatTime(cacheInfo.age)}</p>
                <p>⏰ Expires in {formatTime(cacheInfo.expiresIn)}</p>
                <p>🔄 Version: {cacheInfo.version}</p>
                <p className={cacheInfo.isValid ? 'valid' : 'expired'}>
                  {cacheInfo.isValid ? '✅ Cache is valid' : '⚠️ Cache expired'}
                </p>
              </div>
            ) : (
              <p>❌ No cached data available</p>
            )}
          </div>
          
          <div className="network-info">
            <h4>Network Status</h4>
            <p className={isOffline ? 'offline' : 'online'}>
              {isOffline ? '📡 Offline' : '🌐 Online'}
            </p>
          </div>
          
          <div className="refresh-controls">
            <h4>Data Refresh</h4>
            <button 
              className="refresh-button"
              onClick={handleManualRefresh}
              disabled={isRefreshing || isOffline}
            >
              {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
            <p className="refresh-info">
              {isOffline ? 'Refresh unavailable offline' : 'Get latest questions instantly'}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .offline-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .offline-banner {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 8px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .offline-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .offline-icon {
          font-size: 16px;
          margin-right: 8px;
        }

        .offline-text {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .offline-toggle {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .offline-toggle:hover {
          background: rgba(255,255,255,0.3);
        }

        .offline-details {
          background: white;
          border: 1px solid #e0e0e0;
          border-top: none;
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cache-info, .network-info, .refresh-controls {
          margin-bottom: 16px;
        }

        .cache-info:last-child, .network-info:last-child, .refresh-controls:last-child {
          margin-bottom: 0;
        }

        .cache-info h4, .network-info h4, .refresh-controls h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .cache-details p {
          margin: 4px 0;
          font-size: 13px;
          color: #666;
        }

        .valid {
          color: #27ae60;
          font-weight: 500;
        }

        .expired {
          color: #e74c3c;
          font-weight: 500;
        }

        .online {
          color: #27ae60;
          font-weight: 500;
        }

        .offline {
          color: #e74c3c;
          font-weight: 500;
        }

        .refresh-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
          margin-bottom: 8px;
        }

        .refresh-button:hover:not(:disabled) {
          background: #2980b9;
        }

        .refresh-button:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .refresh-info {
          margin: 0;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .offline-content {
            padding: 0 8px;
          }
          
          .offline-details {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
