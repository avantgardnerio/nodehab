# nodehab

A thin expresjs & vue app wrapper around zwave-js for home automation with a Raspberry PI and a zwave dongle.
               
## installation

```sh
sudo apt-get install -y postgresql
git clone
npm install
```

Set environment variables needed by `database.json` or use a `.env` file.

## config format

```json
{
  "controllerAddress": "/dev/ttyUSB0",
  "networkKey": "DEADBEAFDEADBEAFDEADBEAFDEADBEAF",
  "nodes": {
    "2": "Master bath fan",
    "4": "Master bath sensor",
    "5": "Thermostat",
    "6": "Main bath fan",
    "16": "Back lock",
    "7": "Back Door",
    "19": "Garage Window",
    "18": "Deck sensor",
    "17": "Keg sensor",
    "15": "Front lock",
    "20": "Front door",
    "13": "Main bath sensor",
    "21": "Ground floor sensor"
  },
  "dashboard": [
    { "name": "Front lock", "driver": "zwave", "node": 15, "commandClass": 98, "endpoint": 0, "type": "switch", "read": "currentMode", "write": "targetMode",
      "trueValue": 255,
      "falseValue": 0
    },
    { "name": "Front door", "driver": "zwave", "node": 20, "commandClass": 48, "endpoint": 0, "type": "switch", "read": "Any",
      "trueValue": false,
      "falseValue": true
    },
    { "name": "Back lock", "driver": "zwave", "node": 16, "commandClass": 98, "endpoint": 0, "type": "switch", "read": "currentMode", "write": "targetMode",
      "trueValue": 255,
      "falseValue": 0
    },
    { "name": "Back door", "driver": "zwave", "node": 7, "commandClass": 48, "endpoint": 0, "type": "switch", "read": "Any",
      "trueValue": false,
      "falseValue": true
    },
    { "name": "Ground floor temp", "driver": "zwave", "node": 21, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" },
    { "name": "Garage window", "driver": "zwave", "node": 19, "commandClass": 48, "endpoint": 0, "type": "switch", "read": "Any",
      "trueValue": false,
      "falseValue": true
    },
    { "name": "A/C Mode", "driver": "zwave", "node": 5, "commandClass": 64, "endpoint": 0, "type": "radio",
      "read": "mode", "write": "mode",
      "options": [{"value": 0, "text":  "off"}, {"value": 1, "text": "heat"}, {"value": 2, "text": "cool"}]
    },
    { "name": "Main temp", "driver": "zwave", "node": 5, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" },
    { "name": "Main bath temp", "driver": "zwave", "node": 13, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" },
    { "name": "Main bath humidity", "driver": "zwave", "node": 13, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Humidity" },
    { "name": "Main bath fan", "driver": "zwave", "node": 6, "commandClass": 37, "endpoint": 0, "type": "switch", "read": "currentValue", "write": "targetValue"},
    { "name": "Master bath temp", "driver": "zwave", "node": 4, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" },
    { "name": "Master bath humidity", "driver": "zwave", "node": 4, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Humidity" },
    { "name": "Master bath fan", "driver": "zwave", "node": 2, "commandClass": 37, "endpoint": 0, "type": "switch", "read": "currentValue", "write": "targetValue"},
    { "name": "Deck temp", "driver": "zwave", "node": 18, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" },
    { "name": "Keg temp", "driver": "zwave", "node": 17, "commandClass": 49, "endpoint": 0, "type": "int", "read": "Air temperature" }
  ]
}
```

## creating migrations

```sh
npm run db-migrate -- create <my-name> --sql-file
```

## running migrations

```sh
npm run db-migrate -- up
```
