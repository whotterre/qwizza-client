import { useEffect, useRef, useCallback } from "react";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("http", "ws") || "ws://localhost:3000";

type SocketEventHandler = (payload: any) => void;

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());

  const emit = useCallback((type: string, payload?: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      console.log(`[Socket] Emitting event: ${type}`, payload);
      socketRef.current.send(message);
    } else {
      console.warn(`[Socket] Cannot emit "${type}" - socket not connected`);
    }
  }, []);

  const on = useCallback((type: string, handler: SocketEventHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    console.log(`[Socket] Registered handler for event type: ${type}`);

    return () => {
      handlersRef.current.get(type)?.delete(handler);
      console.log(`[Socket] Unregistered handler for event type: ${type}`);
    };
  }, []);

  const off = useCallback((type: string, handler: SocketEventHandler) => {
    handlersRef.current.get(type)?.delete(handler);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => {
      socketRef.current = socket;
      console.log(`[Socket] Connected to ${SOCKET_URL}`);
      options.onConnect?.();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, payload } = message;
        
        console.log(`[Socket] Received event: ${type}`, payload);
        
        if (type && handlersRef.current.has(type)) {
          handlersRef.current.get(type)!.forEach((handler) => {
            handler(payload);
          });
        } else if (type) {
          console.warn(`[Socket] No handlers registered for event type: ${type}`);
        }
      } catch (err) {
        console.error("Failed to parse socket message:", err, event.data);
      }
    };

    socket.onerror = (error) => {
      console.error("[Socket] WebSocket error:", error);
      options.onError?.(error);
    };

    socket.onclose = () => {
      socketRef.current = null;
      console.log("[Socket] Disconnected");
      options.onDisconnect?.();
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [options.onConnect, options.onDisconnect, options.onError]);

  return { emit, on, off };
}
