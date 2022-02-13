const commandClass = 102;
const property = `currentState`;

module.exports = async (driver, config, notify, db, opts) => {
    let timeout;
    let currentState;

    const deviceId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.doorName));
    const device = driver.controller.nodes.get(deviceId);
    console.log(`garageDoorId=${deviceId}`);

    const update = async (newState) => {
        currentState = newState;
        if(currentState === 0) { // 0=closed
            if(timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }
            return; // Don't care
        }
        timeout = setTimeout(async () => {
            await notify(`${opts.doorName} has been open for ${opts.notifyThreshold} seconds`);
        }, opts.notifyThreshold * 1000);
    }
    await update(await device.getValue({ commandClass, property }));

    return {
        valueUpdated: async (node, args) => {
            if(node.nodeId !== device.nodeId || args.commandClass !== commandClass || args.property !== property) return;
            await update(args.newValue);
        }    
    }
}

