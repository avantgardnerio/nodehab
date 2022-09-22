const modeCommandClass = 64;
const temperatureCommandClass = 67;
const thermometerCommandClass = 49;
const thermometerProperty = `Air temperature`;

const modes = {
    off: 0,
    heat: 1,
    cool: 2,
};

module.exports = async (driver, config, notify, db, opts) => {
    const deviceId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.deviceName));
    const device = driver.controller.nodes.get(deviceId);
    console.log(`Thermostat=${deviceId}`);

    const update = async (temp) => {
        const mode = await device.getValue({ commandClass: modeCommandClass, endpoint: 0, property: "mode" });
        if(temp > opts.max && mode !== modes.cool) {
            console.log(`${temp} exceeded temperature threshold, setting A/C to 'cool'...`);
            await device.setValue({commandClass: modeCommandClass, property: "mode"}, modes.cool);
        }
        if(temp < opts.min && mode !== modes.heat) {
            console.log(`${temp} exceeded temperature threshold, setting A/C to 'heat'...`);
            await device.setValue({commandClass: modeCommandClass, property: "mode"}, modes.heat);
        }
    };
    update(await device.getValue({ commandClass: thermometerCommandClass, property: thermometerProperty }));

    return {
        valueUpdated: async (node, args) => {
            if(node.nodeId !== device.nodeId) return;
            if(args.commandClass !== thermometerCommandClass) return;
            if(args.property !== thermometerProperty) return;
            await update(args.newValue);
        },
    }
}

