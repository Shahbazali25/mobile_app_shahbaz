import { io } from 'socket.io-client';
import { loadData } from '../auth/loadData';
import { SOCKET_URL } from '../utils/baseUrl';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    if (this.socket) {
      return Promise.resolve(true);
    }

    try {
      const auth = await loadData();
      const token = auth.access_token;

      return new Promise((resolve, reject) => {
        if (!token) {
          return reject(new Error('⚠️ No auth token found.'));
        }

        this.socket = io(`${SOCKET_URL}?token=${token}`, {
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 10000,
        });

        // Connection success
        this.socket.on('connect', () => {
          console.log('✅ WebSocket Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.setupReconnectionListeners();
          this.resubscribeToTopics();
          resolve(true);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket Connection Error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnect handling
        this.socket.on('disconnect', (reason) => {
          console.warn('⚠️ WebSocket Disconnected:', reason);
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      throw error;
    }
  }

  setupReconnectionListeners() {
    this.socket.io.on('reconnect', (attempt) => {
      console.log(`Reconnected on attempt ${attempt}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.resubscribeToTopics();
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(`Reconnection attempt ${attempt}`);
    });

    this.socket.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('Could not reconnect to the server');
      this.isConnected = false;
    });
  }

  subscribe(topic, callback) {
    // If socket is not connected, store the subscription for later
    if (!this.listeners[topic]) {
      this.listeners[topic] = [];
    }
    
    this.listeners[topic].push(callback);

    // If socket is connected, immediately set up the listener
    if (this.isConnected && this.socket) {
      this.socket.on(topic, callback);
    }
  }

  unsubscribe(topic, callback) {
    if (this.listeners[topic]) {
      // Remove from local listeners array
      this.listeners[topic] = this.listeners[topic].filter(
        cb => cb !== callback
      );

      // Remove socket listener if socket exists
      if (this.socket) {
        this.socket.off(topic, callback);
      }
    }
  }

  resubscribeToTopics() {
    // Resubscribe to all previously registered topics
    Object.keys(this.listeners).forEach(topic => {
      this.listeners[topic].forEach(callback => {
        if (this.socket) {
          this.socket.on(topic, callback);
        }
      });
    });
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`Cannot set listener for "${event}" - socket not connected`);
    }
  }

  emit(event, data) {
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners = {};
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;