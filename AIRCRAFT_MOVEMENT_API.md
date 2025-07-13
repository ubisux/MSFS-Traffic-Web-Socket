# Aircraft Movement API

The Aircraft Movement API allows external applications to control the user aircraft's position in Microsoft Flight Simulator through HTTP POST requests.

## Overview

The API runs on port 8081 and provides endpoints to:
- Set aircraft position (latitude, longitude, altitude, heading)
- Check server health status

## Endpoints

### POST /move
Sets the aircraft position to the specified coordinates.

**Request Body (JSON):**
```json
{
    "lat": 40.7128,    // Latitude in degrees (-90 to 90)
    "lon": -74.0060,   // Longitude in degrees (-180 to 180)
    "alt": 5000,       // Altitude in feet (-1000 to 100000)
    "heading": 90       // Heading in degrees (0 to 360)
}
```

**Response (200 OK):**
```json
{
    "status": "success",
    "message": "Aircraft movement command received",
    "data": {
        "lat": 40.7128,
        "lon": -74.0060,
        "alt": 5000,
        "heading": 90
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "Latitude must be between -90 and 90 degrees"
}
```

### GET /health
Returns the health status of the aircraft movement server.

**Response (200 OK):**
```json
{
    "status": "healthy",
    "service": "aircraft_movement",
    "port": 8081
}
```

## Usage Examples

### Python Example
```python
import requests

# Move aircraft to New York City
data = {
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 5000,
    "heading": 90
}

response = requests.post("http://localhost:8081/move", json=data)
if response.status_code == 200:
    print("Aircraft position set successfully")
else:
    print(f"Error: {response.json()}")
```

### cURL Example
```bash
curl -X POST http://localhost:8081/move \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 5000,
    "heading": 90
  }'
```

### JavaScript Example
```javascript
const data = {
    lat: 40.7128,
    lon: -74.0060,
    alt: 5000,
    heading: 90
};

fetch('http://localhost:8081/move', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => console.log('Success:', result))
.catch(error => console.error('Error:', error));
```

## Validation Rules

The API validates all input data:

- **Latitude**: Must be between -90 and 90 degrees
- **Longitude**: Must be between -180 and 180 degrees
- **Altitude**: Must be between -1000 and 100,000 feet
- **Heading**: Must be between 0 and 360 degrees

## Integration with SimConnect

The aircraft movement API integrates with the existing SimConnect bridge:

1. **HTTP Server**: Runs on port 8081 and accepts POST requests
2. **Data Processing**: Validates and queues movement commands
3. **SimConnect Integration**: Uses `SimConnect_SetDataOnSimObject` to set aircraft position
4. **Thread Safety**: Uses mutexes to ensure thread-safe operation

## Building and Running

1. **Build the project:**
   ```bash
   cd src
   mkdir -p ../build
   cmake -B ../build .
   cmake --build ../build
   ```

2. **Run the SimConnect bridge:**
   ```bash
   cd ../build
   ./simconnect_bridge.exe
   ```

3. **Test the API:**
   ```bash
   python test_aircraft_movement.py
   ```

## Notes

- The API controls the user aircraft (SimObject ID 1)
- Position changes are applied immediately
- The server runs alongside the main SimConnect bridge
- CORS headers are included for web browser compatibility
- All coordinates are in degrees (not radians)
- Altitude is in feet above sea level
- Heading is in degrees (0 = North, 90 = East, 180 = South, 270 = West)

## Troubleshooting

1. **Server not responding**: Make sure the SimConnect bridge is running
2. **Invalid coordinates**: Check that lat/lon values are within valid ranges
3. **SimConnect errors**: Ensure Microsoft Flight Simulator is running
4. **Port conflicts**: Verify port 8081 is not in use by another application 