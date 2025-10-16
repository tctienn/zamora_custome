import { storeToRefs } from 'pinia';
import { SSE, type SSEOptions, type SSEvent } from 'sse.js';

import { useUserStore } from '@/common/store/user';

export const useCheckinSSE = () => {
  let eventSource: SSE | null = null;
  const { authentication } = storeToRefs(useUserStore());

  function register(url: string, handlers: Record<string, (e: any) => void>) {
    const eventSourceInitDict: SSEOptions = {
      headers: {
        'Authorization': authentication.value,
        'Access-Control-Allow-Origin': '*'
      }
    };

    function connect() {
      eventSource = new SSE(url, eventSourceInitDict);

      for (const [event, handler] of Object.entries(handlers)) {
        eventSource.addEventListener(event, handler);
      }

      eventSource.onerror = (error: SSEvent) => {
        eventSource?.close();
      };
    }

    connect();
    let reconnecting = false;
    setInterval(() => {
      if (eventSource?.readyState == EventSource.CLOSED) {
        reconnecting = true;
        connect();
      } else if (reconnecting) {
        reconnecting = false;
      }
    }, 5 * 60 * 1000);
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  }

  return {
    register,
    disconnect
  };
};