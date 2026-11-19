import { useCallback, useEffect, useRef, useState } from "react";
import { OVERLAY_PORT_NAME, type OverlayMessage } from "../shared/messages";
import {
  INITIAL_OVERLAY_STATE,
  type OverlayState,
  type StateMessage,
} from "../shared/overlay-state";

const RECONNECT_DELAY_MS = 500;
const HEARTBEAT_INTERVAL_MS = 20_000;

/** Conexión con el service worker; se reconecta si este se reinicia (MV3). */
export function useOverlayConnection(sessionId: string) {
  const [state, setState] = useState<OverlayState>(INITIAL_OVERLAY_STATE);
  const [connected, setConnected] = useState(false);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const heartbeat = setInterval(() => {
      portRef.current?.postMessage({ type: "overlay.ping" } satisfies OverlayMessage);
    }, HEARTBEAT_INTERVAL_MS);
    const connect = () => {
      const port = chrome.runtime.connect({ name: OVERLAY_PORT_NAME });
      portRef.current = port;
      port.onMessage.addListener((message: StateMessage) => {
        setState(message.state);
      });
      port.onDisconnect.addListener(() => {
        setConnected(false);
        if (!disposed) {
          timer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      });
      port.postMessage({ type: "overlay.ready", sessionId } satisfies OverlayMessage);
      setConnected(true);
    };
    connect();
    return () => {
      disposed = true;
      clearTimeout(timer);
      clearInterval(heartbeat);
      portRef.current?.disconnect();
    };
  }, [sessionId]);

  const send = useCallback((message: OverlayMessage) => {
    portRef.current?.postMessage(message);
  }, []);

  return { state, connected, send };
}
