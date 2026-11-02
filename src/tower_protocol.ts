import { mtws } from './protocol/tower.generated.js';
export const Envelope = mtws.tower.v1.Envelope;
export type TowerEnvelope = mtws.tower.v1.IEnvelope;
export function validMove(value: mtws.tower.v1.IMove): boolean {
 const bounds = { lat: [-90,90], lon: [-180,180], alt: [-1000,100000], heading: [0,360], pitch: [-90,90], bank: [-180,180], cockpit_camera_zoom: [0,100] } as const;
 return Object.entries(bounds).every(([key, [min,max]]) => {
  const number = value[key as keyof typeof bounds];
  return typeof number === 'number' && Number.isFinite(number) && number >= min && number <= max;
 });
}
export function decodeEnvelope(bytes: Uint8Array): mtws.tower.v1.Envelope {
 const value = Envelope.decode(bytes);
 if (value.version !== 1) throw new Error('unsupported_version');
 if (!Number.isSafeInteger(value.sequence) || value.sequence <= 0) throw new Error('invalid_message');
 if (value.sample_time_ms != null && (!Number.isFinite(value.sample_time_ms) || value.sample_time_ms < 0)) throw new Error('invalid_message');
 if (['snapshot','motion','camera','move','reset','result','status','heartbeat'].filter(key => value[key as keyof typeof value] != null).length !== 1) throw new Error('invalid_message');
 return value;
}
