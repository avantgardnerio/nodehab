const { Driver } = require("zwave-js");
const express = require('express')
const app = express()

const nodes = [];

app.get('/nodes', async (req, res) => {
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(nodes, null, 3));
});

// https://zwave-js.github.io/node-zwave-js/#/getting-started/quickstart
(async () => {
    const driver = new Driver("/dev/ttyACM0");
    driver.on("error", (e) => {
        console.error(e); // You must add a handler for the error event before starting the driver
    });
    driver.once("driver ready", () => {
        driver.controller.nodes.forEach((node) => {
            //console.log(node);
            // e.g. add event handlers to all known nodes
        });

        for(let id of driver.controller.nodes.keys()) {
            const node = driver.controller.nodes.get(id);
            if(id === 5) {
                node.setValue({
                    commandClass: 67,
                    endpoint: 0,
                    property: 'setpoint',
                    propertyKey: 2,
                }, 73);
            }
            const values = node.getDefinedValueIDs().map(it => {
                const valueId = {
                    commandClass: it.commandClass,
                    property: it.property,
                };
                const val = node.getValue(valueId);
                return {...it, val};
            });
            node.once("ready", async () => {
                nodes.push({
                    id,
                    deviceClass: node.deviceClass.specific.label,
                    values,
                });
                // e.g. perform a BasicCC::Set with target value 50
                // await node.commandClasses.Basic.set(50);
            });
        }
    });
    await driver.start();
})();

// driver.destroy();

app.listen(3001)
