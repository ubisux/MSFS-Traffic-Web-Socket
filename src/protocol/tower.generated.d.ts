import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace mtws. */
export namespace mtws {

    /** Namespace tower. */
    namespace tower {

        /** Namespace v1. */
        namespace v1 {

            /**
             * Properties of an Envelope.
             * @deprecated Use mtws.tower.v1.Envelope.$Properties instead.
             */
            interface IEnvelope extends mtws.tower.v1.Envelope.$Properties {
            }

            /** Represents an Envelope. */
            class Envelope {

                /**
                 * Constructs a new Envelope.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Envelope.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Envelope version. */
                version: number;

                /** Envelope sequence. */
                sequence: number;

                /** Envelope sample_time_ms. */
                sample_time_ms?: (number|null);

                /** Envelope snapshot. */
                snapshot?: (mtws.tower.v1.Snapshot.$Properties|null);

                /** Envelope motion. */
                motion?: (mtws.tower.v1.Motion.$Properties|null);

                /** Envelope camera. */
                camera?: (mtws.tower.v1.Camera.$Properties|null);

                /** Envelope move. */
                move?: (mtws.tower.v1.Move.$Properties|null);

                /** Envelope reset. */
                reset?: (mtws.tower.v1.Reset.$Properties|null);

                /** Envelope result. */
                result?: (mtws.tower.v1.Result.$Properties|null);

                /** Envelope status. */
                status?: (mtws.tower.v1.Status.$Properties|null);

                /** Envelope heartbeat. */
                heartbeat?: (mtws.tower.v1.Heartbeat.$Properties|null);

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Envelope instance
                 */
                static create(properties: mtws.tower.v1.Envelope.$Shape): mtws.tower.v1.Envelope & mtws.tower.v1.Envelope.$Shape;
                static create(properties?: mtws.tower.v1.Envelope.$Properties): mtws.tower.v1.Envelope;

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link mtws.tower.v1.Envelope.verify|verify} messages.
                 * @param message Envelope message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Envelope.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Envelope & mtws.tower.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Envelope & mtws.tower.v1.Envelope.$Shape;

                /**
                 * Verifies an Envelope message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Envelope
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Envelope;

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @param message Envelope
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Envelope to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Envelope {

                /** Properties of an Envelope. */
                interface $Properties {

                    /** Envelope version */
                    version: number;

                    /** Envelope sequence */
                    sequence: number;

                    /** Envelope sample_time_ms */
                    sample_time_ms?: (number|null);

                    /** Envelope snapshot */
                    snapshot?: (mtws.tower.v1.Snapshot.$Properties|null);

                    /** Envelope motion */
                    motion?: (mtws.tower.v1.Motion.$Properties|null);

                    /** Envelope camera */
                    camera?: (mtws.tower.v1.Camera.$Properties|null);

                    /** Envelope move */
                    move?: (mtws.tower.v1.Move.$Properties|null);

                    /** Envelope reset */
                    reset?: (mtws.tower.v1.Reset.$Properties|null);

                    /** Envelope result */
                    result?: (mtws.tower.v1.Result.$Properties|null);

                    /** Envelope status */
                    status?: (mtws.tower.v1.Status.$Properties|null);

                    /** Envelope heartbeat */
                    heartbeat?: (mtws.tower.v1.Heartbeat.$Properties|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an Envelope. */
                type $Shape = mtws.tower.v1.Envelope.$Properties;
            }

            /**
             * Properties of a Motion.
             * @deprecated Use mtws.tower.v1.Motion.$Properties instead.
             */
            interface IMotion extends mtws.tower.v1.Motion.$Properties {
            }

            /** Represents a Motion. */
            class Motion {

                /**
                 * Constructs a new Motion.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Motion.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Motion simobjectid. */
                simobjectid: number;

                /** Motion latitude. */
                latitude: number;

                /** Motion longitude. */
                longitude: number;

