const commandClass = 113;
const propertyKey = `Door state`;
const stateNames = {
    "22": "open",
    "23": "closed",
};

module.exports = async (driver, config, notify, db, opts) => {
    let currentState;

    if(!opts.enabled) return;
    
    const sensorId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.sensorName));
    const sensor = driver.controller.nodes.get(sensorId);
    console.log(`${opts.sensorName}=${sensorId}`);

    const update = async (newState) => {
        const stateName = stateNames[newState];
        if(stateName !== 'open') return;
        try {
            await notify(`${opts.sensorName} is ${stateName}`);
        } catch(ex) {
            console.error(`Error sending notification!`, ex);
        }
        currentState = newState;
    };
    update(await sensor.getValue({ commandClass, property: propertyKey }));

    return {
        valueUpdated: async (node, args) => {
            if(node.nodeId !== sensor.nodeId) return;
            console.log(args)
            if(args.commandClass !== commandClass || args.propertyKey !== propertyKey) return;
            await update(args.newValue);
        },
    }
}

