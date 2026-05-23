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
    key: 'oriotel_reverb_key',
    wsHost: 'localhost',
    wsPort: 8085,
    wssPort: 8085,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => {
      console.log('🎯 AUTHORIZER CALLED! Channel object:', channel);
      console.log('🎯 Channel name:', channel.name);
      console.log('🎯 Channel options:', options);
      return {
        authorize: (socketId, callback) => {
          console.log('🔐 Authorizing channel:', channel.name, 'socket:', socketId);
          axios.post('http://localhost:8080/api/communication/broadcasting/auth', {
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

  return echoInstance;
};
