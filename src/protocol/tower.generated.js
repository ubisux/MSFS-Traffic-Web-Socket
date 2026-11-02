/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $TypeError = $util.global.TypeError, $Number = $util.global.Number, $isFinite = $util.global.isFinite, $String = $util.global.String, $Array = $util.global.Array, $Boolean = $util.global.Boolean;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const mtws = $root.mtws = (() => {

    /**
     * Namespace mtws.
     * @exports mtws
     * @namespace
     */
    const mtws = {};

    mtws.tower = (function() {

        /**
         * Namespace tower.
         * @memberof mtws
         * @namespace
         */
        const tower = {};

        tower.v1 = (function() {

            /**
             * Namespace v1.
             * @memberof mtws.tower
             * @namespace
             */
            const v1 = {};

            v1.Envelope = (function() {

                /**
                 * Properties of an Envelope.
                 * @typedef {Object} mtws.tower.v1.Envelope.$Properties
                 * @property {number} version Envelope version
                 * @property {number} sequence Envelope sequence
                 * @property {number|null} [sample_time_ms] Envelope sample_time_ms
                 * @property {mtws.tower.v1.Snapshot.$Properties|null} [snapshot] Envelope snapshot
                 * @property {mtws.tower.v1.Motion.$Properties|null} [motion] Envelope motion
                 * @property {mtws.tower.v1.Camera.$Properties|null} [camera] Envelope camera
                 * @property {mtws.tower.v1.Move.$Properties|null} [move] Envelope move
                 * @property {mtws.tower.v1.Reset.$Properties|null} [reset] Envelope reset
                 * @property {mtws.tower.v1.Result.$Properties|null} [result] Envelope result
                 * @property {mtws.tower.v1.Status.$Properties|null} [status] Envelope status
                 * @property {mtws.tower.v1.Heartbeat.$Properties|null} [heartbeat] Envelope heartbeat
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an Envelope.
                 * @memberof mtws.tower.v1
                 * @interface IEnvelope
                 * @augments mtws.tower.v1.Envelope.$Properties
                 * @deprecated Use mtws.tower.v1.Envelope.$Properties instead.
                 */

                /**
                 * Shape of an Envelope.
                 * @typedef {mtws.tower.v1.Envelope.$Properties} mtws.tower.v1.Envelope.$Shape
                 */

                /**
                 * Constructs a new Envelope.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents an Envelope.
                 * @constructor
                 * @param {mtws.tower.v1.Envelope.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Envelope = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Envelope version.
                 * @member {number} version
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.version = 0;

                /**
                 * Envelope sequence.
                 * @member {number} sequence
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.sequence = 0;

                /**
                 * Envelope sample_time_ms.
                 * @member {number|null|undefined} sample_time_ms
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.sample_time_ms = null;

                /**
                 * Envelope snapshot.
                 * @member {mtws.tower.v1.Snapshot.$Properties|null|undefined} snapshot
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.snapshot = null;

                /**
                 * Envelope motion.
                 * @member {mtws.tower.v1.Motion.$Properties|null|undefined} motion
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.motion = null;

                /**
                 * Envelope camera.
                 * @member {mtws.tower.v1.Camera.$Properties|null|undefined} camera
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.camera = null;

                /**
                 * Envelope move.
                 * @member {mtws.tower.v1.Move.$Properties|null|undefined} move
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.move = null;

                /**
                 * Envelope reset.
                 * @member {mtws.tower.v1.Reset.$Properties|null|undefined} reset
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.reset = null;

                /**
                 * Envelope result.
                 * @member {mtws.tower.v1.Result.$Properties|null|undefined} result
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.result = null;

                /**
                 * Envelope status.
                 * @member {mtws.tower.v1.Status.$Properties|null|undefined} status
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.status = null;

                /**
                 * Envelope heartbeat.
                 * @member {mtws.tower.v1.Heartbeat.$Properties|null|undefined} heartbeat
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 */
                Envelope.prototype.heartbeat = null;

                /**
                 * Creates a new Envelope instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {mtws.tower.v1.Envelope.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Envelope} Envelope instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Envelope.$Shape): mtws.tower.v1.Envelope & mtws.tower.v1.Envelope.$Shape;
                 *   (properties?: mtws.tower.v1.Envelope.$Properties): mtws.tower.v1.Envelope;
                 * }}
                 */
                Envelope.create = function(properties) {
                    return new Envelope(properties);
                };

                /**
                 * Encodes the specified Envelope message. Does not implicitly {@link mtws.tower.v1.Envelope.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {mtws.tower.v1.Envelope.$Properties} message Envelope message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Envelope.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.version);
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.sequence);
                    if (message.sample_time_ms != null && $Object.hasOwnProperty.call(message, "sample_time_ms"))
                        writer.uint32(/* id 3, wireType 1 =*/25).double(message.sample_time_ms);
                    if (message.snapshot != null && $Object.hasOwnProperty.call(message, "snapshot"))
                        $root.mtws.tower.v1.Snapshot.encode(message.snapshot, writer.uint32(/* id 10, wireType 2 =*/82).fork(), _depth + 1).ldelim();
                    if (message.motion != null && $Object.hasOwnProperty.call(message, "motion"))
                        $root.mtws.tower.v1.Motion.encode(message.motion, writer.uint32(/* id 11, wireType 2 =*/90).fork(), _depth + 1).ldelim();
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera"))
                        $root.mtws.tower.v1.Camera.encode(message.camera, writer.uint32(/* id 12, wireType 2 =*/98).fork(), _depth + 1).ldelim();
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move"))
                        $root.mtws.tower.v1.Move.encode(message.move, writer.uint32(/* id 13, wireType 2 =*/106).fork(), _depth + 1).ldelim();
                    if (message.reset != null && $Object.hasOwnProperty.call(message, "reset"))
                        $root.mtws.tower.v1.Reset.encode(message.reset, writer.uint32(/* id 14, wireType 2 =*/114).fork(), _depth + 1).ldelim();
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                        $root.mtws.tower.v1.Result.encode(message.result, writer.uint32(/* id 15, wireType 2 =*/122).fork(), _depth + 1).ldelim();
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                        $root.mtws.tower.v1.Status.encode(message.status, writer.uint32(/* id 16, wireType 2 =*/130).fork(), _depth + 1).ldelim();
                    if (message.heartbeat != null && $Object.hasOwnProperty.call(message, "heartbeat"))
                        $root.mtws.tower.v1.Heartbeat.encode(message.heartbeat, writer.uint32(/* id 17, wireType 2 =*/138).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes an Envelope message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Envelope & mtws.tower.v1.Envelope.$Shape} Envelope
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Envelope.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Envelope();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.version = reader.uint32();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.sequence = reader.double();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.sample_time_ms = reader.double();
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.snapshot = $root.mtws.tower.v1.Snapshot.decode(reader, reader.size(), $undefined, _depth + 1, message.snapshot);
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.motion = $root.mtws.tower.v1.Motion.decode(reader, reader.size(), $undefined, _depth + 1, message.motion);
                                continue;
                            }
                        case 12: {
                                if (wireType !== 2)
                                    break;
                                message.camera = $root.mtws.tower.v1.Camera.decode(reader, reader.size(), $undefined, _depth + 1, message.camera);
                                continue;
                            }
                        case 13: {
                                if (wireType !== 2)
                                    break;
                                message.move = $root.mtws.tower.v1.Move.decode(reader, reader.size(), $undefined, _depth + 1, message.move);
                                continue;
                            }
                        case 14: {
                                if (wireType !== 2)
                                    break;
                                message.reset = $root.mtws.tower.v1.Reset.decode(reader, reader.size(), $undefined, _depth + 1, message.reset);
                                continue;
                            }
                        case 15: {
                                if (wireType !== 2)
                                    break;
                                message.result = $root.mtws.tower.v1.Result.decode(reader, reader.size(), $undefined, _depth + 1, message.result);
                                continue;
                            }
                        case 16: {
                                if (wireType !== 2)
                                    break;
                                message.status = $root.mtws.tower.v1.Status.decode(reader, reader.size(), $undefined, _depth + 1, message.status);
                                continue;
                            }
                        case 17: {
                                if (wireType !== 2)
                                    break;
                                message.heartbeat = $root.mtws.tower.v1.Heartbeat.decode(reader, reader.size(), $undefined, _depth + 1, message.heartbeat);
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "version"))
                        throw $util.ProtocolError("missing required 'version'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "sequence"))
                        throw $util.ProtocolError("missing required 'sequence'", { instance: message });
                    return message;
                };

                /**
                 * Verifies an Envelope message.
                 * @function verify
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Envelope.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                    if (typeof message.sequence !== "number")
                        return "sequence: number expected";
                    if (message.sample_time_ms != null && $Object.hasOwnProperty.call(message, "sample_time_ms"))
                        if (typeof message.sample_time_ms !== "number")
                            return "sample_time_ms: number expected";
                    if (message.snapshot != null && $Object.hasOwnProperty.call(message, "snapshot")) {
                        let error = $root.mtws.tower.v1.Snapshot.verify(message.snapshot, _depth + 1);
                        if (error)
                            return "snapshot." + error;
                    }
                    if (message.motion != null && $Object.hasOwnProperty.call(message, "motion")) {
                        let error = $root.mtws.tower.v1.Motion.verify(message.motion, _depth + 1);
                        if (error)
                            return "motion." + error;
                    }
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera")) {
                        let error = $root.mtws.tower.v1.Camera.verify(message.camera, _depth + 1);
                        if (error)
                            return "camera." + error;
                    }
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move")) {
                        let error = $root.mtws.tower.v1.Move.verify(message.move, _depth + 1);
                        if (error)
                            return "move." + error;
                    }
                    if (message.reset != null && $Object.hasOwnProperty.call(message, "reset")) {
                        let error = $root.mtws.tower.v1.Reset.verify(message.reset, _depth + 1);
                        if (error)
                            return "reset." + error;
                    }
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result")) {
                        let error = $root.mtws.tower.v1.Result.verify(message.result, _depth + 1);
                        if (error)
                            return "result." + error;
                    }
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status")) {
                        let error = $root.mtws.tower.v1.Status.verify(message.status, _depth + 1);
                        if (error)
                            return "status." + error;
                    }
                    if (message.heartbeat != null && $Object.hasOwnProperty.call(message, "heartbeat")) {
                        let error = $root.mtws.tower.v1.Heartbeat.verify(message.heartbeat, _depth + 1);
                        if (error)
                            return "heartbeat." + error;
                    }
                    return null;
                };

                /**
                 * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Envelope} Envelope
                 */
                Envelope.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Envelope)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Envelope: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Envelope();
                    if (object.version != null)
                        message.version = object.version >>> 0;
                    if (object.sequence != null)
                        message.sequence = $Number(object.sequence);
                    if (object.sample_time_ms != null)
                        message.sample_time_ms = $Number(object.sample_time_ms);
                    if (object.snapshot != null) {
                        if (!$util.isObject(object.snapshot))
                            throw $TypeError(".mtws.tower.v1.Envelope.snapshot: object expected");
                        message.snapshot = $root.mtws.tower.v1.Snapshot.fromObject(object.snapshot, _depth + 1);
                    }
                    if (object.motion != null) {
                        if (!$util.isObject(object.motion))
                            throw $TypeError(".mtws.tower.v1.Envelope.motion: object expected");
                        message.motion = $root.mtws.tower.v1.Motion.fromObject(object.motion, _depth + 1);
                    }
                    if (object.camera != null) {
                        if (!$util.isObject(object.camera))
                            throw $TypeError(".mtws.tower.v1.Envelope.camera: object expected");
                        message.camera = $root.mtws.tower.v1.Camera.fromObject(object.camera, _depth + 1);
                    }
                    if (object.move != null) {
                        if (!$util.isObject(object.move))
                            throw $TypeError(".mtws.tower.v1.Envelope.move: object expected");
                        message.move = $root.mtws.tower.v1.Move.fromObject(object.move, _depth + 1);
                    }
                    if (object.reset != null) {
                        if (!$util.isObject(object.reset))
                            throw $TypeError(".mtws.tower.v1.Envelope.reset: object expected");
                        message.reset = $root.mtws.tower.v1.Reset.fromObject(object.reset, _depth + 1);
                    }
                    if (object.result != null) {
                        if (!$util.isObject(object.result))
                            throw $TypeError(".mtws.tower.v1.Envelope.result: object expected");
                        message.result = $root.mtws.tower.v1.Result.fromObject(object.result, _depth + 1);
                    }
                    if (object.status != null) {
                        if (!$util.isObject(object.status))
                            throw $TypeError(".mtws.tower.v1.Envelope.status: object expected");
                        message.status = $root.mtws.tower.v1.Status.fromObject(object.status, _depth + 1);
                    }
                    if (object.heartbeat != null) {
                        if (!$util.isObject(object.heartbeat))
                            throw $TypeError(".mtws.tower.v1.Envelope.heartbeat: object expected");
                        message.heartbeat = $root.mtws.tower.v1.Heartbeat.fromObject(object.heartbeat, _depth + 1);
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an Envelope message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Envelope
                 * @static
                 * @param {mtws.tower.v1.Envelope} message Envelope
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Envelope.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.version = 0;
                        object.sequence = 0;
                        object.sample_time_ms = 0;
                        object.snapshot = null;
                        object.motion = null;
                        object.camera = null;
                        object.move = null;
                        object.reset = null;
                        object.result = null;
                        object.status = null;
                        object.heartbeat = null;
                    }
                    if (message.version != null && $Object.hasOwnProperty.call(message, "version"))
                        object.version = message.version;
                    if (message.sequence != null && $Object.hasOwnProperty.call(message, "sequence"))
                        object.sequence = options.json && !$isFinite(message.sequence) ? $String(message.sequence) : message.sequence;
                    if (message.sample_time_ms != null && $Object.hasOwnProperty.call(message, "sample_time_ms"))
                        object.sample_time_ms = options.json && !$isFinite(message.sample_time_ms) ? $String(message.sample_time_ms) : message.sample_time_ms;
                    if (message.snapshot != null && $Object.hasOwnProperty.call(message, "snapshot"))
                        object.snapshot = $root.mtws.tower.v1.Snapshot.toObject(message.snapshot, options, _depth + 1);
                    if (message.motion != null && $Object.hasOwnProperty.call(message, "motion"))
                        object.motion = $root.mtws.tower.v1.Motion.toObject(message.motion, options, _depth + 1);
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera"))
                        object.camera = $root.mtws.tower.v1.Camera.toObject(message.camera, options, _depth + 1);
                    if (message.move != null && $Object.hasOwnProperty.call(message, "move"))
                        object.move = $root.mtws.tower.v1.Move.toObject(message.move, options, _depth + 1);
                    if (message.reset != null && $Object.hasOwnProperty.call(message, "reset"))
                        object.reset = $root.mtws.tower.v1.Reset.toObject(message.reset, options, _depth + 1);
                    if (message.result != null && $Object.hasOwnProperty.call(message, "result"))
                        object.result = $root.mtws.tower.v1.Result.toObject(message.result, options, _depth + 1);
                    if (message.status != null && $Object.hasOwnProperty.call(message, "status"))
                        object.status = $root.mtws.tower.v1.Status.toObject(message.status, options, _depth + 1);
                    if (message.heartbeat != null && $Object.hasOwnProperty.call(message, "heartbeat"))
                        object.heartbeat = $root.mtws.tower.v1.Heartbeat.toObject(message.heartbeat, options, _depth + 1);
                    return object;
                };

                /**
                 * Converts this Envelope to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Envelope
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Envelope.prototype.toJSON = function() {
                    return Envelope.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Envelope;
            })();

            v1.Motion = (function() {

                /**
                 * Properties of a Motion.
                 * @typedef {Object} mtws.tower.v1.Motion.$Properties
                 * @property {number} simobjectid Motion simobjectid
                 * @property {number} latitude Motion latitude
                 * @property {number} longitude Motion longitude
                 * @property {number} altitude Motion altitude
                 * @property {number} heading Motion heading
                 * @property {number|null} [groundspeed] Motion groundspeed
                 * @property {number|null} [vertical_speed] Motion vertical_speed
                 * @property {number|null} [on_ground] Motion on_ground
                 * @property {number} revision Motion revision
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Motion.
                 * @memberof mtws.tower.v1
                 * @interface IMotion
                 * @augments mtws.tower.v1.Motion.$Properties
                 * @deprecated Use mtws.tower.v1.Motion.$Properties instead.
                 */

                /**
                 * Shape of a Motion.
                 * @typedef {mtws.tower.v1.Motion.$Properties} mtws.tower.v1.Motion.$Shape
                 */

                /**
                 * Constructs a new Motion.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Motion.
                 * @constructor
                 * @param {mtws.tower.v1.Motion.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Motion = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Motion simobjectid.
                 * @member {number} simobjectid
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.simobjectid = 0;

                /**
                 * Motion latitude.
                 * @member {number} latitude
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.latitude = 0;

                /**
                 * Motion longitude.
                 * @member {number} longitude
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.longitude = 0;

                /**
                 * Motion altitude.
                 * @member {number} altitude
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.altitude = 0;

                /**
                 * Motion heading.
                 * @member {number} heading
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.heading = 0;

                /**
                 * Motion groundspeed.
                 * @member {number|null|undefined} groundspeed
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.groundspeed = null;

                /**
                 * Motion vertical_speed.
                 * @member {number|null|undefined} vertical_speed
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.vertical_speed = null;

                /**
                 * Motion on_ground.
                 * @member {number|null|undefined} on_ground
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.on_ground = null;

                /**
                 * Motion revision.
                 * @member {number} revision
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 */
                Motion.prototype.revision = 0;

                /**
                 * Creates a new Motion instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {mtws.tower.v1.Motion.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Motion} Motion instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Motion.$Shape): mtws.tower.v1.Motion & mtws.tower.v1.Motion.$Shape;
                 *   (properties?: mtws.tower.v1.Motion.$Properties): mtws.tower.v1.Motion;
                 * }}
                 */
                Motion.create = function(properties) {
                    return new Motion(properties);
                };

                /**
                 * Encodes the specified Motion message. Does not implicitly {@link mtws.tower.v1.Motion.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {mtws.tower.v1.Motion.$Properties} message Motion message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Motion.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).sint32(message.simobjectid);
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.latitude);
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.longitude);
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.altitude);
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.heading);
                    if (message.groundspeed != null && $Object.hasOwnProperty.call(message, "groundspeed"))
                        writer.uint32(/* id 6, wireType 1 =*/49).double(message.groundspeed);
                    if (message.vertical_speed != null && $Object.hasOwnProperty.call(message, "vertical_speed"))
                        writer.uint32(/* id 7, wireType 1 =*/57).double(message.vertical_speed);
                    if (message.on_ground != null && $Object.hasOwnProperty.call(message, "on_ground"))
                        writer.uint32(/* id 8, wireType 0 =*/64).int32(message.on_ground);
                    writer.uint32(/* id 9, wireType 1 =*/73).double(message.revision);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Motion message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Motion & mtws.tower.v1.Motion.$Shape} Motion
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Motion.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Motion();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.simobjectid = reader.sint32();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.latitude = reader.double();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.longitude = reader.double();
                                continue;
                            }
                        case 4: {
                                if (wireType !== 1)
                                    break;
                                message.altitude = reader.double();
                                continue;
                            }
                        case 5: {
                                if (wireType !== 1)
                                    break;
                                message.heading = reader.double();
                                continue;
                            }
                        case 6: {
                                if (wireType !== 1)
                                    break;
                                message.groundspeed = reader.double();
                                continue;
                            }
                        case 7: {
                                if (wireType !== 1)
                                    break;
                                message.vertical_speed = reader.double();
                                continue;
                            }
                        case 8: {
                                if (wireType !== 0)
                                    break;
                                message.on_ground = reader.int32();
                                continue;
                            }
                        case 9: {
                                if (wireType !== 1)
                                    break;
                                message.revision = reader.double();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "simobjectid"))
                        throw $util.ProtocolError("missing required 'simobjectid'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "latitude"))
                        throw $util.ProtocolError("missing required 'latitude'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "longitude"))
                        throw $util.ProtocolError("missing required 'longitude'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "altitude"))
                        throw $util.ProtocolError("missing required 'altitude'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "heading"))
                        throw $util.ProtocolError("missing required 'heading'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "revision"))
                        throw $util.ProtocolError("missing required 'revision'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Motion message.
                 * @function verify
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Motion.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (!$util.isInteger(message.simobjectid))
                        return "simobjectid: integer expected";
                    if (typeof message.latitude !== "number")
                        return "latitude: number expected";
                    if (typeof message.longitude !== "number")
                        return "longitude: number expected";
                    if (typeof message.altitude !== "number")
                        return "altitude: number expected";
                    if (typeof message.heading !== "number")
                        return "heading: number expected";
                    if (message.groundspeed != null && $Object.hasOwnProperty.call(message, "groundspeed"))
                        if (typeof message.groundspeed !== "number")
                            return "groundspeed: number expected";
                    if (message.vertical_speed != null && $Object.hasOwnProperty.call(message, "vertical_speed"))
                        if (typeof message.vertical_speed !== "number")
                            return "vertical_speed: number expected";
                    if (message.on_ground != null && $Object.hasOwnProperty.call(message, "on_ground"))
                        if (!$util.isInteger(message.on_ground))
                            return "on_ground: integer expected";
                    if (typeof message.revision !== "number")
                        return "revision: number expected";
                    return null;
                };

                /**
                 * Creates a Motion message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Motion} Motion
                 */
                Motion.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Motion)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Motion: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Motion();
                    if (object.simobjectid != null)
                        message.simobjectid = object.simobjectid | 0;
                    if (object.latitude != null)
                        message.latitude = $Number(object.latitude);
                    if (object.longitude != null)
                        message.longitude = $Number(object.longitude);
                    if (object.altitude != null)
                        message.altitude = $Number(object.altitude);
                    if (object.heading != null)
                        message.heading = $Number(object.heading);
                    if (object.groundspeed != null)
                        message.groundspeed = $Number(object.groundspeed);
                    if (object.vertical_speed != null)
                        message.vertical_speed = $Number(object.vertical_speed);
                    if (object.on_ground != null)
                        message.on_ground = object.on_ground | 0;
                    if (object.revision != null)
                        message.revision = $Number(object.revision);
                    return message;
                };

                /**
                 * Creates a plain object from a Motion message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Motion
                 * @static
                 * @param {mtws.tower.v1.Motion} message Motion
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Motion.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.simobjectid = 0;
                        object.latitude = 0;
                        object.longitude = 0;
                        object.altitude = 0;
                        object.heading = 0;
                        object.groundspeed = 0;
                        object.vertical_speed = 0;
                        object.on_ground = 0;
                        object.revision = 0;
                    }
                    if (message.simobjectid != null && $Object.hasOwnProperty.call(message, "simobjectid"))
                        object.simobjectid = message.simobjectid;
                    if (message.latitude != null && $Object.hasOwnProperty.call(message, "latitude"))
                        object.latitude = options.json && !$isFinite(message.latitude) ? $String(message.latitude) : message.latitude;
                    if (message.longitude != null && $Object.hasOwnProperty.call(message, "longitude"))
                        object.longitude = options.json && !$isFinite(message.longitude) ? $String(message.longitude) : message.longitude;
                    if (message.altitude != null && $Object.hasOwnProperty.call(message, "altitude"))
                        object.altitude = options.json && !$isFinite(message.altitude) ? $String(message.altitude) : message.altitude;
                    if (message.heading != null && $Object.hasOwnProperty.call(message, "heading"))
                        object.heading = options.json && !$isFinite(message.heading) ? $String(message.heading) : message.heading;
                    if (message.groundspeed != null && $Object.hasOwnProperty.call(message, "groundspeed"))
                        object.groundspeed = options.json && !$isFinite(message.groundspeed) ? $String(message.groundspeed) : message.groundspeed;
                    if (message.vertical_speed != null && $Object.hasOwnProperty.call(message, "vertical_speed"))
                        object.vertical_speed = options.json && !$isFinite(message.vertical_speed) ? $String(message.vertical_speed) : message.vertical_speed;
                    if (message.on_ground != null && $Object.hasOwnProperty.call(message, "on_ground"))
                        object.on_ground = message.on_ground;
                    if (message.revision != null && $Object.hasOwnProperty.call(message, "revision"))
                        object.revision = options.json && !$isFinite(message.revision) ? $String(message.revision) : message.revision;
                    return object;
                };

                /**
                 * Converts this Motion to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Motion
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Motion.prototype.toJSON = function() {
                    return Motion.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Motion;
            })();

            v1.Camera = (function() {

                /**
                 * Properties of a Camera.
                 * @typedef {Object} mtws.tower.v1.Camera.$Properties
                 * @property {number|null} [gameplay_pitch_yaw_0] Camera gameplay_pitch_yaw_0
                 * @property {number|null} [gameplay_pitch_yaw_1] Camera gameplay_pitch_yaw_1
                 * @property {number|null} [cockpit_camera_zoom] Camera cockpit_camera_zoom
                 * @property {number|null} [aircraft_latitude] Camera aircraft_latitude
                 * @property {number|null} [aircraft_longitude] Camera aircraft_longitude
                 * @property {number|null} [aircraft_altitude] Camera aircraft_altitude
                 * @property {number|null} [aircraft_heading] Camera aircraft_heading
                 * @property {number|null} [aircraft_pitch] Camera aircraft_pitch
                 * @property {number|null} [aircraft_bank] Camera aircraft_bank
                 * @property {number|null} [camera_state] Camera camera_state
                 * @property {number|null} [camera_view_type_and_index_0] Camera camera_view_type_and_index_0
                 * @property {number|null} [camera_view_type_and_index_1] Camera camera_view_type_and_index_1
                 * @property {number} revision Camera revision
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Camera.
                 * @memberof mtws.tower.v1
                 * @interface ICamera
                 * @augments mtws.tower.v1.Camera.$Properties
                 * @deprecated Use mtws.tower.v1.Camera.$Properties instead.
                 */

                /**
                 * Shape of a Camera.
                 * @typedef {mtws.tower.v1.Camera.$Properties} mtws.tower.v1.Camera.$Shape
                 */

                /**
                 * Constructs a new Camera.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Camera.
                 * @constructor
                 * @param {mtws.tower.v1.Camera.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Camera = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Camera gameplay_pitch_yaw_0.
                 * @member {number|null|undefined} gameplay_pitch_yaw_0
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.gameplay_pitch_yaw_0 = null;

                /**
                 * Camera gameplay_pitch_yaw_1.
                 * @member {number|null|undefined} gameplay_pitch_yaw_1
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.gameplay_pitch_yaw_1 = null;

                /**
                 * Camera cockpit_camera_zoom.
                 * @member {number|null|undefined} cockpit_camera_zoom
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.cockpit_camera_zoom = null;

                /**
                 * Camera aircraft_latitude.
                 * @member {number|null|undefined} aircraft_latitude
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_latitude = null;

                /**
                 * Camera aircraft_longitude.
                 * @member {number|null|undefined} aircraft_longitude
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_longitude = null;

                /**
                 * Camera aircraft_altitude.
                 * @member {number|null|undefined} aircraft_altitude
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_altitude = null;

                /**
                 * Camera aircraft_heading.
                 * @member {number|null|undefined} aircraft_heading
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_heading = null;

                /**
                 * Camera aircraft_pitch.
                 * @member {number|null|undefined} aircraft_pitch
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_pitch = null;

                /**
                 * Camera aircraft_bank.
                 * @member {number|null|undefined} aircraft_bank
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.aircraft_bank = null;

                /**
                 * Camera camera_state.
                 * @member {number|null|undefined} camera_state
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.camera_state = null;

                /**
                 * Camera camera_view_type_and_index_0.
                 * @member {number|null|undefined} camera_view_type_and_index_0
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.camera_view_type_and_index_0 = null;

                /**
                 * Camera camera_view_type_and_index_1.
                 * @member {number|null|undefined} camera_view_type_and_index_1
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.camera_view_type_and_index_1 = null;

                /**
                 * Camera revision.
                 * @member {number} revision
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 */
                Camera.prototype.revision = 0;

                /**
                 * Creates a new Camera instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {mtws.tower.v1.Camera.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Camera} Camera instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Camera.$Shape): mtws.tower.v1.Camera & mtws.tower.v1.Camera.$Shape;
                 *   (properties?: mtws.tower.v1.Camera.$Properties): mtws.tower.v1.Camera;
                 * }}
                 */
                Camera.create = function(properties) {
                    return new Camera(properties);
                };

                /**
                 * Encodes the specified Camera message. Does not implicitly {@link mtws.tower.v1.Camera.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {mtws.tower.v1.Camera.$Properties} message Camera message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Camera.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.gameplay_pitch_yaw_0 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_0"))
                        writer.uint32(/* id 1, wireType 1 =*/9).double(message.gameplay_pitch_yaw_0);
                    if (message.gameplay_pitch_yaw_1 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_1"))
                        writer.uint32(/* id 2, wireType 1 =*/17).double(message.gameplay_pitch_yaw_1);
                    if (message.cockpit_camera_zoom != null && $Object.hasOwnProperty.call(message, "cockpit_camera_zoom"))
                        writer.uint32(/* id 3, wireType 1 =*/25).double(message.cockpit_camera_zoom);
                    if (message.aircraft_latitude != null && $Object.hasOwnProperty.call(message, "aircraft_latitude"))
                        writer.uint32(/* id 4, wireType 1 =*/33).double(message.aircraft_latitude);
                    if (message.aircraft_longitude != null && $Object.hasOwnProperty.call(message, "aircraft_longitude"))
                        writer.uint32(/* id 5, wireType 1 =*/41).double(message.aircraft_longitude);
                    if (message.aircraft_altitude != null && $Object.hasOwnProperty.call(message, "aircraft_altitude"))
                        writer.uint32(/* id 6, wireType 1 =*/49).double(message.aircraft_altitude);
                    if (message.aircraft_heading != null && $Object.hasOwnProperty.call(message, "aircraft_heading"))
                        writer.uint32(/* id 7, wireType 1 =*/57).double(message.aircraft_heading);
                    if (message.aircraft_pitch != null && $Object.hasOwnProperty.call(message, "aircraft_pitch"))
                        writer.uint32(/* id 8, wireType 1 =*/65).double(message.aircraft_pitch);
                    if (message.aircraft_bank != null && $Object.hasOwnProperty.call(message, "aircraft_bank"))
                        writer.uint32(/* id 9, wireType 1 =*/73).double(message.aircraft_bank);
                    if (message.camera_state != null && $Object.hasOwnProperty.call(message, "camera_state"))
                        writer.uint32(/* id 10, wireType 0 =*/80).int32(message.camera_state);
                    if (message.camera_view_type_and_index_0 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_0"))
                        writer.uint32(/* id 11, wireType 0 =*/88).int32(message.camera_view_type_and_index_0);
                    if (message.camera_view_type_and_index_1 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_1"))
                        writer.uint32(/* id 12, wireType 0 =*/96).int32(message.camera_view_type_and_index_1);
                    writer.uint32(/* id 13, wireType 1 =*/105).double(message.revision);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Camera message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Camera & mtws.tower.v1.Camera.$Shape} Camera
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Camera.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Camera();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 1)
                                    break;
                                message.gameplay_pitch_yaw_0 = reader.double();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.gameplay_pitch_yaw_1 = reader.double();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.cockpit_camera_zoom = reader.double();
                                continue;
                            }
                        case 4: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_latitude = reader.double();
                                continue;
                            }
                        case 5: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_longitude = reader.double();
                                continue;
                            }
                        case 6: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_altitude = reader.double();
                                continue;
                            }
                        case 7: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_heading = reader.double();
                                continue;
                            }
                        case 8: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_pitch = reader.double();
                                continue;
                            }
                        case 9: {
                                if (wireType !== 1)
                                    break;
                                message.aircraft_bank = reader.double();
                                continue;
                            }
                        case 10: {
                                if (wireType !== 0)
                                    break;
                                message.camera_state = reader.int32();
                                continue;
                            }
                        case 11: {
                                if (wireType !== 0)
                                    break;
                                message.camera_view_type_and_index_0 = reader.int32();
                                continue;
                            }
                        case 12: {
                                if (wireType !== 0)
                                    break;
                                message.camera_view_type_and_index_1 = reader.int32();
                                continue;
                            }
                        case 13: {
                                if (wireType !== 1)
                                    break;
                                message.revision = reader.double();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "revision"))
                        throw $util.ProtocolError("missing required 'revision'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Camera message.
                 * @function verify
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Camera.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.gameplay_pitch_yaw_0 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_0"))
                        if (typeof message.gameplay_pitch_yaw_0 !== "number")
                            return "gameplay_pitch_yaw_0: number expected";
                    if (message.gameplay_pitch_yaw_1 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_1"))
                        if (typeof message.gameplay_pitch_yaw_1 !== "number")
                            return "gameplay_pitch_yaw_1: number expected";
                    if (message.cockpit_camera_zoom != null && $Object.hasOwnProperty.call(message, "cockpit_camera_zoom"))
                        if (typeof message.cockpit_camera_zoom !== "number")
                            return "cockpit_camera_zoom: number expected";
                    if (message.aircraft_latitude != null && $Object.hasOwnProperty.call(message, "aircraft_latitude"))
                        if (typeof message.aircraft_latitude !== "number")
                            return "aircraft_latitude: number expected";
                    if (message.aircraft_longitude != null && $Object.hasOwnProperty.call(message, "aircraft_longitude"))
                        if (typeof message.aircraft_longitude !== "number")
                            return "aircraft_longitude: number expected";
                    if (message.aircraft_altitude != null && $Object.hasOwnProperty.call(message, "aircraft_altitude"))
                        if (typeof message.aircraft_altitude !== "number")
                            return "aircraft_altitude: number expected";
                    if (message.aircraft_heading != null && $Object.hasOwnProperty.call(message, "aircraft_heading"))
                        if (typeof message.aircraft_heading !== "number")
                            return "aircraft_heading: number expected";
                    if (message.aircraft_pitch != null && $Object.hasOwnProperty.call(message, "aircraft_pitch"))
                        if (typeof message.aircraft_pitch !== "number")
                            return "aircraft_pitch: number expected";
                    if (message.aircraft_bank != null && $Object.hasOwnProperty.call(message, "aircraft_bank"))
                        if (typeof message.aircraft_bank !== "number")
                            return "aircraft_bank: number expected";
                    if (message.camera_state != null && $Object.hasOwnProperty.call(message, "camera_state"))
                        if (!$util.isInteger(message.camera_state))
                            return "camera_state: integer expected";
                    if (message.camera_view_type_and_index_0 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_0"))
                        if (!$util.isInteger(message.camera_view_type_and_index_0))
                            return "camera_view_type_and_index_0: integer expected";
                    if (message.camera_view_type_and_index_1 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_1"))
                        if (!$util.isInteger(message.camera_view_type_and_index_1))
                            return "camera_view_type_and_index_1: integer expected";
                    if (typeof message.revision !== "number")
                        return "revision: number expected";
                    return null;
                };

                /**
                 * Creates a Camera message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Camera} Camera
                 */
                Camera.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Camera)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Camera: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Camera();
                    if (object.gameplay_pitch_yaw_0 != null)
                        message.gameplay_pitch_yaw_0 = $Number(object.gameplay_pitch_yaw_0);
                    if (object.gameplay_pitch_yaw_1 != null)
                        message.gameplay_pitch_yaw_1 = $Number(object.gameplay_pitch_yaw_1);
                    if (object.cockpit_camera_zoom != null)
                        message.cockpit_camera_zoom = $Number(object.cockpit_camera_zoom);
                    if (object.aircraft_latitude != null)
                        message.aircraft_latitude = $Number(object.aircraft_latitude);
                    if (object.aircraft_longitude != null)
                        message.aircraft_longitude = $Number(object.aircraft_longitude);
                    if (object.aircraft_altitude != null)
                        message.aircraft_altitude = $Number(object.aircraft_altitude);
                    if (object.aircraft_heading != null)
                        message.aircraft_heading = $Number(object.aircraft_heading);
                    if (object.aircraft_pitch != null)
                        message.aircraft_pitch = $Number(object.aircraft_pitch);
                    if (object.aircraft_bank != null)
                        message.aircraft_bank = $Number(object.aircraft_bank);
                    if (object.camera_state != null)
                        message.camera_state = object.camera_state | 0;
                    if (object.camera_view_type_and_index_0 != null)
                        message.camera_view_type_and_index_0 = object.camera_view_type_and_index_0 | 0;
                    if (object.camera_view_type_and_index_1 != null)
                        message.camera_view_type_and_index_1 = object.camera_view_type_and_index_1 | 0;
                    if (object.revision != null)
                        message.revision = $Number(object.revision);
                    return message;
                };

                /**
                 * Creates a plain object from a Camera message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Camera
                 * @static
                 * @param {mtws.tower.v1.Camera} message Camera
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Camera.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.gameplay_pitch_yaw_0 = 0;
                        object.gameplay_pitch_yaw_1 = 0;
                        object.cockpit_camera_zoom = 0;
                        object.aircraft_latitude = 0;
                        object.aircraft_longitude = 0;
                        object.aircraft_altitude = 0;
                        object.aircraft_heading = 0;
                        object.aircraft_pitch = 0;
                        object.aircraft_bank = 0;
                        object.camera_state = 0;
                        object.camera_view_type_and_index_0 = 0;
                        object.camera_view_type_and_index_1 = 0;
                        object.revision = 0;
                    }
                    if (message.gameplay_pitch_yaw_0 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_0"))
                        object.gameplay_pitch_yaw_0 = options.json && !$isFinite(message.gameplay_pitch_yaw_0) ? $String(message.gameplay_pitch_yaw_0) : message.gameplay_pitch_yaw_0;
                    if (message.gameplay_pitch_yaw_1 != null && $Object.hasOwnProperty.call(message, "gameplay_pitch_yaw_1"))
                        object.gameplay_pitch_yaw_1 = options.json && !$isFinite(message.gameplay_pitch_yaw_1) ? $String(message.gameplay_pitch_yaw_1) : message.gameplay_pitch_yaw_1;
                    if (message.cockpit_camera_zoom != null && $Object.hasOwnProperty.call(message, "cockpit_camera_zoom"))
                        object.cockpit_camera_zoom = options.json && !$isFinite(message.cockpit_camera_zoom) ? $String(message.cockpit_camera_zoom) : message.cockpit_camera_zoom;
                    if (message.aircraft_latitude != null && $Object.hasOwnProperty.call(message, "aircraft_latitude"))
                        object.aircraft_latitude = options.json && !$isFinite(message.aircraft_latitude) ? $String(message.aircraft_latitude) : message.aircraft_latitude;
                    if (message.aircraft_longitude != null && $Object.hasOwnProperty.call(message, "aircraft_longitude"))
                        object.aircraft_longitude = options.json && !$isFinite(message.aircraft_longitude) ? $String(message.aircraft_longitude) : message.aircraft_longitude;
                    if (message.aircraft_altitude != null && $Object.hasOwnProperty.call(message, "aircraft_altitude"))
                        object.aircraft_altitude = options.json && !$isFinite(message.aircraft_altitude) ? $String(message.aircraft_altitude) : message.aircraft_altitude;
                    if (message.aircraft_heading != null && $Object.hasOwnProperty.call(message, "aircraft_heading"))
                        object.aircraft_heading = options.json && !$isFinite(message.aircraft_heading) ? $String(message.aircraft_heading) : message.aircraft_heading;
                    if (message.aircraft_pitch != null && $Object.hasOwnProperty.call(message, "aircraft_pitch"))
                        object.aircraft_pitch = options.json && !$isFinite(message.aircraft_pitch) ? $String(message.aircraft_pitch) : message.aircraft_pitch;
                    if (message.aircraft_bank != null && $Object.hasOwnProperty.call(message, "aircraft_bank"))
                        object.aircraft_bank = options.json && !$isFinite(message.aircraft_bank) ? $String(message.aircraft_bank) : message.aircraft_bank;
                    if (message.camera_state != null && $Object.hasOwnProperty.call(message, "camera_state"))
                        object.camera_state = message.camera_state;
                    if (message.camera_view_type_and_index_0 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_0"))
                        object.camera_view_type_and_index_0 = message.camera_view_type_and_index_0;
                    if (message.camera_view_type_and_index_1 != null && $Object.hasOwnProperty.call(message, "camera_view_type_and_index_1"))
                        object.camera_view_type_and_index_1 = message.camera_view_type_and_index_1;
                    if (message.revision != null && $Object.hasOwnProperty.call(message, "revision"))
                        object.revision = options.json && !$isFinite(message.revision) ? $String(message.revision) : message.revision;
                    return object;
                };

                /**
                 * Converts this Camera to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Camera
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Camera.prototype.toJSON = function() {
                    return Camera.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Camera;
            })();

            v1.AircraftMetadata = (function() {

                /**
                 * Properties of an AircraftMetadata.
                 * @typedef {Object} mtws.tower.v1.AircraftMetadata.$Properties
                 * @property {number} simobjectid AircraftMetadata simobjectid
                 * @property {string} callsign AircraftMetadata callsign
                 * @property {string|null} [type] AircraftMetadata type
                 * @property {string|null} [dep] AircraftMetadata dep
                 * @property {string|null} [arr] AircraftMetadata arr
                 * @property {string|null} [transponder] AircraftMetadata transponder
                 * @property {string|null} [transponder_asgn] AircraftMetadata transponder_asgn
                 * @property {string|null} [deptime] AircraftMetadata deptime
                 * @property {string|null} [dep_rwy] AircraftMetadata dep_rwy
                 * @property {string|null} [dep_sid] AircraftMetadata dep_sid
                 * @property {string|null} [gate] AircraftMetadata gate
                 * @property {string|null} [scratchpad] AircraftMetadata scratchpad
                 * @property {string|null} [arr_rwy] AircraftMetadata arr_rwy
                 * @property {string|null} [arr_star] AircraftMetadata arr_star
                 * @property {string|null} [registration] AircraftMetadata registration
                 * @property {string|null} [tobt] AircraftMetadata tobt
                 * @property {string|null} [flightplan] AircraftMetadata flightplan
                 * @property {Array.<mtws.tower.v1.Transceiver.$Properties>|null} [transceivers] AircraftMetadata transceivers
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of an AircraftMetadata.
                 * @memberof mtws.tower.v1
                 * @interface IAircraftMetadata
                 * @augments mtws.tower.v1.AircraftMetadata.$Properties
                 * @deprecated Use mtws.tower.v1.AircraftMetadata.$Properties instead.
                 */

                /**
                 * Shape of an AircraftMetadata.
                 * @typedef {mtws.tower.v1.AircraftMetadata.$Properties} mtws.tower.v1.AircraftMetadata.$Shape
                 */

                /**
                 * Constructs a new AircraftMetadata.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents an AircraftMetadata.
                 * @constructor
                 * @param {mtws.tower.v1.AircraftMetadata.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const AircraftMetadata = function (properties) {
                    this.transceivers = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * AircraftMetadata simobjectid.
                 * @member {number} simobjectid
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.simobjectid = 0;

                /**
                 * AircraftMetadata callsign.
                 * @member {string} callsign
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.callsign = "";

                /**
                 * AircraftMetadata type.
                 * @member {string|null|undefined} type
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.type = null;

                /**
                 * AircraftMetadata dep.
                 * @member {string|null|undefined} dep
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.dep = null;

                /**
                 * AircraftMetadata arr.
                 * @member {string|null|undefined} arr
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.arr = null;

                /**
                 * AircraftMetadata transponder.
                 * @member {string|null|undefined} transponder
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.transponder = null;

                /**
                 * AircraftMetadata transponder_asgn.
                 * @member {string|null|undefined} transponder_asgn
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.transponder_asgn = null;

                /**
                 * AircraftMetadata deptime.
                 * @member {string|null|undefined} deptime
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.deptime = null;

                /**
                 * AircraftMetadata dep_rwy.
                 * @member {string|null|undefined} dep_rwy
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.dep_rwy = null;

                /**
                 * AircraftMetadata dep_sid.
                 * @member {string|null|undefined} dep_sid
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.dep_sid = null;

                /**
                 * AircraftMetadata gate.
                 * @member {string|null|undefined} gate
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.gate = null;

                /**
                 * AircraftMetadata scratchpad.
                 * @member {string|null|undefined} scratchpad
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.scratchpad = null;

                /**
                 * AircraftMetadata arr_rwy.
                 * @member {string|null|undefined} arr_rwy
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.arr_rwy = null;

                /**
                 * AircraftMetadata arr_star.
                 * @member {string|null|undefined} arr_star
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.arr_star = null;

                /**
                 * AircraftMetadata registration.
                 * @member {string|null|undefined} registration
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.registration = null;

                /**
                 * AircraftMetadata tobt.
                 * @member {string|null|undefined} tobt
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.tobt = null;

                /**
                 * AircraftMetadata flightplan.
                 * @member {string|null|undefined} flightplan
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.flightplan = null;

                /**
                 * AircraftMetadata transceivers.
                 * @member {Array.<mtws.tower.v1.Transceiver.$Properties>} transceivers
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 */
                AircraftMetadata.prototype.transceivers = $util.emptyArray;

                /**
                 * Creates a new AircraftMetadata instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {mtws.tower.v1.AircraftMetadata.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.AircraftMetadata} AircraftMetadata instance
                 * @type {{
                 *   (properties: mtws.tower.v1.AircraftMetadata.$Shape): mtws.tower.v1.AircraftMetadata & mtws.tower.v1.AircraftMetadata.$Shape;
                 *   (properties?: mtws.tower.v1.AircraftMetadata.$Properties): mtws.tower.v1.AircraftMetadata;
                 * }}
                 */
                AircraftMetadata.create = function(properties) {
                    return new AircraftMetadata(properties);
                };

                /**
                 * Encodes the specified AircraftMetadata message. Does not implicitly {@link mtws.tower.v1.AircraftMetadata.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {mtws.tower.v1.AircraftMetadata.$Properties} message AircraftMetadata message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                AircraftMetadata.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).sint32(message.simobjectid);
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.callsign);
                    if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
                    if (message.dep != null && $Object.hasOwnProperty.call(message, "dep"))
                        writer.uint32(/* id 4, wireType 2 =*/34).string(message.dep);
                    if (message.arr != null && $Object.hasOwnProperty.call(message, "arr"))
                        writer.uint32(/* id 5, wireType 2 =*/42).string(message.arr);
                    if (message.transponder != null && $Object.hasOwnProperty.call(message, "transponder"))
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.transponder);
                    if (message.transponder_asgn != null && $Object.hasOwnProperty.call(message, "transponder_asgn"))
                        writer.uint32(/* id 7, wireType 2 =*/58).string(message.transponder_asgn);
                    if (message.deptime != null && $Object.hasOwnProperty.call(message, "deptime"))
                        writer.uint32(/* id 8, wireType 2 =*/66).string(message.deptime);
                    if (message.dep_rwy != null && $Object.hasOwnProperty.call(message, "dep_rwy"))
                        writer.uint32(/* id 9, wireType 2 =*/74).string(message.dep_rwy);
                    if (message.dep_sid != null && $Object.hasOwnProperty.call(message, "dep_sid"))
                        writer.uint32(/* id 10, wireType 2 =*/82).string(message.dep_sid);
                    if (message.gate != null && $Object.hasOwnProperty.call(message, "gate"))
                        writer.uint32(/* id 11, wireType 2 =*/90).string(message.gate);
                    if (message.scratchpad != null && $Object.hasOwnProperty.call(message, "scratchpad"))
                        writer.uint32(/* id 12, wireType 2 =*/98).string(message.scratchpad);
                    if (message.arr_rwy != null && $Object.hasOwnProperty.call(message, "arr_rwy"))
                        writer.uint32(/* id 13, wireType 2 =*/106).string(message.arr_rwy);
                    if (message.arr_star != null && $Object.hasOwnProperty.call(message, "arr_star"))
                        writer.uint32(/* id 14, wireType 2 =*/114).string(message.arr_star);
                    if (message.registration != null && $Object.hasOwnProperty.call(message, "registration"))
                        writer.uint32(/* id 15, wireType 2 =*/122).string(message.registration);
                    if (message.tobt != null && $Object.hasOwnProperty.call(message, "tobt"))
                        writer.uint32(/* id 16, wireType 2 =*/130).string(message.tobt);
                    if (message.flightplan != null && $Object.hasOwnProperty.call(message, "flightplan"))
                        writer.uint32(/* id 17, wireType 2 =*/138).string(message.flightplan);
                    if (message.transceivers != null && message.transceivers.length)
                        for (let i = 0; i < message.transceivers.length; ++i)
                            $root.mtws.tower.v1.Transceiver.encode(message.transceivers[i], writer.uint32(/* id 18, wireType 2 =*/146).fork(), _depth + 1).ldelim();
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes an AircraftMetadata message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.AircraftMetadata & mtws.tower.v1.AircraftMetadata.$Shape} AircraftMetadata
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                AircraftMetadata.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.AircraftMetadata();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.simobjectid = reader.sint32();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.callsign = reader.string();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.type = reader.string();
                                continue;
                            }
                        case 4: {
                                if (wireType !== 2)
                                    break;
                                message.dep = reader.string();
                                continue;
                            }
                        case 5: {
                                if (wireType !== 2)
                                    break;
                                message.arr = reader.string();
                                continue;
                            }
                        case 6: {
                                if (wireType !== 2)
                                    break;
                                message.transponder = reader.string();
                                continue;
                            }
                        case 7: {
                                if (wireType !== 2)
                                    break;
                                message.transponder_asgn = reader.string();
                                continue;
                            }
                        case 8: {
                                if (wireType !== 2)
                                    break;
                                message.deptime = reader.string();
                                continue;
                            }
                        case 9: {
                                if (wireType !== 2)
                                    break;
                                message.dep_rwy = reader.string();
                                continue;
                            }
                        case 10: {
                                if (wireType !== 2)
                                    break;
                                message.dep_sid = reader.string();
                                continue;
                            }
                        case 11: {
                                if (wireType !== 2)
                                    break;
                                message.gate = reader.string();
                                continue;
                            }
                        case 12: {
                                if (wireType !== 2)
                                    break;
                                message.scratchpad = reader.string();
                                continue;
                            }
                        case 13: {
                                if (wireType !== 2)
                                    break;
                                message.arr_rwy = reader.string();
                                continue;
                            }
                        case 14: {
                                if (wireType !== 2)
                                    break;
                                message.arr_star = reader.string();
                                continue;
                            }
                        case 15: {
                                if (wireType !== 2)
                                    break;
                                message.registration = reader.string();
                                continue;
                            }
                        case 16: {
                                if (wireType !== 2)
                                    break;
                                message.tobt = reader.string();
                                continue;
                            }
                        case 17: {
                                if (wireType !== 2)
                                    break;
                                message.flightplan = reader.string();
                                continue;
                            }
                        case 18: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.transceivers && message.transceivers.length))
                                    message.transceivers = [];
                                message.transceivers.push($root.mtws.tower.v1.Transceiver.decode(reader, reader.size(), $undefined, _depth + 1));
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "simobjectid"))
                        throw $util.ProtocolError("missing required 'simobjectid'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "callsign"))
                        throw $util.ProtocolError("missing required 'callsign'", { instance: message });
                    return message;
                };

                /**
                 * Verifies an AircraftMetadata message.
                 * @function verify
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                AircraftMetadata.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (!$util.isInteger(message.simobjectid))
                        return "simobjectid: integer expected";
                    if (!$util.isString(message.callsign))
                        return "callsign: string expected";
                    if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                        if (!$util.isString(message.type))
                            return "type: string expected";
                    if (message.dep != null && $Object.hasOwnProperty.call(message, "dep"))
                        if (!$util.isString(message.dep))
                            return "dep: string expected";
                    if (message.arr != null && $Object.hasOwnProperty.call(message, "arr"))
                        if (!$util.isString(message.arr))
                            return "arr: string expected";
                    if (message.transponder != null && $Object.hasOwnProperty.call(message, "transponder"))
                        if (!$util.isString(message.transponder))
                            return "transponder: string expected";
                    if (message.transponder_asgn != null && $Object.hasOwnProperty.call(message, "transponder_asgn"))
                        if (!$util.isString(message.transponder_asgn))
                            return "transponder_asgn: string expected";
                    if (message.deptime != null && $Object.hasOwnProperty.call(message, "deptime"))
                        if (!$util.isString(message.deptime))
                            return "deptime: string expected";
                    if (message.dep_rwy != null && $Object.hasOwnProperty.call(message, "dep_rwy"))
                        if (!$util.isString(message.dep_rwy))
                            return "dep_rwy: string expected";
                    if (message.dep_sid != null && $Object.hasOwnProperty.call(message, "dep_sid"))
                        if (!$util.isString(message.dep_sid))
                            return "dep_sid: string expected";
                    if (message.gate != null && $Object.hasOwnProperty.call(message, "gate"))
                        if (!$util.isString(message.gate))
                            return "gate: string expected";
                    if (message.scratchpad != null && $Object.hasOwnProperty.call(message, "scratchpad"))
                        if (!$util.isString(message.scratchpad))
                            return "scratchpad: string expected";
                    if (message.arr_rwy != null && $Object.hasOwnProperty.call(message, "arr_rwy"))
                        if (!$util.isString(message.arr_rwy))
                            return "arr_rwy: string expected";
                    if (message.arr_star != null && $Object.hasOwnProperty.call(message, "arr_star"))
                        if (!$util.isString(message.arr_star))
                            return "arr_star: string expected";
                    if (message.registration != null && $Object.hasOwnProperty.call(message, "registration"))
                        if (!$util.isString(message.registration))
                            return "registration: string expected";
                    if (message.tobt != null && $Object.hasOwnProperty.call(message, "tobt"))
                        if (!$util.isString(message.tobt))
                            return "tobt: string expected";
                    if (message.flightplan != null && $Object.hasOwnProperty.call(message, "flightplan"))
                        if (!$util.isString(message.flightplan))
                            return "flightplan: string expected";
                    if (message.transceivers != null && $Object.hasOwnProperty.call(message, "transceivers")) {
                        if (!$Array.isArray(message.transceivers))
                            return "transceivers: array expected";
                        for (let i = 0; i < message.transceivers.length; ++i) {
                            let error = $root.mtws.tower.v1.Transceiver.verify(message.transceivers[i], _depth + 1);
                            if (error)
                                return "transceivers." + error;
                        }
                    }
                    return null;
                };

                /**
                 * Creates an AircraftMetadata message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.AircraftMetadata} AircraftMetadata
                 */
                AircraftMetadata.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.AircraftMetadata)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.AircraftMetadata: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.AircraftMetadata();
                    if (object.simobjectid != null)
                        message.simobjectid = object.simobjectid | 0;
                    if (object.callsign != null)
                        message.callsign = $String(object.callsign);
                    if (object.type != null)
                        message.type = $String(object.type);
                    if (object.dep != null)
                        message.dep = $String(object.dep);
                    if (object.arr != null)
                        message.arr = $String(object.arr);
                    if (object.transponder != null)
                        message.transponder = $String(object.transponder);
                    if (object.transponder_asgn != null)
                        message.transponder_asgn = $String(object.transponder_asgn);
                    if (object.deptime != null)
                        message.deptime = $String(object.deptime);
                    if (object.dep_rwy != null)
                        message.dep_rwy = $String(object.dep_rwy);
                    if (object.dep_sid != null)
                        message.dep_sid = $String(object.dep_sid);
                    if (object.gate != null)
                        message.gate = $String(object.gate);
                    if (object.scratchpad != null)
                        message.scratchpad = $String(object.scratchpad);
                    if (object.arr_rwy != null)
                        message.arr_rwy = $String(object.arr_rwy);
                    if (object.arr_star != null)
                        message.arr_star = $String(object.arr_star);
                    if (object.registration != null)
                        message.registration = $String(object.registration);
                    if (object.tobt != null)
                        message.tobt = $String(object.tobt);
                    if (object.flightplan != null)
                        message.flightplan = $String(object.flightplan);
                    if (object.transceivers) {
                        if (!$Array.isArray(object.transceivers))
                            throw $TypeError(".mtws.tower.v1.AircraftMetadata.transceivers: array expected");
                        message.transceivers = $Array(object.transceivers.length);
                        for (let i = 0; i < object.transceivers.length; ++i) {
                            if (!$util.isObject(object.transceivers[i]))
                                throw $TypeError(".mtws.tower.v1.AircraftMetadata.transceivers: object expected");
                            message.transceivers[i] = $root.mtws.tower.v1.Transceiver.fromObject(object.transceivers[i], _depth + 1);
                        }
                    }
                    return message;
                };

                /**
                 * Creates a plain object from an AircraftMetadata message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @static
                 * @param {mtws.tower.v1.AircraftMetadata} message AircraftMetadata
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                AircraftMetadata.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults)
                        object.transceivers = [];
                    if (options.defaults) {
                        object.simobjectid = 0;
                        object.callsign = "";
                        object.type = "";
                        object.dep = "";
                        object.arr = "";
                        object.transponder = "";
                        object.transponder_asgn = "";
                        object.deptime = "";
                        object.dep_rwy = "";
                        object.dep_sid = "";
                        object.gate = "";
                        object.scratchpad = "";
                        object.arr_rwy = "";
                        object.arr_star = "";
                        object.registration = "";
                        object.tobt = "";
                        object.flightplan = "";
                    }
                    if (message.simobjectid != null && $Object.hasOwnProperty.call(message, "simobjectid"))
                        object.simobjectid = message.simobjectid;
                    if (message.callsign != null && $Object.hasOwnProperty.call(message, "callsign"))
                        object.callsign = message.callsign;
                    if (message.type != null && $Object.hasOwnProperty.call(message, "type"))
                        object.type = message.type;
                    if (message.dep != null && $Object.hasOwnProperty.call(message, "dep"))
                        object.dep = message.dep;
                    if (message.arr != null && $Object.hasOwnProperty.call(message, "arr"))
                        object.arr = message.arr;
                    if (message.transponder != null && $Object.hasOwnProperty.call(message, "transponder"))
                        object.transponder = message.transponder;
                    if (message.transponder_asgn != null && $Object.hasOwnProperty.call(message, "transponder_asgn"))
                        object.transponder_asgn = message.transponder_asgn;
                    if (message.deptime != null && $Object.hasOwnProperty.call(message, "deptime"))
                        object.deptime = message.deptime;
                    if (message.dep_rwy != null && $Object.hasOwnProperty.call(message, "dep_rwy"))
                        object.dep_rwy = message.dep_rwy;
                    if (message.dep_sid != null && $Object.hasOwnProperty.call(message, "dep_sid"))
                        object.dep_sid = message.dep_sid;
                    if (message.gate != null && $Object.hasOwnProperty.call(message, "gate"))
                        object.gate = message.gate;
                    if (message.scratchpad != null && $Object.hasOwnProperty.call(message, "scratchpad"))
                        object.scratchpad = message.scratchpad;
                    if (message.arr_rwy != null && $Object.hasOwnProperty.call(message, "arr_rwy"))
                        object.arr_rwy = message.arr_rwy;
                    if (message.arr_star != null && $Object.hasOwnProperty.call(message, "arr_star"))
                        object.arr_star = message.arr_star;
                    if (message.registration != null && $Object.hasOwnProperty.call(message, "registration"))
                        object.registration = message.registration;
                    if (message.tobt != null && $Object.hasOwnProperty.call(message, "tobt"))
                        object.tobt = message.tobt;
                    if (message.flightplan != null && $Object.hasOwnProperty.call(message, "flightplan"))
                        object.flightplan = message.flightplan;
                    if (message.transceivers && message.transceivers.length) {
                        object.transceivers = $Array(message.transceivers.length);
                        for (let j = 0; j < message.transceivers.length; ++j)
                            object.transceivers[j] = $root.mtws.tower.v1.Transceiver.toObject(message.transceivers[j], options, _depth + 1);
                    }
                    return object;
                };

                /**
                 * Converts this AircraftMetadata to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.AircraftMetadata
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                AircraftMetadata.prototype.toJSON = function() {
                    return AircraftMetadata.toObject(this, $protobuf.util.toJSONOptions);
                };

                return AircraftMetadata;
            })();

            v1.Transceiver = (function() {

                /**
                 * Properties of a Transceiver.
                 * @typedef {Object} mtws.tower.v1.Transceiver.$Properties
                 * @property {number} id Transceiver id
                 * @property {number} frequency Transceiver frequency
                 * @property {number} lat_deg Transceiver lat_deg
                 * @property {number} lon_deg Transceiver lon_deg
                 * @property {number} height_msl_m Transceiver height_msl_m
                 * @property {number} height_agl_m Transceiver height_agl_m
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Transceiver.
                 * @memberof mtws.tower.v1
                 * @interface ITransceiver
                 * @augments mtws.tower.v1.Transceiver.$Properties
                 * @deprecated Use mtws.tower.v1.Transceiver.$Properties instead.
                 */

                /**
                 * Shape of a Transceiver.
                 * @typedef {mtws.tower.v1.Transceiver.$Properties} mtws.tower.v1.Transceiver.$Shape
                 */

                /**
                 * Constructs a new Transceiver.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Transceiver.
                 * @constructor
                 * @param {mtws.tower.v1.Transceiver.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Transceiver = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Transceiver id.
                 * @member {number} id
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.id = 0;

                /**
                 * Transceiver frequency.
                 * @member {number} frequency
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.frequency = 0;

                /**
                 * Transceiver lat_deg.
                 * @member {number} lat_deg
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.lat_deg = 0;

                /**
                 * Transceiver lon_deg.
                 * @member {number} lon_deg
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.lon_deg = 0;

                /**
                 * Transceiver height_msl_m.
                 * @member {number} height_msl_m
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.height_msl_m = 0;

                /**
                 * Transceiver height_agl_m.
                 * @member {number} height_agl_m
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 */
                Transceiver.prototype.height_agl_m = 0;

                /**
                 * Creates a new Transceiver instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {mtws.tower.v1.Transceiver.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Transceiver} Transceiver instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Transceiver.$Shape): mtws.tower.v1.Transceiver & mtws.tower.v1.Transceiver.$Shape;
                 *   (properties?: mtws.tower.v1.Transceiver.$Properties): mtws.tower.v1.Transceiver;
                 * }}
                 */
                Transceiver.create = function(properties) {
                    return new Transceiver(properties);
                };

                /**
                 * Encodes the specified Transceiver message. Does not implicitly {@link mtws.tower.v1.Transceiver.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {mtws.tower.v1.Transceiver.$Properties} message Transceiver message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Transceiver.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.id);
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.frequency);
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.lat_deg);
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.lon_deg);
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.height_msl_m);
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.height_agl_m);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Transceiver message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Transceiver & mtws.tower.v1.Transceiver.$Shape} Transceiver
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Transceiver.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Transceiver();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 1)
                                    break;
                                message.id = reader.double();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.frequency = reader.double();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.lat_deg = reader.double();
                                continue;
                            }
                        case 4: {
                                if (wireType !== 1)
                                    break;
                                message.lon_deg = reader.double();
                                continue;
                            }
                        case 5: {
                                if (wireType !== 1)
                                    break;
                                message.height_msl_m = reader.double();
                                continue;
                            }
                        case 6: {
                                if (wireType !== 1)
                                    break;
                                message.height_agl_m = reader.double();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "id"))
                        throw $util.ProtocolError("missing required 'id'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "frequency"))
                        throw $util.ProtocolError("missing required 'frequency'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "lat_deg"))
                        throw $util.ProtocolError("missing required 'lat_deg'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "lon_deg"))
                        throw $util.ProtocolError("missing required 'lon_deg'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "height_msl_m"))
                        throw $util.ProtocolError("missing required 'height_msl_m'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "height_agl_m"))
                        throw $util.ProtocolError("missing required 'height_agl_m'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Transceiver message.
                 * @function verify
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Transceiver.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (typeof message.id !== "number")
                        return "id: number expected";
                    if (typeof message.frequency !== "number")
                        return "frequency: number expected";
                    if (typeof message.lat_deg !== "number")
                        return "lat_deg: number expected";
                    if (typeof message.lon_deg !== "number")
                        return "lon_deg: number expected";
                    if (typeof message.height_msl_m !== "number")
                        return "height_msl_m: number expected";
                    if (typeof message.height_agl_m !== "number")
                        return "height_agl_m: number expected";
                    return null;
                };

                /**
                 * Creates a Transceiver message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Transceiver} Transceiver
                 */
                Transceiver.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Transceiver)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Transceiver: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Transceiver();
                    if (object.id != null)
                        message.id = $Number(object.id);
                    if (object.frequency != null)
                        message.frequency = $Number(object.frequency);
                    if (object.lat_deg != null)
                        message.lat_deg = $Number(object.lat_deg);
                    if (object.lon_deg != null)
                        message.lon_deg = $Number(object.lon_deg);
                    if (object.height_msl_m != null)
                        message.height_msl_m = $Number(object.height_msl_m);
                    if (object.height_agl_m != null)
                        message.height_agl_m = $Number(object.height_agl_m);
                    return message;
                };

                /**
                 * Creates a plain object from a Transceiver message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Transceiver
                 * @static
                 * @param {mtws.tower.v1.Transceiver} message Transceiver
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Transceiver.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.id = 0;
                        object.frequency = 0;
                        object.lat_deg = 0;
                        object.lon_deg = 0;
                        object.height_msl_m = 0;
                        object.height_agl_m = 0;
                    }
                    if (message.id != null && $Object.hasOwnProperty.call(message, "id"))
                        object.id = options.json && !$isFinite(message.id) ? $String(message.id) : message.id;
                    if (message.frequency != null && $Object.hasOwnProperty.call(message, "frequency"))
                        object.frequency = options.json && !$isFinite(message.frequency) ? $String(message.frequency) : message.frequency;
                    if (message.lat_deg != null && $Object.hasOwnProperty.call(message, "lat_deg"))
                        object.lat_deg = options.json && !$isFinite(message.lat_deg) ? $String(message.lat_deg) : message.lat_deg;
                    if (message.lon_deg != null && $Object.hasOwnProperty.call(message, "lon_deg"))
                        object.lon_deg = options.json && !$isFinite(message.lon_deg) ? $String(message.lon_deg) : message.lon_deg;
                    if (message.height_msl_m != null && $Object.hasOwnProperty.call(message, "height_msl_m"))
                        object.height_msl_m = options.json && !$isFinite(message.height_msl_m) ? $String(message.height_msl_m) : message.height_msl_m;
                    if (message.height_agl_m != null && $Object.hasOwnProperty.call(message, "height_agl_m"))
                        object.height_agl_m = options.json && !$isFinite(message.height_agl_m) ? $String(message.height_agl_m) : message.height_agl_m;
                    return object;
                };

                /**
                 * Converts this Transceiver to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Transceiver
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Transceiver.prototype.toJSON = function() {
                    return Transceiver.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Transceiver;
            })();

            v1.Snapshot = (function() {

                /**
                 * Properties of a Snapshot.
                 * @typedef {Object} mtws.tower.v1.Snapshot.$Properties
                 * @property {Array.<mtws.tower.v1.AircraftMetadata.$Properties>|null} [aircraft] Snapshot aircraft
                 * @property {Array.<mtws.tower.v1.Motion.$Properties>|null} [motion] Snapshot motion
                 * @property {mtws.tower.v1.Camera.$Properties|null} [camera] Snapshot camera
                 * @property {boolean} simconnect_connected Snapshot simconnect_connected
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Snapshot.
                 * @memberof mtws.tower.v1
                 * @interface ISnapshot
                 * @augments mtws.tower.v1.Snapshot.$Properties
                 * @deprecated Use mtws.tower.v1.Snapshot.$Properties instead.
                 */

                /**
                 * Shape of a Snapshot.
                 * @typedef {mtws.tower.v1.Snapshot.$Properties} mtws.tower.v1.Snapshot.$Shape
                 */

                /**
                 * Constructs a new Snapshot.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Snapshot.
                 * @constructor
                 * @param {mtws.tower.v1.Snapshot.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Snapshot = function (properties) {
                    this.aircraft = [];
                    this.motion = [];
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Snapshot aircraft.
                 * @member {Array.<mtws.tower.v1.AircraftMetadata.$Properties>} aircraft
                 * @memberof mtws.tower.v1.Snapshot
                 * @instance
                 */
                Snapshot.prototype.aircraft = $util.emptyArray;

                /**
                 * Snapshot motion.
                 * @member {Array.<mtws.tower.v1.Motion.$Properties>} motion
                 * @memberof mtws.tower.v1.Snapshot
                 * @instance
                 */
                Snapshot.prototype.motion = $util.emptyArray;

                /**
                 * Snapshot camera.
                 * @member {mtws.tower.v1.Camera.$Properties|null|undefined} camera
                 * @memberof mtws.tower.v1.Snapshot
                 * @instance
                 */
                Snapshot.prototype.camera = null;

                /**
                 * Snapshot simconnect_connected.
                 * @member {boolean} simconnect_connected
                 * @memberof mtws.tower.v1.Snapshot
                 * @instance
                 */
                Snapshot.prototype.simconnect_connected = false;

                /**
                 * Creates a new Snapshot instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {mtws.tower.v1.Snapshot.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Snapshot} Snapshot instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Snapshot.$Shape): mtws.tower.v1.Snapshot & mtws.tower.v1.Snapshot.$Shape;
                 *   (properties?: mtws.tower.v1.Snapshot.$Properties): mtws.tower.v1.Snapshot;
                 * }}
                 */
                Snapshot.create = function(properties) {
                    return new Snapshot(properties);
                };

                /**
                 * Encodes the specified Snapshot message. Does not implicitly {@link mtws.tower.v1.Snapshot.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {mtws.tower.v1.Snapshot.$Properties} message Snapshot message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Snapshot.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    if (message.aircraft != null && message.aircraft.length)
                        for (let i = 0; i < message.aircraft.length; ++i)
                            $root.mtws.tower.v1.AircraftMetadata.encode(message.aircraft[i], writer.uint32(/* id 1, wireType 2 =*/10).fork(), _depth + 1).ldelim();
                    if (message.motion != null && message.motion.length)
                        for (let i = 0; i < message.motion.length; ++i)
                            $root.mtws.tower.v1.Motion.encode(message.motion[i], writer.uint32(/* id 2, wireType 2 =*/18).fork(), _depth + 1).ldelim();
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera"))
                        $root.mtws.tower.v1.Camera.encode(message.camera, writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.simconnect_connected);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Snapshot message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Snapshot & mtws.tower.v1.Snapshot.$Shape} Snapshot
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Snapshot.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Snapshot();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.aircraft && message.aircraft.length))
                                    message.aircraft = [];
                                message.aircraft.push($root.mtws.tower.v1.AircraftMetadata.decode(reader, reader.size(), $undefined, _depth + 1));
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                if (!(message.motion && message.motion.length))
                                    message.motion = [];
                                message.motion.push($root.mtws.tower.v1.Motion.decode(reader, reader.size(), $undefined, _depth + 1));
                                continue;
                            }
                        case 3: {
                                if (wireType !== 2)
                                    break;
                                message.camera = $root.mtws.tower.v1.Camera.decode(reader, reader.size(), $undefined, _depth + 1, message.camera);
                                continue;
                            }
                        case 4: {
                                if (wireType !== 0)
                                    break;
                                message.simconnect_connected = reader.bool();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "simconnect_connected"))
                        throw $util.ProtocolError("missing required 'simconnect_connected'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Snapshot message.
                 * @function verify
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Snapshot.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (message.aircraft != null && $Object.hasOwnProperty.call(message, "aircraft")) {
                        if (!$Array.isArray(message.aircraft))
                            return "aircraft: array expected";
                        for (let i = 0; i < message.aircraft.length; ++i) {
                            let error = $root.mtws.tower.v1.AircraftMetadata.verify(message.aircraft[i], _depth + 1);
                            if (error)
                                return "aircraft." + error;
                        }
                    }
                    if (message.motion != null && $Object.hasOwnProperty.call(message, "motion")) {
                        if (!$Array.isArray(message.motion))
                            return "motion: array expected";
                        for (let i = 0; i < message.motion.length; ++i) {
                            let error = $root.mtws.tower.v1.Motion.verify(message.motion[i], _depth + 1);
                            if (error)
                                return "motion." + error;
                        }
                    }
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera")) {
                        let error = $root.mtws.tower.v1.Camera.verify(message.camera, _depth + 1);
                        if (error)
                            return "camera." + error;
                    }
                    if (typeof message.simconnect_connected !== "boolean")
                        return "simconnect_connected: boolean expected";
                    return null;
                };

                /**
                 * Creates a Snapshot message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Snapshot} Snapshot
                 */
                Snapshot.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Snapshot)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Snapshot: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Snapshot();
                    if (object.aircraft) {
                        if (!$Array.isArray(object.aircraft))
                            throw $TypeError(".mtws.tower.v1.Snapshot.aircraft: array expected");
                        message.aircraft = $Array(object.aircraft.length);
                        for (let i = 0; i < object.aircraft.length; ++i) {
                            if (!$util.isObject(object.aircraft[i]))
                                throw $TypeError(".mtws.tower.v1.Snapshot.aircraft: object expected");
                            message.aircraft[i] = $root.mtws.tower.v1.AircraftMetadata.fromObject(object.aircraft[i], _depth + 1);
                        }
                    }
                    if (object.motion) {
                        if (!$Array.isArray(object.motion))
                            throw $TypeError(".mtws.tower.v1.Snapshot.motion: array expected");
                        message.motion = $Array(object.motion.length);
                        for (let i = 0; i < object.motion.length; ++i) {
                            if (!$util.isObject(object.motion[i]))
                                throw $TypeError(".mtws.tower.v1.Snapshot.motion: object expected");
                            message.motion[i] = $root.mtws.tower.v1.Motion.fromObject(object.motion[i], _depth + 1);
                        }
                    }
                    if (object.camera != null) {
                        if (!$util.isObject(object.camera))
                            throw $TypeError(".mtws.tower.v1.Snapshot.camera: object expected");
                        message.camera = $root.mtws.tower.v1.Camera.fromObject(object.camera, _depth + 1);
                    }
                    if (object.simconnect_connected != null)
                        message.simconnect_connected = $Boolean(object.simconnect_connected);
                    return message;
                };

                /**
                 * Creates a plain object from a Snapshot message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Snapshot
                 * @static
                 * @param {mtws.tower.v1.Snapshot} message Snapshot
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Snapshot.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.arrays || options.defaults) {
                        object.aircraft = [];
                        object.motion = [];
                    }
                    if (options.defaults) {
                        object.camera = null;
                        object.simconnect_connected = false;
                    }
                    if (message.aircraft && message.aircraft.length) {
                        object.aircraft = $Array(message.aircraft.length);
                        for (let j = 0; j < message.aircraft.length; ++j)
                            object.aircraft[j] = $root.mtws.tower.v1.AircraftMetadata.toObject(message.aircraft[j], options, _depth + 1);
                    }
                    if (message.motion && message.motion.length) {
                        object.motion = $Array(message.motion.length);
                        for (let j = 0; j < message.motion.length; ++j)
                            object.motion[j] = $root.mtws.tower.v1.Motion.toObject(message.motion[j], options, _depth + 1);
                    }
                    if (message.camera != null && $Object.hasOwnProperty.call(message, "camera"))
                        object.camera = $root.mtws.tower.v1.Camera.toObject(message.camera, options, _depth + 1);
                    if (message.simconnect_connected != null && $Object.hasOwnProperty.call(message, "simconnect_connected"))
                        object.simconnect_connected = message.simconnect_connected;
                    return object;
                };

                /**
                 * Converts this Snapshot to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Snapshot
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Snapshot.prototype.toJSON = function() {
                    return Snapshot.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Snapshot;
            })();

            v1.Move = (function() {

                /**
                 * Properties of a Move.
                 * @typedef {Object} mtws.tower.v1.Move.$Properties
                 * @property {number} lat Move lat
                 * @property {number} lon Move lon
                 * @property {number} alt Move alt
                 * @property {number} heading Move heading
                 * @property {number} pitch Move pitch
                 * @property {number} bank Move bank
                 * @property {number} cockpit_camera_zoom Move cockpit_camera_zoom
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Move.
                 * @memberof mtws.tower.v1
                 * @interface IMove
                 * @augments mtws.tower.v1.Move.$Properties
                 * @deprecated Use mtws.tower.v1.Move.$Properties instead.
                 */

                /**
                 * Shape of a Move.
                 * @typedef {mtws.tower.v1.Move.$Properties} mtws.tower.v1.Move.$Shape
                 */

                /**
                 * Constructs a new Move.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Move.
                 * @constructor
                 * @param {mtws.tower.v1.Move.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Move = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Move lat.
                 * @member {number} lat
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.lat = 0;

                /**
                 * Move lon.
                 * @member {number} lon
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.lon = 0;

                /**
                 * Move alt.
                 * @member {number} alt
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.alt = 0;

                /**
                 * Move heading.
                 * @member {number} heading
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.heading = 0;

                /**
                 * Move pitch.
                 * @member {number} pitch
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.pitch = 0;

                /**
                 * Move bank.
                 * @member {number} bank
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.bank = 0;

                /**
                 * Move cockpit_camera_zoom.
                 * @member {number} cockpit_camera_zoom
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 */
                Move.prototype.cockpit_camera_zoom = 0;

                /**
                 * Creates a new Move instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {mtws.tower.v1.Move.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Move} Move instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Move.$Shape): mtws.tower.v1.Move & mtws.tower.v1.Move.$Shape;
                 *   (properties?: mtws.tower.v1.Move.$Properties): mtws.tower.v1.Move;
                 * }}
                 */
                Move.create = function(properties) {
                    return new Move(properties);
                };

                /**
                 * Encodes the specified Move message. Does not implicitly {@link mtws.tower.v1.Move.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {mtws.tower.v1.Move.$Properties} message Move message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Move.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.lat);
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.lon);
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.alt);
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.heading);
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.pitch);
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.bank);
                    writer.uint32(/* id 7, wireType 1 =*/57).double(message.cockpit_camera_zoom);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Move message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Move & mtws.tower.v1.Move.$Shape} Move
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Move.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Move();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 1)
                                    break;
                                message.lat = reader.double();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 1)
                                    break;
                                message.lon = reader.double();
                                continue;
                            }
                        case 3: {
                                if (wireType !== 1)
                                    break;
                                message.alt = reader.double();
                                continue;
                            }
                        case 4: {
                                if (wireType !== 1)
                                    break;
                                message.heading = reader.double();
                                continue;
                            }
                        case 5: {
                                if (wireType !== 1)
                                    break;
                                message.pitch = reader.double();
                                continue;
                            }
                        case 6: {
                                if (wireType !== 1)
                                    break;
                                message.bank = reader.double();
                                continue;
                            }
                        case 7: {
                                if (wireType !== 1)
                                    break;
                                message.cockpit_camera_zoom = reader.double();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "lat"))
                        throw $util.ProtocolError("missing required 'lat'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "lon"))
                        throw $util.ProtocolError("missing required 'lon'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "alt"))
                        throw $util.ProtocolError("missing required 'alt'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "heading"))
                        throw $util.ProtocolError("missing required 'heading'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "pitch"))
                        throw $util.ProtocolError("missing required 'pitch'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "bank"))
                        throw $util.ProtocolError("missing required 'bank'", { instance: message });
                    if (!$Object.hasOwnProperty.call(message, "cockpit_camera_zoom"))
                        throw $util.ProtocolError("missing required 'cockpit_camera_zoom'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Move message.
                 * @function verify
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Move.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (typeof message.lat !== "number")
                        return "lat: number expected";
                    if (typeof message.lon !== "number")
                        return "lon: number expected";
                    if (typeof message.alt !== "number")
                        return "alt: number expected";
                    if (typeof message.heading !== "number")
                        return "heading: number expected";
                    if (typeof message.pitch !== "number")
                        return "pitch: number expected";
                    if (typeof message.bank !== "number")
                        return "bank: number expected";
                    if (typeof message.cockpit_camera_zoom !== "number")
                        return "cockpit_camera_zoom: number expected";
                    return null;
                };

                /**
                 * Creates a Move message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Move} Move
                 */
                Move.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Move)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Move: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Move();
                    if (object.lat != null)
                        message.lat = $Number(object.lat);
                    if (object.lon != null)
                        message.lon = $Number(object.lon);
                    if (object.alt != null)
                        message.alt = $Number(object.alt);
                    if (object.heading != null)
                        message.heading = $Number(object.heading);
                    if (object.pitch != null)
                        message.pitch = $Number(object.pitch);
                    if (object.bank != null)
                        message.bank = $Number(object.bank);
                    if (object.cockpit_camera_zoom != null)
                        message.cockpit_camera_zoom = $Number(object.cockpit_camera_zoom);
                    return message;
                };

                /**
                 * Creates a plain object from a Move message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Move
                 * @static
                 * @param {mtws.tower.v1.Move} message Move
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Move.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.lat = 0;
                        object.lon = 0;
                        object.alt = 0;
                        object.heading = 0;
                        object.pitch = 0;
                        object.bank = 0;
                        object.cockpit_camera_zoom = 0;
                    }
                    if (message.lat != null && $Object.hasOwnProperty.call(message, "lat"))
                        object.lat = options.json && !$isFinite(message.lat) ? $String(message.lat) : message.lat;
                    if (message.lon != null && $Object.hasOwnProperty.call(message, "lon"))
                        object.lon = options.json && !$isFinite(message.lon) ? $String(message.lon) : message.lon;
                    if (message.alt != null && $Object.hasOwnProperty.call(message, "alt"))
                        object.alt = options.json && !$isFinite(message.alt) ? $String(message.alt) : message.alt;
                    if (message.heading != null && $Object.hasOwnProperty.call(message, "heading"))
                        object.heading = options.json && !$isFinite(message.heading) ? $String(message.heading) : message.heading;
                    if (message.pitch != null && $Object.hasOwnProperty.call(message, "pitch"))
                        object.pitch = options.json && !$isFinite(message.pitch) ? $String(message.pitch) : message.pitch;
                    if (message.bank != null && $Object.hasOwnProperty.call(message, "bank"))
                        object.bank = options.json && !$isFinite(message.bank) ? $String(message.bank) : message.bank;
                    if (message.cockpit_camera_zoom != null && $Object.hasOwnProperty.call(message, "cockpit_camera_zoom"))
                        object.cockpit_camera_zoom = options.json && !$isFinite(message.cockpit_camera_zoom) ? $String(message.cockpit_camera_zoom) : message.cockpit_camera_zoom;
                    return object;
                };

                /**
                 * Converts this Move to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Move
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Move.prototype.toJSON = function() {
                    return Move.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Move;
            })();

            v1.Reset = (function() {

                /**
                 * Properties of a Reset.
                 * @typedef {Object} mtws.tower.v1.Reset.$Properties
                 * @property {number} reset Reset reset
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Reset.
                 * @memberof mtws.tower.v1
                 * @interface IReset
                 * @augments mtws.tower.v1.Reset.$Properties
                 * @deprecated Use mtws.tower.v1.Reset.$Properties instead.
                 */

                /**
                 * Shape of a Reset.
                 * @typedef {mtws.tower.v1.Reset.$Properties} mtws.tower.v1.Reset.$Shape
                 */

                /**
                 * Constructs a new Reset.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Reset.
                 * @constructor
                 * @param {mtws.tower.v1.Reset.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Reset = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Reset reset.
                 * @member {number} reset
                 * @memberof mtws.tower.v1.Reset
                 * @instance
                 */
                Reset.prototype.reset = 0;

                /**
                 * Creates a new Reset instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {mtws.tower.v1.Reset.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Reset} Reset instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Reset.$Shape): mtws.tower.v1.Reset & mtws.tower.v1.Reset.$Shape;
                 *   (properties?: mtws.tower.v1.Reset.$Properties): mtws.tower.v1.Reset;
                 * }}
                 */
                Reset.create = function(properties) {
                    return new Reset(properties);
                };

                /**
                 * Encodes the specified Reset message. Does not implicitly {@link mtws.tower.v1.Reset.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {mtws.tower.v1.Reset.$Properties} message Reset message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Reset.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.reset);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Reset message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Reset & mtws.tower.v1.Reset.$Shape} Reset
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Reset.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Reset();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.reset = reader.uint32();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "reset"))
                        throw $util.ProtocolError("missing required 'reset'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Reset message.
                 * @function verify
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Reset.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (!$util.isInteger(message.reset))
                        return "reset: integer expected";
                    return null;
                };

                /**
                 * Creates a Reset message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Reset} Reset
                 */
                Reset.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Reset)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Reset: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Reset();
                    if (object.reset != null)
                        message.reset = object.reset >>> 0;
                    return message;
                };

                /**
                 * Creates a plain object from a Reset message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Reset
                 * @static
                 * @param {mtws.tower.v1.Reset} message Reset
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Reset.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults)
                        object.reset = 0;
                    if (message.reset != null && $Object.hasOwnProperty.call(message, "reset"))
                        object.reset = message.reset;
                    return object;
                };

                /**
                 * Converts this Reset to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Reset
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Reset.prototype.toJSON = function() {
                    return Reset.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Reset;
            })();

            v1.Result = (function() {

                /**
                 * Properties of a Result.
                 * @typedef {Object} mtws.tower.v1.Result.$Properties
                 * @property {boolean} accepted Result accepted
                 * @property {string|null} [error] Result error
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Result.
                 * @memberof mtws.tower.v1
                 * @interface IResult
                 * @augments mtws.tower.v1.Result.$Properties
                 * @deprecated Use mtws.tower.v1.Result.$Properties instead.
                 */

                /**
                 * Shape of a Result.
                 * @typedef {mtws.tower.v1.Result.$Properties} mtws.tower.v1.Result.$Shape
                 */

                /**
                 * Constructs a new Result.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Result.
                 * @constructor
                 * @param {mtws.tower.v1.Result.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Result = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Result accepted.
                 * @member {boolean} accepted
                 * @memberof mtws.tower.v1.Result
                 * @instance
                 */
                Result.prototype.accepted = false;

                /**
                 * Result error.
                 * @member {string|null|undefined} error
                 * @memberof mtws.tower.v1.Result
                 * @instance
                 */
                Result.prototype.error = null;

                /**
                 * Creates a new Result instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {mtws.tower.v1.Result.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Result} Result instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Result.$Shape): mtws.tower.v1.Result & mtws.tower.v1.Result.$Shape;
                 *   (properties?: mtws.tower.v1.Result.$Properties): mtws.tower.v1.Result;
                 * }}
                 */
                Result.create = function(properties) {
                    return new Result(properties);
                };

                /**
                 * Encodes the specified Result message. Does not implicitly {@link mtws.tower.v1.Result.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {mtws.tower.v1.Result.$Properties} message Result message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Result.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.accepted);
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.error);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Result message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Result & mtws.tower.v1.Result.$Shape} Result
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Result.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Result();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.accepted = reader.bool();
                                continue;
                            }
                        case 2: {
                                if (wireType !== 2)
                                    break;
                                message.error = reader.string();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "accepted"))
                        throw $util.ProtocolError("missing required 'accepted'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Result message.
                 * @function verify
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Result.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (typeof message.accepted !== "boolean")
                        return "accepted: boolean expected";
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                        if (!$util.isString(message.error))
                            return "error: string expected";
                    return null;
                };

                /**
                 * Creates a Result message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Result} Result
                 */
                Result.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Result)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Result: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Result();
                    if (object.accepted != null)
                        message.accepted = $Boolean(object.accepted);
                    if (object.error != null)
                        message.error = $String(object.error);
                    return message;
                };

                /**
                 * Creates a plain object from a Result message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Result
                 * @static
                 * @param {mtws.tower.v1.Result} message Result
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Result.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults) {
                        object.accepted = false;
                        object.error = "";
                    }
                    if (message.accepted != null && $Object.hasOwnProperty.call(message, "accepted"))
                        object.accepted = message.accepted;
                    if (message.error != null && $Object.hasOwnProperty.call(message, "error"))
                        object.error = message.error;
                    return object;
                };

                /**
                 * Converts this Result to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Result
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Result.prototype.toJSON = function() {
                    return Result.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Result;
            })();

            v1.Status = (function() {

                /**
                 * Properties of a Status.
                 * @typedef {Object} mtws.tower.v1.Status.$Properties
                 * @property {boolean} simconnect_connected Status simconnect_connected
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Status.
                 * @memberof mtws.tower.v1
                 * @interface IStatus
                 * @augments mtws.tower.v1.Status.$Properties
                 * @deprecated Use mtws.tower.v1.Status.$Properties instead.
                 */

                /**
                 * Shape of a Status.
                 * @typedef {mtws.tower.v1.Status.$Properties} mtws.tower.v1.Status.$Shape
                 */

                /**
                 * Constructs a new Status.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Status.
                 * @constructor
                 * @param {mtws.tower.v1.Status.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Status = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Status simconnect_connected.
                 * @member {boolean} simconnect_connected
                 * @memberof mtws.tower.v1.Status
                 * @instance
                 */
                Status.prototype.simconnect_connected = false;

                /**
                 * Creates a new Status instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {mtws.tower.v1.Status.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Status} Status instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Status.$Shape): mtws.tower.v1.Status & mtws.tower.v1.Status.$Shape;
                 *   (properties?: mtws.tower.v1.Status.$Properties): mtws.tower.v1.Status;
                 * }}
                 */
                Status.create = function(properties) {
                    return new Status(properties);
                };

                /**
                 * Encodes the specified Status message. Does not implicitly {@link mtws.tower.v1.Status.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {mtws.tower.v1.Status.$Properties} message Status message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Status.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.simconnect_connected);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Status message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Status & mtws.tower.v1.Status.$Shape} Status
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Status.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Status();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.simconnect_connected = reader.bool();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "simconnect_connected"))
                        throw $util.ProtocolError("missing required 'simconnect_connected'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Status message.
                 * @function verify
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Status.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (typeof message.simconnect_connected !== "boolean")
                        return "simconnect_connected: boolean expected";
                    return null;
                };

                /**
                 * Creates a Status message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Status} Status
                 */
                Status.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Status)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Status: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Status();
                    if (object.simconnect_connected != null)
                        message.simconnect_connected = $Boolean(object.simconnect_connected);
                    return message;
                };

                /**
                 * Creates a plain object from a Status message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Status
                 * @static
                 * @param {mtws.tower.v1.Status} message Status
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Status.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults)
                        object.simconnect_connected = false;
                    if (message.simconnect_connected != null && $Object.hasOwnProperty.call(message, "simconnect_connected"))
                        object.simconnect_connected = message.simconnect_connected;
                    return object;
                };

                /**
                 * Converts this Status to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Status
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Status.prototype.toJSON = function() {
                    return Status.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Status;
            })();

            v1.Heartbeat = (function() {

                /**
                 * Properties of a Heartbeat.
                 * @typedef {Object} mtws.tower.v1.Heartbeat.$Properties
                 * @property {boolean} reply Heartbeat reply
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */

                /**
                 * Properties of a Heartbeat.
                 * @memberof mtws.tower.v1
                 * @interface IHeartbeat
                 * @augments mtws.tower.v1.Heartbeat.$Properties
                 * @deprecated Use mtws.tower.v1.Heartbeat.$Properties instead.
                 */

                /**
                 * Shape of a Heartbeat.
                 * @typedef {mtws.tower.v1.Heartbeat.$Properties} mtws.tower.v1.Heartbeat.$Shape
                 */

                /**
                 * Constructs a new Heartbeat.
                 * @memberof mtws.tower.v1
                 * @classdesc Represents a Heartbeat.
                 * @constructor
                 * @param {mtws.tower.v1.Heartbeat.$Properties=} [properties] Properties to set
                 * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
                 */
                const Heartbeat = function (properties) {
                    if (properties)
                        for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null && keys[i] !== "__proto__")
                                this[keys[i]] = properties[keys[i]];
                };

                /**
                 * Heartbeat reply.
                 * @member {boolean} reply
                 * @memberof mtws.tower.v1.Heartbeat
                 * @instance
                 */
                Heartbeat.prototype.reply = false;

                /**
                 * Creates a new Heartbeat instance using the specified properties.
                 * @function create
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {mtws.tower.v1.Heartbeat.$Properties=} [properties] Properties to set
                 * @returns {mtws.tower.v1.Heartbeat} Heartbeat instance
                 * @type {{
                 *   (properties: mtws.tower.v1.Heartbeat.$Shape): mtws.tower.v1.Heartbeat & mtws.tower.v1.Heartbeat.$Shape;
                 *   (properties?: mtws.tower.v1.Heartbeat.$Properties): mtws.tower.v1.Heartbeat;
                 * }}
                 */
                Heartbeat.create = function(properties) {
                    return new Heartbeat(properties);
                };

                /**
                 * Encodes the specified Heartbeat message. Does not implicitly {@link mtws.tower.v1.Heartbeat.verify|verify} messages.
                 * @function encode
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {mtws.tower.v1.Heartbeat.$Properties} message Heartbeat message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Heartbeat.encode = function (message, writer, _depth) {
                    if (!writer)
                        writer = $Writer.create();
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.reply);
                    if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                        for (let i = 0; i < message.$unknowns.length; ++i)
                            writer.raw(message.$unknowns[i]);
                    return writer;
                };

                /**
                 * Decodes a Heartbeat message from the specified reader or buffer.
                 * @function decode
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {mtws.tower.v1.Heartbeat & mtws.tower.v1.Heartbeat.$Shape} Heartbeat
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Heartbeat.decode = function (reader, length, _end, _depth, _target) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $Reader.recursionLimit)
                        throw $Error("max depth exceeded");
                    let end, message;
                    if (length === $undefined)
                        end = reader.len;
                    else {
                        end = reader.pos + length;
                        if (end > reader.len)
                            throw $RangeError("index out of range");
                        length = reader.len;
                        reader.len = end;
                    }
                    message = _target || new $root.mtws.tower.v1.Heartbeat();
                    while (reader.pos < end) {
                        let start = reader.pos;
                        let tag = reader.tag();
                        if (tag === _end) {
                            _end = $undefined;
                            break;
                        }
                        let wireType = tag & 7;
                        switch (tag >>>= 3) {
                        case 1: {
                                if (wireType !== 0)
                                    break;
                                message.reply = reader.bool();
                                continue;
                            }
                        }
                        reader.skipType(wireType, _depth, tag);
                        if (!reader.discardUnknown) {
                            $util.makeProp(message, "$unknowns", false);
                            (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                        }
                    }
                    if (length !== $undefined) {
                        if (reader.pos !== end)
                            throw $RangeError("index out of range");
                        reader.len = length;
                    }
                    if (_end !== $undefined)
                        throw $Error("missing end group");
                    if (!$Object.hasOwnProperty.call(message, "reply"))
                        throw $util.ProtocolError("missing required 'reply'", { instance: message });
                    return message;
                };

                /**
                 * Verifies a Heartbeat message.
                 * @function verify
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Heartbeat.verify = function (message, _depth) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        return "max depth exceeded";
                    if (typeof message.reply !== "boolean")
                        return "reply: boolean expected";
                    return null;
                };

                /**
                 * Creates a Heartbeat message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {mtws.tower.v1.Heartbeat} Heartbeat
                 */
                Heartbeat.fromObject = function (object, _depth) {
                    if (object instanceof $root.mtws.tower.v1.Heartbeat)
                        return object;
                    if (!$util.isObject(object))
                        throw $TypeError(".mtws.tower.v1.Heartbeat: object expected");
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let message = new $root.mtws.tower.v1.Heartbeat();
                    if (object.reply != null)
                        message.reply = $Boolean(object.reply);
                    return message;
                };

                /**
                 * Creates a plain object from a Heartbeat message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof mtws.tower.v1.Heartbeat
                 * @static
                 * @param {mtws.tower.v1.Heartbeat} message Heartbeat
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Heartbeat.toObject = function (message, options, _depth) {
                    if (!options)
                        options = {};
                    if (_depth === $undefined)
                        _depth = 0;
                    if (_depth > $util.recursionLimit)
                        throw $Error("max depth exceeded");
                    let object = {};
                    if (options.defaults)
                        object.reply = false;
                    if (message.reply != null && $Object.hasOwnProperty.call(message, "reply"))
                        object.reply = message.reply;
                    return object;
                };

                /**
                 * Converts this Heartbeat to JSON.
                 * @function toJSON
                 * @memberof mtws.tower.v1.Heartbeat
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Heartbeat.prototype.toJSON = function() {
                    return Heartbeat.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Heartbeat;
            })();

            return v1;
        })();

        return tower;
    })();

    return mtws;
})();

export {
  $root as default
};