                /** Motion altitude. */
                altitude: number;

                /** Motion heading. */
                heading: number;

                /** Motion groundspeed. */
                groundspeed?: (number|null);

                /** Motion vertical_speed. */
                vertical_speed?: (number|null);

                /** Motion on_ground. */
                on_ground?: (number|null);

                /** Motion revision. */
                revision: number;

                /**
                 * Creates a new Motion instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Motion instance
                 */
                static create(properties: mtws.tower.v1.Motion.$Shape): mtws.tower.v1.Motion & mtws.tower.v1.Motion.$Shape;
                static create(properties?: mtws.tower.v1.Motion.$Properties): mtws.tower.v1.Motion;

                /**
                 * Encodes the specified Motion message. Does not implicitly {@link mtws.tower.v1.Motion.verify|verify} messages.
                 * @param message Motion message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Motion.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Motion message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Motion & mtws.tower.v1.Motion.$Shape} Motion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Motion & mtws.tower.v1.Motion.$Shape;

                /**
                 * Verifies a Motion message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Motion message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Motion
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Motion;

                /**
                 * Creates a plain object from a Motion message. Also converts values to other types if specified.
                 * @param message Motion
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Motion, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Motion to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Motion {

                /** Properties of a Motion. */
                interface $Properties {

                    /** Motion simobjectid */
                    simobjectid: number;

                    /** Motion latitude */
                    latitude: number;

                    /** Motion longitude */
                    longitude: number;

                    /** Motion altitude */
                    altitude: number;

                    /** Motion heading */
                    heading: number;

                    /** Motion groundspeed */
                    groundspeed?: (number|null);

                    /** Motion vertical_speed */
                    vertical_speed?: (number|null);

                    /** Motion on_ground */
                    on_ground?: (number|null);

                    /** Motion revision */
                    revision: number;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Motion. */
                type $Shape = mtws.tower.v1.Motion.$Properties;
            }

            /**
             * Properties of a Camera.
             * @deprecated Use mtws.tower.v1.Camera.$Properties instead.
             */
            interface ICamera extends mtws.tower.v1.Camera.$Properties {
            }

            /** Represents a Camera. */
            class Camera {

                /**
                 * Constructs a new Camera.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Camera.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Camera gameplay_pitch_yaw_0. */
                gameplay_pitch_yaw_0?: (number|null);

                /** Camera gameplay_pitch_yaw_1. */
                gameplay_pitch_yaw_1?: (number|null);

                /** Camera cockpit_camera_zoom. */
                cockpit_camera_zoom?: (number|null);

                /** Camera aircraft_latitude. */
                aircraft_latitude?: (number|null);

                /** Camera aircraft_longitude. */
                aircraft_longitude?: (number|null);

                /** Camera aircraft_altitude. */
                aircraft_altitude?: (number|null);

                /** Camera aircraft_heading. */
                aircraft_heading?: (number|null);

                /** Camera aircraft_pitch. */
                aircraft_pitch?: (number|null);

                /** Camera aircraft_bank. */
                aircraft_bank?: (number|null);

                /** Camera camera_state. */
                camera_state?: (number|null);

                /** Camera camera_view_type_and_index_0. */
                camera_view_type_and_index_0?: (number|null);

                /** Camera camera_view_type_and_index_1. */
                camera_view_type_and_index_1?: (number|null);

                /** Camera revision. */
                revision: number;

                /**
                 * Creates a new Camera instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Camera instance
                 */
                static create(properties: mtws.tower.v1.Camera.$Shape): mtws.tower.v1.Camera & mtws.tower.v1.Camera.$Shape;
                static create(properties?: mtws.tower.v1.Camera.$Properties): mtws.tower.v1.Camera;

