import { test, expect } from 'bun:test';
import { mtws as server } from './protocol/tower.generated.js';
import { mtws as client } from '../../Website/src/lib/mtws-protocol/tower.generated.js';
import { decodeEnvelope, validMove } from './tower_protocol.ts';
import { readFileSync } from 'node:fs';
test('cross-decodes zero values, negative IDs, absence and empty membership', () => {
 const value = { version: 1, sequence: 1, snapshot: { simconnect_connected: false, aircraft: [{simobjectid: -1, callsign:'TEST'}], motion:[{simobjectid:-1,latitude:0,longitude:0,altitude:0,heading:0,revision:1}] } };
 const decoded = client.tower.v1.Envelope.decode(server.tower.v1.Envelope.encode(value).finish());
 expect(decoded.snapshot?.motion?.[0]?.latitude).toBe(0);
 expect(decoded.snapshot?.motion?.[0]?.simobjectid).toBe(-1);
 expect(decoded.snapshot?.aircraft?.[0]?.tobt).toBeNull();
 expect(decoded.snapshot?.simconnect_connected).toBe(false);
 const move={lat:0,lon:0,alt:100000,heading:0,pitch:90,bank:-180,cockpit_camera_zoom:0};
 expect(validMove(decodeEnvelope(client.tower.v1.Envelope.encode({version:1,sequence:2,move}).finish()).move!)).toBe(true);
 expect(validMove({...move,lat:NaN})).toBe(false);
 expect(validMove({...move,alt:100001})).toBe(false);
 expect(decodeEnvelope(server.tower.v1.Envelope.encode({version:1,sequence:3,snapshot:{simconnect_connected:true}}).finish()).snapshot?.aircraft).toEqual([]);
});
test('rejects malformed, missing required, unsupported and multiple payloads',()=>{
 expect(()=>decodeEnvelope(new Uint8Array([255]))).toThrow();
 expect(()=>decodeEnvelope(new Uint8Array())).toThrow();
 expect(()=>decodeEnvelope(server.tower.v1.Envelope.encode({version:2,sequence:1,status:{simconnect_connected:true}}).finish())).toThrow('unsupported_version');
 expect(()=>decodeEnvelope(server.tower.v1.Envelope.encode({version:1,sequence:1,status:{simconnect_connected:true},heartbeat:{reply:false}}).finish())).toThrow('invalid_message');
 const bytes=server.tower.v1.Envelope.encode({version:1,sequence:1,heartbeat:{reply:false}}).finish();
 expect(decodeEnvelope(new Uint8Array([...bytes, 0xa0, 0x06, 1])).heartbeat?.reply).toBe(false);
});
test('generated artifacts match across repositories',()=>{
 for(const name of ['tower.generated.js','tower.generated.d.ts']) expect(readFileSync(new URL('./protocol/'+name,import.meta.url))).toEqual(readFileSync(new URL('../../Website/src/lib/mtws-protocol/'+name,import.meta.url)));
});
