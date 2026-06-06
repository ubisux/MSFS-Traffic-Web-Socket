import type { SimAircraftEntry, CameraJson } from "../shared/types.ts";

export const simAircraftMap = new Map<number, SimAircraftEntry>();

export const cameraJson: { current: CameraJson } = {
  current: {
    gameplay_pitch_yaw_0: undefined,
    gameplay_pitch_yaw_1: undefined,
    camera_state: undefined,
    camera_view_type_and_index_0: undefined,
    camera_view_type_and_index_1: undefined,
    cockpit_camera_zoom: undefined,
    aircraft_latitude: undefined,
    aircraft_longitude: undefined,
    aircraft_altitude: undefined,
    aircraft_heading: undefined,
    aircraft_pitch: undefined,
  },
};