                /**
                 * Encodes the specified Camera message. Does not implicitly {@link mtws.tower.v1.Camera.verify|verify} messages.
                 * @param message Camera message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Camera.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Camera message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Camera & mtws.tower.v1.Camera.$Shape} Camera
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Camera & mtws.tower.v1.Camera.$Shape;

                /**
                 * Verifies a Camera message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Camera message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Camera
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Camera;

                /**
                 * Creates a plain object from a Camera message. Also converts values to other types if specified.
                 * @param message Camera
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Camera, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Camera to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Camera {

                /** Properties of a Camera. */
                interface $Properties {

                    /** Camera gameplay_pitch_yaw_0 */
                    gameplay_pitch_yaw_0?: (number|null);

                    /** Camera gameplay_pitch_yaw_1 */
                    gameplay_pitch_yaw_1?: (number|null);

                    /** Camera cockpit_camera_zoom */
                    cockpit_camera_zoom?: (number|null);

                    /** Camera aircraft_latitude */
                    aircraft_latitude?: (number|null);

                    /** Camera aircraft_longitude */
                    aircraft_longitude?: (number|null);

                    /** Camera aircraft_altitude */
                    aircraft_altitude?: (number|null);

                    /** Camera aircraft_heading */
                    aircraft_heading?: (number|null);

                    /** Camera aircraft_pitch */
                    aircraft_pitch?: (number|null);

                    /** Camera aircraft_bank */
                    aircraft_bank?: (number|null);

                    /** Camera camera_state */
                    camera_state?: (number|null);

                    /** Camera camera_view_type_and_index_0 */
                    camera_view_type_and_index_0?: (number|null);

                    /** Camera camera_view_type_and_index_1 */
                    camera_view_type_and_index_1?: (number|null);

                    /** Camera revision */
                    revision: number;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Camera. */
                type $Shape = mtws.tower.v1.Camera.$Properties;
            }

            /**
             * Properties of an AircraftMetadata.
             * @deprecated Use mtws.tower.v1.AircraftMetadata.$Properties instead.
             */
            interface IAircraftMetadata extends mtws.tower.v1.AircraftMetadata.$Properties {
            }

            /** Represents an AircraftMetadata. */
            class AircraftMetadata {

                /**
                 * Constructs a new AircraftMetadata.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.AircraftMetadata.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** AircraftMetadata simobjectid. */
                simobjectid: number;

                /** AircraftMetadata callsign. */
                callsign: string;

                /** AircraftMetadata type. */
                type?: (string|null);

                /** AircraftMetadata dep. */
                dep?: (string|null);

                /** AircraftMetadata arr. */
                arr?: (string|null);

                /** AircraftMetadata transponder. */
                transponder?: (string|null);

                /** AircraftMetadata transponder_asgn. */
                transponder_asgn?: (string|null);

                /** AircraftMetadata deptime. */
                deptime?: (string|null);

                /** AircraftMetadata dep_rwy. */
                dep_rwy?: (string|null);

                /** AircraftMetadata dep_sid. */
                dep_sid?: (string|null);

                /** AircraftMetadata gate. */
                gate?: (string|null);

                /** AircraftMetadata scratchpad. */
                scratchpad?: (string|null);

                /** AircraftMetadata arr_rwy. */
                arr_rwy?: (string|null);

                /** AircraftMetadata arr_star. */
                arr_star?: (string|null);

                /** AircraftMetadata registration. */
                registration?: (string|null);

                /** AircraftMetadata tobt. */
                tobt?: (string|null);

                /** AircraftMetadata flightplan. */
                flightplan?: (string|null);

                /** AircraftMetadata transceivers. */
                transceivers: mtws.tower.v1.Transceiver.$Properties[];

                /**
                 * Creates a new AircraftMetadata instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns AircraftMetadata instance
                 */
                static create(properties: mtws.tower.v1.AircraftMetadata.$Shape): mtws.tower.v1.AircraftMetadata & mtws.tower.v1.AircraftMetadata.$Shape;
                static create(properties?: mtws.tower.v1.AircraftMetadata.$Properties): mtws.tower.v1.AircraftMetadata;

