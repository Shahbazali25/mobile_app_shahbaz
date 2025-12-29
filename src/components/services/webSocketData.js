import { useState, useEffect } from 'react';
import webSocketService from './socketConnection';

export function useWebSocketData(topic) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Ensure connection is established
    webSocketService.connect();

    // Callback to update state
    const handleData = (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        // console.log(`Receivedss data for ${topic}:`, parsedMessage);
        // Handle batch mode
        if (parsedMessage.batchMode && parsedMessage.messages) {
          const batchData = {};
          parsedMessage.messages.forEach(msg => {
            if (msg.topic && msg.message) {
              batchData[msg.topic] = msg.message;
            }
          });
          setData(prevData => ({ ...prevData, ...batchData }));
        } 
        // Handle single message
        else if (parsedMessage.topic && parsedMessage.message) {
          setData(prevData => ({
            ...prevData,
            [parsedMessage.topic]: parsedMessage.message
          }));
        }
      } catch (error) {
        console.error(`Error parsing ${topic} data:`, error);
      }
    };

    // Subscribe to topic
    webSocketService.subscribe(topic, handleData);

    // Cleanup subscription on unmount
    return () => {
      webSocketService.unsubscribe(topic, handleData);
    };
  }, [topic]);

  return data;
}