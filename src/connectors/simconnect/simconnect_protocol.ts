import { Protocol } from "node-simconnect";

export async function openSimConnectWithFallback<T>(
  open: (protocol: Protocol) => Promise<T>,
  onFallback: (error: unknown) => void,
): Promise<{ result: T; protocol: Protocol }> {
  try {
    return { result: await open(Protocol.SunRise), protocol: Protocol.SunRise };
  } catch (error) {
    onFallback(error);
    return { result: await open(Protocol.KittyHawk), protocol: Protocol.KittyHawk };
  }
}