                /**
                 * Encodes the specified AircraftMetadata message. Does not implicitly {@link mtws.tower.v1.AircraftMetadata.verify|verify} messages.
                 * @param message AircraftMetadata message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.AircraftMetadata.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an AircraftMetadata message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.AircraftMetadata & mtws.tower.v1.AircraftMetadata.$Shape} AircraftMetadata
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.AircraftMetadata & mtws.tower.v1.AircraftMetadata.$Shape;

                /**
                 * Verifies an AircraftMetadata message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an AircraftMetadata message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns AircraftMetadata
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.AircraftMetadata;

                /**
                 * Creates a plain object from an AircraftMetadata message. Also converts values to other types if specified.
                 * @param message AircraftMetadata
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.AircraftMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this AircraftMetadata to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace AircraftMetadata {

                /** Properties of an AircraftMetadata. */
                interface $Properties {

                    /** AircraftMetadata simobjectid */
                    simobjectid: number;

                    /** AircraftMetadata callsign */
                    callsign: string;

                    /** AircraftMetadata type */
                    type?: (string|null);

                    /** AircraftMetadata dep */
                    dep?: (string|null);

                    /** AircraftMetadata arr */
                    arr?: (string|null);

                    /** AircraftMetadata transponder */
                    transponder?: (string|null);

                    /** AircraftMetadata transponder_asgn */
                    transponder_asgn?: (string|null);

                    /** AircraftMetadata deptime */
                    deptime?: (string|null);

                    /** AircraftMetadata dep_rwy */
                    dep_rwy?: (string|null);

                    /** AircraftMetadata dep_sid */
                    dep_sid?: (string|null);

                    /** AircraftMetadata gate */
                    gate?: (string|null);

                    /** AircraftMetadata scratchpad */
                    scratchpad?: (string|null);

                    /** AircraftMetadata arr_rwy */
                    arr_rwy?: (string|null);

                    /** AircraftMetadata arr_star */
                    arr_star?: (string|null);

                    /** AircraftMetadata registration */
                    registration?: (string|null);

                    /** AircraftMetadata tobt */
                    tobt?: (string|null);

                    /** AircraftMetadata flightplan */
                    flightplan?: (string|null);

                    /** AircraftMetadata transceivers */
                    transceivers?: (mtws.tower.v1.Transceiver.$Properties[]|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of an AircraftMetadata. */
                type $Shape = mtws.tower.v1.AircraftMetadata.$Properties;
            }

            /**
             * Properties of a Transceiver.
             * @deprecated Use mtws.tower.v1.Transceiver.$Properties instead.
             */
            interface ITransceiver extends mtws.tower.v1.Transceiver.$Properties {
            }

            /** Represents a Transceiver. */
            class Transceiver {

                /**
                 * Constructs a new Transceiver.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Transceiver.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Transceiver id. */
                id: number;

                /** Transceiver frequency. */
                frequency: number;

                /** Transceiver lat_deg. */
                lat_deg: number;

                /** Transceiver lon_deg. */
                lon_deg: number;

                /** Transceiver height_msl_m. */
                height_msl_m: number;

                /** Transceiver height_agl_m. */
                height_agl_m: number;

                /**
                 * Creates a new Transceiver instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Transceiver instance
                 */
                static create(properties: mtws.tower.v1.Transceiver.$Shape): mtws.tower.v1.Transceiver & mtws.tower.v1.Transceiver.$Shape;
                static create(properties?: mtws.tower.v1.Transceiver.$Properties): mtws.tower.v1.Transceiver;

                /**
                 * Encodes the specified Transceiver message. Does not implicitly {@link mtws.tower.v1.Transceiver.verify|verify} messages.
                 * @param message Transceiver message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Transceiver.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Transceiver message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Transceiver & mtws.tower.v1.Transceiver.$Shape} Transceiver
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Transceiver & mtws.tower.v1.Transceiver.$Shape;

                /**
                 * Verifies a Transceiver message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Transceiver message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Transceiver
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Transceiver;

                /**
                 * Creates a plain object from a Transceiver message. Also converts values to other types if specified.
                 * @param message Transceiver
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Transceiver, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Transceiver to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Transceiver {

                /** Properties of a Transceiver. */
                interface $Properties {

