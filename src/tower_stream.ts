import type { ServerWebSocket } from 'bun';
import { mtws } from './protocol/tower.generated.js';
import { decodeEnvelope, Envelope, validMove, type TowerEnvelope } from './tower_protocol.ts';
import { toApiAircraftEntry } from './aircraft_api.ts';
import { transceiversByCallsign } from './connectors/fsd-data/transceivers_match.ts';
import type { SimAircraftEntry, CameraJson } from './shared/types.ts';
import * as S from './state.ts';
export interface TowerPeerData { blocked: boolean; results: Uint8Array[]; lastCommand: number; }
export type TowerPeer = Pick<ServerWebSocket<TowerPeerData>, 'send'|'close'|'terminate'|'data'>;
interface Commands { move(value: mtws.tower.v1.IMove): void; reset(): void; }
export interface TowerStream {
 open(peer:TowerPeer):void; close(peer:TowerPeer):void; drain(peer:TowerPeer):void;
 message(peer:TowerPeer,bytes:string|Uint8Array):void;
 publishAircraftMotion(entry:SimAircraftEntry):void; publishCamera(camera:CameraJson):void;
 publishSimConnectStatus(connected:boolean):void; stop():void;
}
export function createTowerStream(commands: Commands): TowerStream {
 const peers = new Set<TowerPeer>();
 const motion = new Map<number, mtws.tower.v1.IMotion>();
 let camera: mtws.tower.v1.ICamera | null = null;
 let connected = false, sequence = 0;
 let timer: ReturnType<typeof setInterval> | undefined;
 const pack = (value: Omit<TowerEnvelope,'version'|'sequence'>, seq=++sequence) => Envelope.encode({version:1,sequence:seq,sample_time_ms:Date.now(),...value}).finish();
 const remove = (peer: TowerPeer) => { peers.delete(peer); if (!peers.size && timer) {clearInterval(timer);timer=undefined;} };
 const send = (peer: TowerPeer, bytes: Uint8Array) => {
  try { const result=peer.send(bytes); if(result===-1) peer.data.blocked=true; else if(result===0) {remove(peer);peer.terminate();} }
  catch { remove(peer);peer.terminate(); }
 };
 const broadcast = (bytes: Uint8Array) => { for(const peer of peers) if(!peer.data.blocked) send(peer,bytes); };
 function numeric(entry: { simobjectid:number; latitude:number; longitude:number; altitude:number; heading:number; groundspeed?:number; verticalSpeed?:number; on_ground?:number }): mtws.tower.v1.IMotion | null {
  if (![entry.latitude,entry.longitude,entry.altitude,entry.heading].every(Number.isFinite)) return null;
  return {simobjectid:entry.simobjectid,latitude:entry.latitude,longitude:entry.longitude,altitude:entry.altitude,heading:entry.heading,
   ...(Number.isFinite(entry.groundspeed)?{groundspeed:entry.groundspeed}:{}),
   ...(Number.isFinite(entry.verticalSpeed)?{vertical_speed:entry.verticalSpeed}:{}),
   ...(Number.isInteger(entry.on_ground)?{on_ground:entry.on_ground}:{}),revision:++sequence};
 }
 function snapshot() {
  const aircraft: mtws.tower.v1.IAircraftMetadata[]=[];
  const baselines: mtws.tower.v1.IMotion[]=[];
  const audio=transceiversByCallsign(S.transceiversData.value);
  for(const id of motion.keys()) if(!S.simAircraftMap.has(id)) motion.delete(id);
  for(const entry of S.simAircraftMap.values()) {
   if(!entry.callsign || (entry.simobjectid>=0 && (!connected || !motion.has(entry.simobjectid)))) continue;
   const api=toApiAircraftEntry(entry,audio);
   const metadata: mtws.tower.v1.IAircraftMetadata={simobjectid:entry.simobjectid,callsign:entry.callsign};
   const mapping={type:'type',dep:'dep',arr:'arr',transponder:'transponder',transponder_asgn:'transponder_asgn',deptime:'deptime',dep_rwy:'depRwy',dep_sid:'depSID',gate:'gate',scratchpad:'scratchpad',arr_rwy:'arrRwy',arr_star:'arrSTAR',registration:'registration',tobt:'tobt',flightplan:'flightplan'} as const;
   for(const [wire,key] of Object.entries(mapping)) if(typeof api[key]==='string') (metadata as unknown as Record<string,unknown>)[wire]=api[key];
   metadata.transceivers=api.transceivers.map(row=>({id:row.id,frequency:row.frequency,lat_deg:row.latDeg,lon_deg:row.lonDeg,height_msl_m:row.heightMslM,height_agl_m:row.heightAglM})).filter(row=>Object.values(row).every(Number.isFinite));
   aircraft.push(metadata);
   const baseline=numeric({ simobjectid:entry.simobjectid, latitude:api.latitude as number, longitude:api.longitude as number, altitude:api.altitude as number, heading:api.heading as number, groundspeed:api.groundspeed as number, verticalSpeed:entry.verticalSpeed, on_ground:entry.on_ground });
   if(baseline) {
    const previous=motion.get(entry.simobjectid);
    if(previous && ['latitude','longitude','altitude','heading','groundspeed','vertical_speed','on_ground'].every(key=>previous[key as keyof typeof previous]===baseline[key as keyof typeof baseline])) baseline.revision=previous.revision;
    motion.set(entry.simobjectid,baseline);baselines.push(baseline);
   }
  }
  return pack({snapshot:{aircraft,motion:baselines,camera:camera ?? undefined,simconnect_connected:connected}});
 }
 const result=(peer:TowerPeer,seq:number,accepted:boolean,error?:string)=>{
  const bytes=pack({result:{accepted,error}},seq);
  if(peer.data.blocked) { if(peer.data.results.length>=32){peer.close(1013,'result backlog');remove(peer);}else peer.data.results.push(bytes); }
  else send(peer,bytes);
 };
 return {
  open(peer:TowerPeer) {peer.data={blocked:false,results:[],lastCommand:0};peers.add(peer);send(peer,snapshot());if(!timer)timer=setInterval(()=>{if(peers.size)broadcast(snapshot());},1000);},
  close:remove,
  drain(peer:TowerPeer) {if(!peers.has(peer))return;peer.data.blocked=false;while(peer.data.results.length&&!peer.data.blocked)send(peer,peer.data.results.shift()!);if(!peer.data.blocked)send(peer,snapshot());},
  message(peer:TowerPeer,bytes:string|Uint8Array) {
   let value: mtws.tower.v1.Envelope;
   try {if(typeof bytes==='string')throw new Error('invalid_message');value=decodeEnvelope(bytes);}catch(error){peer.close(1002,error instanceof Error?error.message:'invalid_message');remove(peer);return;}
   if(value.heartbeat){if(!value.heartbeat.reply && !peer.data.blocked)send(peer,pack({heartbeat:{reply:true}},value.sequence));return;}
   if(value.sequence<=peer.data.lastCommand){result(peer,value.sequence,false,'invalid_message');return;}
   peer.data.lastCommand=value.sequence;
   if(!value.move&&!value.reset){result(peer,value.sequence,false,'invalid_message');return;}
   if(value.move&&!validMove(value.move)){result(peer,value.sequence,false,'invalid_move');return;}
   if(value.reset?.reset!==undefined && value.reset.reset!==1){result(peer,value.sequence,false,'invalid_reset');return;}
   if(!connected){result(peer,value.sequence,false,'simconnect_unavailable');return;}
   try {if(value.move)commands.move(value.move);else commands.reset();result(peer,value.sequence,true);}catch(error){result(peer,value.sequence,false,error instanceof Error&&error.message==='simconnect_unavailable'?'simconnect_unavailable':'dispatch_failed');}
  },
  publishAircraftMotion(entry:SimAircraftEntry) {const value=numeric(entry);if(!value)return;motion.set(entry.simobjectid,value);if(peers.size)broadcast(pack({motion:value},value.revision));},
  publishCamera(value:CameraJson) {camera={...value,revision:++sequence};if(peers.size)broadcast(pack({camera},camera.revision));},
  publishSimConnectStatus(value:boolean) {if(connected===value)return;connected=value;if(!value){motion.clear();camera=null;}if(peers.size){broadcast(pack({status:{simconnect_connected:value}}));broadcast(snapshot());}},
  stop(){clearInterval(timer);timer=undefined;for(const peer of peers)peer.close(1001,'server shutdown');peers.clear();motion.clear();camera=null;},
 };
}
let active: TowerStream | undefined;
export function setTowerStream(stream: TowerStream | undefined) {active=stream;}
export function publishAircraftMotion(entry:SimAircraftEntry){active?.publishAircraftMotion(entry);}
export function publishCamera(camera:CameraJson){active?.publishCamera(camera);}
export function publishSimConnectStatus(connected:boolean){active?.publishSimConnectStatus(connected);}
