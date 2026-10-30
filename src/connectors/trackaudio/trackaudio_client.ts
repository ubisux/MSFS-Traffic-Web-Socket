import {
  trackAudioConnectTimeoutMs,
  trackAudioMessageTimeoutMs,
  trackAudioWsUrl,
} from "../../config.ts";

interface TrackAudioMessage {
  type?: string;
  value?: Record<string, unknown>;
}

interface TrackAudioStation {
  callsign: string;
  frequency?: number;
  isAvailable?: boolean;
  rx?: boolean;
}

export class TrackAudioError extends Error {
  constructor(
    message: string,
    readonly kind: "unavailable" | "timeout" | "protocol" = "protocol",
  ) {
    super(message);
    this.name = "TrackAudioError";
  }
}

type WebSocketFactory = (url: string) => WebSocket;

const defaultWebSocketFactory: WebSocketFactory = (url) => new WebSocket(url);
let webSocketFactory = defaultWebSocketFactory;

export function setTrackAudioWebSocketFactory(factory: WebSocketFactory): void {
  webSocketFactory = factory;
}

function messageMatchesStation(
  message: TrackAudioMessage,
  callsign: string,
): boolean {
  return (message.type === "kStationStateUpdate" || message.type === "kStationAdded") &&
    message.value?.callsign === callsign;
}

function stationFromMessage(message: TrackAudioMessage): TrackAudioStation | null {
  if ((message.type !== "kStationStateUpdate" && message.type !== "kStationAdded") || !message.value) return null;
  const callsign = message.value.callsign;
  if (typeof callsign !== "string") return null;
  const frequency = message.value.frequency;
  return {
    callsign,
    frequency: typeof frequency === "number" ? frequency : undefined,
    isAvailable: message.value.isAvailable !== false,
    rx: typeof message.value.rx === "boolean" ? message.value.rx : undefined,
  };
}

class TrackAudioConnection {
  private readonly socket: WebSocket;
  private readonly messages: TrackAudioMessage[] = [];
  private opened: Promise<void>;
  private onMessage?: (message: TrackAudioMessage) => void;

  constructor() {
    this.socket = webSocketFactory(trackAudioWsUrl);
    this.opened = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new TrackAudioError("TrackAudio connection timed out", "timeout"));
        this.socket.close();
      }, trackAudioConnectTimeoutMs);
      this.socket.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new TrackAudioError("TrackAudio connection failed", "unavailable"));
      }, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as TrackAudioMessage;
        if (this.onMessage) this.onMessage(message);
        else this.messages.push(message);
      } catch {
        // Ignore non-JSON frames; the protocol uses JSON messages.
      }
    });
  }

  async waitFor(predicate: (message: TrackAudioMessage) => boolean): Promise<TrackAudioMessage> {
    await this.opened;
    const buffered = this.messages.find(predicate);
    if (buffered) return buffered;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.onMessage = undefined;
        reject(new TrackAudioError("TrackAudio response timed out", "timeout"));
      }, trackAudioMessageTimeoutMs);
      this.onMessage = (message) => {
        if (!predicate(message)) return;
        clearTimeout(timer);
        this.onMessage = undefined;
        resolve(message);
      };
    });
  }

  async send(message: Record<string, unknown>): Promise<void> {
    await this.opened;
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new TrackAudioError("TrackAudio websocket is not open", "unavailable");
    }
    this.socket.send(JSON.stringify(message));
  }

  close(): void {
    this.onMessage = undefined;
    if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
      this.socket.close();
    }
  }
}

async function performStationUpdate(requestedStations: readonly string[]): Promise<void> {
  const connection = new TrackAudioConnection();
  try {
    await connection.send({ type: "kGetStationStates" });
    const statesMessage = await connection.waitFor((message) => message.type === "kStationStates");
    const states = Array.isArray(statesMessage.value?.stations)
      ? statesMessage.value.stations
        .map((value) => stationFromMessage(value as TrackAudioMessage))
        .filter((station): station is TrackAudioStation => station !== null)
      : [];

    for (const station of states) {
      if (typeof station.frequency !== "number") continue;
      await connection.send({
        type: "kSetStationState",
        value: { frequency: station.frequency, rx: false },
      });
      await connection.waitFor((message) => messageMatchesStation(message, station.callsign));
    }

    for (const callsign of requestedStations) {
      let station = states.find((candidate) => candidate.callsign === callsign);
      if (!station || typeof station.frequency !== "number" || station.isAvailable === false) {
        await connection.send({ type: "kAddStation", value: { callsign } });
        const added = await connection.waitFor((message) => messageMatchesStation(message, callsign));
        const addedStation = stationFromMessage(added);
        if (addedStation) station = addedStation;
      }
      if (!station || typeof station.frequency !== "number" || station.isAvailable === false) {
        throw new TrackAudioError(`TrackAudio station is unavailable: ${callsign}`, "protocol");
      }
      await connection.send({
        type: "kSetStationState",
        value: { frequency: station.frequency, rx: true },
      });
      await connection.waitFor((message) => messageMatchesStation(message, callsign));
    }
  } finally {
    connection.close();
  }
}

let updateQueue: Promise<void> = Promise.resolve();

export function setTrackAudioStations(stations: readonly string[]): Promise<void> {
  const operation = updateQueue.then(() => performStationUpdate(stations));
  updateQueue = operation.catch(() => undefined);
  return operation;
}
