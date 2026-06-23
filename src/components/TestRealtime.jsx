import { useEffect, useState } from 'react';
import { getEcho } from '../lib/echoManager';

const TestRealtime = () => {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  const addLog = (message) => {
    setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), message }]);
  };

  useEffect(() => {
    addLog('🚀 Starting TestRealtime component');

    try {
      const echo = getEcho();
      addLog('✅ Echo instance created');

      echo.connector.pusher.connection.bind('connected', () => {
        addLog('🔌 WebSocket CONNECTED!');
        setConnected(true);
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        addLog('❌ WebSocket DISCONNECTED!');
        setConnected(false);
      });

      // Test: Subscribe to a test channel
      const testChannel = echo.channel('test-channel');
      addLog('📡 Subscribed to test-channel');

      testChannel.listenToAll((event, data) => {
        addLog(`🔍 Test channel event: ${event}`, data);
      });

    } catch (error) {
      addLog(`❌ ERROR: ${error.message}`);
      console.error('TestRealtime error:', error);
    }

    return () => {
      addLog('👋 TestRealtime unmounting');
    };
  }, []);

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: '#fff', minHeight: '300px' }}>
      <h2 style={{ marginBottom: '20px' }}>🔍 Realtime Debug Console</h2>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: connected ? '#4ade80' : '#ef4444' }}>
        WebSocket: {connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#2d2d2d', padding: '10px', borderRadius: '8px' }}>
        {logs.map(log => (
          <div key={log.id} style={{ marginBottom: '5px', fontSize: '14px' }}>
            <span style={{ color: '#888' }}>[{log.time}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestRealtime;