                    /** Transceiver id */
                    id: number;

                    /** Transceiver frequency */
                    frequency: number;

                    /** Transceiver lat_deg */
                    lat_deg: number;

                    /** Transceiver lon_deg */
                    lon_deg: number;

                    /** Transceiver height_msl_m */
                    height_msl_m: number;

                    /** Transceiver height_agl_m */
                    height_agl_m: number;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Transceiver. */
                type $Shape = mtws.tower.v1.Transceiver.$Properties;
            }

            /**
             * Properties of a Snapshot.
             * @deprecated Use mtws.tower.v1.Snapshot.$Properties instead.
             */
            interface ISnapshot extends mtws.tower.v1.Snapshot.$Properties {
            }

            /** Represents a Snapshot. */
            class Snapshot {

                /**
                 * Constructs a new Snapshot.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Snapshot.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Snapshot aircraft. */
                aircraft: mtws.tower.v1.AircraftMetadata.$Properties[];

                /** Snapshot motion. */
                motion: mtws.tower.v1.Motion.$Properties[];

                /** Snapshot camera. */
                camera?: (mtws.tower.v1.Camera.$Properties|null);

                /** Snapshot simconnect_connected. */
                simconnect_connected: boolean;

                /**
                 * Creates a new Snapshot instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Snapshot instance
                 */
                static create(properties: mtws.tower.v1.Snapshot.$Shape): mtws.tower.v1.Snapshot & mtws.tower.v1.Snapshot.$Shape;
                static create(properties?: mtws.tower.v1.Snapshot.$Properties): mtws.tower.v1.Snapshot;

                /**
                 * Encodes the specified Snapshot message. Does not implicitly {@link mtws.tower.v1.Snapshot.verify|verify} messages.
                 * @param message Snapshot message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Snapshot.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Snapshot message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Snapshot & mtws.tower.v1.Snapshot.$Shape} Snapshot
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Snapshot & mtws.tower.v1.Snapshot.$Shape;

                /**
                 * Verifies a Snapshot message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Snapshot message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Snapshot
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Snapshot;

                /**
                 * Creates a plain object from a Snapshot message. Also converts values to other types if specified.
                 * @param message Snapshot
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Snapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Snapshot to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Snapshot {

                /** Properties of a Snapshot. */
                interface $Properties {

                    /** Snapshot aircraft */
                    aircraft?: (mtws.tower.v1.AircraftMetadata.$Properties[]|null);

                    /** Snapshot motion */
                    motion?: (mtws.tower.v1.Motion.$Properties[]|null);

                    /** Snapshot camera */
                    camera?: (mtws.tower.v1.Camera.$Properties|null);

                    /** Snapshot simconnect_connected */
                    simconnect_connected: boolean;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Snapshot. */
                type $Shape = mtws.tower.v1.Snapshot.$Properties;
            }

            /**
             * Properties of a Move.
             * @deprecated Use mtws.tower.v1.Move.$Properties instead.
             */
            interface IMove extends mtws.tower.v1.Move.$Properties {
            }

            /** Represents a Move. */
            class Move {

                /**
                 * Constructs a new Move.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Move.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Move lat. */
                lat: number;

                /** Move lon. */
                lon: number;

                /** Move alt. */
                alt: number;

                /** Move heading. */
                heading: number;

                /** Move pitch. */
                pitch: number;

                /** Move bank. */
                bank: number;

                /** Move cockpit_camera_zoom. */
                cockpit_camera_zoom: number;

