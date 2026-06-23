import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'oriotel_reverb_key',
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  wsPort: import.meta.env.VITE_REVERB_PORT || 8085,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8085,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
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
          callback(false, response.data);
        })
        .catch(error => {
          callback(true, error);
        });
      }
    };
  }
});

export default echo;
