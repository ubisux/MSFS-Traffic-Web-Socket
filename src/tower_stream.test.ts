import { test,expect } from 'bun:test';
import { httpServerThread,towerOriginAllowed } from './http_server.ts';
import { createTowerStream,type TowerPeer } from './tower_stream.ts';
import { Envelope } from './tower_protocol.ts';
import { dispatchTowerMove,dispatchTowerReset,setMovementSimConnectHandle } from './aircraft_movement.ts';
import * as S from './state.ts';
import type { SimAircraftEntry } from './shared/types.ts';
const entry = (id=1) => ({simobjectid:id,callsign:'TEST',latitude:0,longitude:0,altitude:100,heading:0,groundspeed:20,verticalSpeed:0,on_ground:0}) as SimAircraftEntry;
const move={lat:0,lon:0,alt:100,heading:90,pitch:-15,bank:0,cockpit_camera_zoom:0};
const sleep=(ms:number)=>Bun.sleep(ms);
// Integration exception: exercise real Bun socket delivery and the hub's one-second
// metadata cadence together; fake timers cannot drive the native socket event loop.
test('actual socket streams source samples and dispatches 60 immediate position/zoom pairs',async()=>{
 const writes: {definition:number;bytes:Buffer}[]=[];
 setMovementSimConnectHandle({setDataOnSimObject(definition:number,_id:number,value:{buffer:{getBuffer():Buffer}}){writes.push({definition,bytes:Buffer.from(value.buffer.getBuffer())});}} as never);
 S.simconnectConnected.value=true;
 const hub=createTowerStream({move:dispatchTowerMove,reset:dispatchTowerReset});
 hub.publishSimConnectStatus(true);S.simAircraftMap.set(1,entry());hub.publishAircraftMotion(entry());
 const service=httpServerThread({port:0,stream:hub});
 const messages: ReturnType<typeof Envelope.decode>[]=[];
 const ws=new WebSocket(`ws://localhost:${service.server.port}/ws/tower`,{headers:{Origin:'http://localhost:3000'}});
 ws.binaryType='arraybuffer';ws.onmessage=event=>messages.push(Envelope.decode(new Uint8Array(event.data as ArrayBuffer)));
 try {
  for(let i=0;i<100&&!messages.length;i++)await sleep(5);
  expect(messages[0]?.snapshot?.aircraft?.[0]?.callsign).toBe('TEST');
  for(let i=0;i<60;i++){
   hub.publishAircraftMotion({...entry(),latitude:i});hub.publishCamera({aircraft_latitude:i});
   ws.send(Envelope.encode({version:1,sequence:i+1,move}).finish());await sleep(17);
  }
  for(let i=0;i<100&&messages.filter(m=>m.result).length<60;i++)await sleep(5);
  expect(messages.filter(m=>m.motion)).toHaveLength(60);expect(messages.filter(m=>m.camera)).toHaveLength(60);
  expect(messages.filter(m=>m.snapshot).length).toBeLessThanOrEqual(2);
  expect(messages.filter(m=>m.result?.accepted)).toHaveLength(60);expect(writes).toHaveLength(120);
  expect(writes[0]?.bytes.readDoubleLE(16)).toBe(100);expect(writes[0]?.bytes.readDoubleLE(24)).toBeCloseTo(Math.PI/2);
  expect(writes[0]?.bytes.readDoubleLE(32)).toBeCloseTo(-Math.PI/12);expect(writes[1]?.bytes.readDoubleLE(0)).toBe(0);
  ws.send(Envelope.encode({version:1,sequence:61,reset:{reset:1}}).finish());await sleep(20);
  expect(writes.at(-1)?.bytes.readInt32LE(0)).toBe(1);
  ws.send(Envelope.encode({version:1,sequence:62,move:{...move,lat:91}}).finish());await sleep(20);
  expect(messages.at(-1)?.result?.error).toBe('invalid_move');
  hub.publishSimConnectStatus(false);ws.send(Envelope.encode({version:1,sequence:63,move}).finish());await sleep(20);
  expect(messages.at(-1)?.result?.error).toBe('simconnect_unavailable');
  const resumed=Promise.withResolvers<void>();
  const extra=new WebSocket(`ws://localhost:${service.server.port}/ws/tower`,{headers:{Origin:'https://vathk.com'}});
  extra.onopen=()=>resumed.resolve();extra.onerror=()=>resumed.reject(new Error('Allowed origin refused'));
  await resumed.promise;
  const metadataUpdated=Promise.withResolvers<void>();
  extra.binaryType='arraybuffer';extra.onmessage=event=>{
   const value=Envelope.decode(new Uint8Array(event.data as ArrayBuffer));
   if(value.snapshot?.aircraft?.some(a=>a.simobjectid===-1&&a.type==='UPDATED'))metadataUpdated.resolve();
  };
  S.simAircraftMap.delete(1);S.simAircraftMap.set(-1,{...entry(-1),type:'UPDATED'});
  await metadataUpdated.promise;
  hub.publishSimConnectStatus(true);
  ws.send(Envelope.encode({version:1,sequence:64,move}).finish());
  const commandAccepted=Promise.withResolvers<void>();
  const oldMessage=ws.onmessage;
  ws.onmessage=event=>{oldMessage?.call(ws,event);const value=Envelope.decode(new Uint8Array(event.data as ArrayBuffer));if(value.sequence===64&&value.result?.accepted)commandAccepted.resolve();};
  await commandAccepted.promise;
  expect(writes).toHaveLength(123);
  expect(messages.filter(m=>m.result?.accepted).length).toBe(62);
  extra.close();
  expect((await fetch(`http://localhost:${service.server.port}/aircraft`)).status).toBe(200);
  expect((await fetch(`http://localhost:${service.server.port}/ws/tower`)).status).toBe(403);
  expect((await fetch(`http://localhost:${service.server.port}/ws/tower`,{headers:{Origin:'http://localhost:3000'}})).status).toBe(426);
  expect(ws.extensions).not.toContain('permessage-deflate');
 } finally {ws.close();service.stop();setMovementSimConnectHandle(null!);S.simconnectConnected.value=false;S.simAircraftMap.clear();}
},10000);
test('loopback access is exact and backpressure resynchronizes rather than retaining deltas',()=>{
 expect(towerOriginAllowed('https://vathk.com','::1')).toBe(true);
 expect(towerOriginAllowed('http://localhost:3000','127.0.0.1')).toBe(true);
 expect(towerOriginAllowed('https://evil.test','127.0.0.1')).toBe(false);
 expect(towerOriginAllowed(null,'127.0.0.1')).toBe(false);
 expect(towerOriginAllowed('https://vathk.com','192.168.1.2')).toBe(false);
 let backpressure=false;const sent: ReturnType<typeof Envelope.decode>[]=[];const closed:number[]=[];
 const peer:TowerPeer={data:{blocked:false,results:[],lastCommand:0},send(bytes){sent.push(Envelope.decode(bytes as Uint8Array));return backpressure?-1:1;},close(code){closed.push(code!);},terminate(){closed.push(0);}};
 const hub=createTowerStream({move(){},reset(){}});hub.publishSimConnectStatus(true);S.simAircraftMap.set(1,entry());hub.publishAircraftMotion(entry());
 try {hub.open(peer);backpressure=true;hub.publishAircraftMotion(entry());
  for(let i=0;i<100;i++)hub.publishAircraftMotion({...entry(),latitude:i});
  expect(sent).toHaveLength(2);expect(peer.data.results).toHaveLength(0);
  S.simAircraftMap.delete(1);S.simAircraftMap.set(-2,entry(-2));hub.publishCamera({aircraft_latitude:50});backpressure=false;hub.drain(peer);
  expect(sent.at(-1)?.snapshot?.aircraft?.map(a=>a.simobjectid)).toEqual([-2]);expect(sent.at(-1)?.snapshot?.camera?.aircraft_latitude).toBe(50);
  backpressure=true;hub.publishCamera({});
  for(let i=1;i<=33;i++)hub.message(peer,Envelope.encode({version:1,sequence:i,reset:{reset:1}}).finish());
  expect(closed).toContain(1013);
 } finally {hub.stop();S.simAircraftMap.clear();}
});