                /**
                 * Creates a new Move instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Move instance
                 */
                static create(properties: mtws.tower.v1.Move.$Shape): mtws.tower.v1.Move & mtws.tower.v1.Move.$Shape;
                static create(properties?: mtws.tower.v1.Move.$Properties): mtws.tower.v1.Move;

                /**
                 * Encodes the specified Move message. Does not implicitly {@link mtws.tower.v1.Move.verify|verify} messages.
                 * @param message Move message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Move.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Move message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Move & mtws.tower.v1.Move.$Shape} Move
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Move & mtws.tower.v1.Move.$Shape;

                /**
                 * Verifies a Move message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Move message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Move
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Move;

                /**
                 * Creates a plain object from a Move message. Also converts values to other types if specified.
                 * @param message Move
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Move, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Move to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Move {

                /** Properties of a Move. */
                interface $Properties {

                    /** Move lat */
                    lat: number;

                    /** Move lon */
                    lon: number;

                    /** Move alt */
                    alt: number;

                    /** Move heading */
                    heading: number;

                    /** Move pitch */
                    pitch: number;

                    /** Move bank */
                    bank: number;

                    /** Move cockpit_camera_zoom */
                    cockpit_camera_zoom: number;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Move. */
                type $Shape = mtws.tower.v1.Move.$Properties;
            }

            /**
             * Properties of a Reset.
             * @deprecated Use mtws.tower.v1.Reset.$Properties instead.
             */
            interface IReset extends mtws.tower.v1.Reset.$Properties {
            }

            /** Represents a Reset. */
            class Reset {

                /**
                 * Constructs a new Reset.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Reset.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Reset reset. */
                reset: number;

                /**
                 * Creates a new Reset instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Reset instance
                 */
                static create(properties: mtws.tower.v1.Reset.$Shape): mtws.tower.v1.Reset & mtws.tower.v1.Reset.$Shape;
                static create(properties?: mtws.tower.v1.Reset.$Properties): mtws.tower.v1.Reset;

                /**
                 * Encodes the specified Reset message. Does not implicitly {@link mtws.tower.v1.Reset.verify|verify} messages.
                 * @param message Reset message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Reset.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Reset message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Reset & mtws.tower.v1.Reset.$Shape} Reset
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Reset & mtws.tower.v1.Reset.$Shape;

                /**
                 * Verifies a Reset message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Reset message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Reset
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Reset;

                /**
                 * Creates a plain object from a Reset message. Also converts values to other types if specified.
                 * @param message Reset
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Reset, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Reset to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Reset {

                /** Properties of a Reset. */
                interface $Properties {

                    /** Reset reset */
                    reset: number;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Reset. */
                type $Shape = mtws.tower.v1.Reset.$Properties;
            }

            /**
             * Properties of a Result.
             * @deprecated Use mtws.tower.v1.Result.$Properties instead.
             */
            interface IResult extends mtws.tower.v1.Result.$Properties {
            }

            /** Represents a Result. */
            class Result {

                /**
                 * Constructs a new Result.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Result.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Result accepted. */
                accepted: boolean;

                /** Result error. */
                error?: (string|null);

                /**
                 * Creates a new Result instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Result instance
                 */
                static create(properties: mtws.tower.v1.Result.$Shape): mtws.tower.v1.Result & mtws.tower.v1.Result.$Shape;
                static create(properties?: mtws.tower.v1.Result.$Properties): mtws.tower.v1.Result;

                /**
                 * Encodes the specified Result message. Does not implicitly {@link mtws.tower.v1.Result.verify|verify} messages.
                 * @param message Result message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Result.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Result message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Result & mtws.tower.v1.Result.$Shape} Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Result & mtws.tower.v1.Result.$Shape;

                /**
                 * Verifies a Result message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Result message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Result
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Result;

                /**
                 * Creates a plain object from a Result message. Also converts values to other types if specified.
                 * @param message Result
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Result, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Result to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Result {

                /** Properties of a Result. */
                interface $Properties {

