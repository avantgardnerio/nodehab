const thermostatCommandClass = 64;
const temperatureCommandClass = 67;
const thermometerCommandClass = 49;
const thermometerProperty = `Air temperature`;

const modes = {
    off: 0,
    heat: 1,
    cool: 2,
};

module.exports = async (driver, config, notify, db, opts) => {
    const thermometerId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.thermometer));
    const thermometer = driver.controller.nodes.get(thermometerId);
    const thermostatId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.thermostat));
    const thermostat = driver.controller.nodes.get(thermostatId);
    console.log(`Thermostat=${thermostatId} thermometerId=${thermometerId}`);

    const update = async (temp) => {
        const mode = await thermostat.getValue({ commandClass: thermostatCommandClass, endpoint: 0, property: "mode" });
        if(temp > opts.max && mode !== modes.cool) {
            console.log(`${opts.thermometer} exceeded temperature threshold ${temp}, setting A/C to 'cool'...`);
            await thermostat.setValue({commandClass: thermostatCommandClass, property: "mode"}, modes.cool);
        }
        if(temp < opts.min && mode !== modes.heat) {
            console.log(`${opts.thermometer} exceeded temperature threshold ${temp}, setting A/C to 'heat'...`);
            await thermostat.setValue({commandClass: thermostatCommandClass, property: "mode"}, modes.heat);
        }
    };
    update(await thermostat.getValue({ commandClass: thermometerCommandClass, property: thermometerProperty }));

    return {
        valueUpdated: async (node, args) => {
            if(node.nodeId !== thermometer.nodeId) return;
            if(args.commandClass !== thermometerCommandClass) return;
            if(args.property !== thermometerProperty) return;
            await update(args.newValue);
        },
    }
}

