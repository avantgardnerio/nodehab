const commandClass = 113;
const propertyKey = `Motion sensor status`;

module.exports = async (driver, config, notify, db, opts) => {
    let currentState;
    
    const sensorId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.sensorName));
    const sensor = driver.controller.nodes.get(sensorId);
    console.log(`${opts.sensorName}=${sensorId}`);

    const update = async (newState) => {
        if(newState > 0) {
            try {
                await notify(`Motion detected at ${opts.sensorName}`);
            } catch(ex) {
                console.error(`Error sending notification!`, ex);
            }
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