                    /** Result accepted */
                    accepted: boolean;

                    /** Result error */
                    error?: (string|null);

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Result. */
                type $Shape = mtws.tower.v1.Result.$Properties;
            }

            /**
             * Properties of a Status.
             * @deprecated Use mtws.tower.v1.Status.$Properties instead.
             */
            interface IStatus extends mtws.tower.v1.Status.$Properties {
            }

            /** Represents a Status. */
            class Status {

                /**
                 * Constructs a new Status.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Status.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Status simconnect_connected. */
                simconnect_connected: boolean;

                /**
                 * Creates a new Status instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Status instance
                 */
                static create(properties: mtws.tower.v1.Status.$Shape): mtws.tower.v1.Status & mtws.tower.v1.Status.$Shape;
                static create(properties?: mtws.tower.v1.Status.$Properties): mtws.tower.v1.Status;

                /**
                 * Encodes the specified Status message. Does not implicitly {@link mtws.tower.v1.Status.verify|verify} messages.
                 * @param message Status message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Status.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Status message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Status & mtws.tower.v1.Status.$Shape} Status
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Status & mtws.tower.v1.Status.$Shape;

                /**
                 * Verifies a Status message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Status message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Status
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Status;

                /**
                 * Creates a plain object from a Status message. Also converts values to other types if specified.
                 * @param message Status
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Status, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Status to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Status {

                /** Properties of a Status. */
                interface $Properties {

                    /** Status simconnect_connected */
                    simconnect_connected: boolean;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Status. */
                type $Shape = mtws.tower.v1.Status.$Properties;
            }

            /**
             * Properties of a Heartbeat.
             * @deprecated Use mtws.tower.v1.Heartbeat.$Properties instead.
             */
            interface IHeartbeat extends mtws.tower.v1.Heartbeat.$Properties {
            }

            /** Represents a Heartbeat. */
            class Heartbeat {

                /**
                 * Constructs a new Heartbeat.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: mtws.tower.v1.Heartbeat.$Properties);

                /** Unknown fields preserved while decoding when enabled */
                $unknowns?: Uint8Array[];

                /** Heartbeat reply. */
                reply: boolean;

                /**
                 * Creates a new Heartbeat instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Heartbeat instance
                 */
                static create(properties: mtws.tower.v1.Heartbeat.$Shape): mtws.tower.v1.Heartbeat & mtws.tower.v1.Heartbeat.$Shape;
                static create(properties?: mtws.tower.v1.Heartbeat.$Properties): mtws.tower.v1.Heartbeat;

                /**
                 * Encodes the specified Heartbeat message. Does not implicitly {@link mtws.tower.v1.Heartbeat.verify|verify} messages.
                 * @param message Heartbeat message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                static encode(message: mtws.tower.v1.Heartbeat.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Heartbeat message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Heartbeat & mtws.tower.v1.Heartbeat.$Shape} Heartbeat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mtws.tower.v1.Heartbeat & mtws.tower.v1.Heartbeat.$Shape;

                /**
                 * Verifies a Heartbeat message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Heartbeat message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Heartbeat
                 */
                static fromObject(object: { [k: string]: any }): mtws.tower.v1.Heartbeat;

                /**
                 * Creates a plain object from a Heartbeat message. Also converts values to other types if specified.
                 * @param message Heartbeat
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                static toObject(message: mtws.tower.v1.Heartbeat, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Heartbeat to JSON.
                 * @returns JSON object
                 */
                toJSON(): { [k: string]: any };
            }

            namespace Heartbeat {

                /** Properties of a Heartbeat. */
                interface $Properties {

                    /** Heartbeat reply */
                    reply: boolean;

                    /** Unknown fields preserved while decoding when enabled */
                    $unknowns?: Uint8Array[];
                }

                /** Shape of a Heartbeat. */
                type $Shape = mtws.tower.v1.Heartbeat.$Properties;
            }
        }
    }
}
