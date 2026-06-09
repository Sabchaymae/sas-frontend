import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

let echoInstance = null;

export const getEcho = () => {
  if (echoInstance) {
    console.log('🔄 Returning existing Echo instance');
    return echoInstance;
  }

  console.log('🚀 Creating NEW Echo instance');

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: 'oriotel1_reverb_key',
    wsHost: window.location.hostname,
    wsPort: 8095,
    wssPort: 8095,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: `http://${window.location.hostname}:8090/api/communication/broadcasting/auth`,
    authorizer: (channel, options) => {
      console.log('🎯 AUTHORIZER CALLED! Channel object:', channel);
      console.log('🎯 Channel name:', channel.name);
      console.log('🎯 Channel options:', options);
      return {
        authorize: (socketId, callback) => {
          console.log('🔐 Authorizing channel:', channel.name, 'socket:', socketId);
          axios.post(`http://${window.location.hostname}:8090/api/communication/broadcasting/auth`, {
            socket_id: socketId,
            channel_name: channel.name
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              Accept: 'application/json',
            }
          })
          .then(response => {
            console.log('✅ Authorization SUCCESS:', response.data);
            callback(false, response.data);
          })
          .catch(error => {
            console.error('❌ Authorization FAILED:', error);
            callback(true, error);
          });
        }
      };
    }
  });

  echoInstance.connector.pusher.connection.bind('state_change', (states) => {
    console.log('🔌 WebSocket state changed:', states);
  });

  echoInstance.connector.pusher.connection.bind('connected', () => {
    console.log('✅ WebSocket CONNECTED!');
  });

  echoInstance.connector.pusher.connection.bind('disconnected', () => {
    console.log('❌ WebSocket DISCONNECTED!');
  });

  echoInstance.connector.pusher.connection.bind('error', (error) => {
    console.error('⚠️ WebSocket ERROR:', error);
  });

  return echoInstance;
};

export const resetEcho = () => {
  if (echoInstance) {
    console.log('🔄 Resetting Echo instance');
    echoInstance.connector.pusher.connection.disconnect();
    echoInstance = null;
  }
};
