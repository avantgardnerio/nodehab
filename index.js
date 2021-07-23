const { Driver } = require("zwave-js");
const express = require('express')
const app = express()

const driver = new Driver("/dev/ttyACM0");
driver.on("error", (e) => {
    console.error(e); // You must add a handler for the error event before starting the driver
});

app.use(express.static('node_modules'))
app.use(express.static('public'))

app.get('/api/nodes', async (req, res) => {
    const nodes = [];
    for(let id of driver.controller.nodes.keys()) {
        const node = driver.controller.nodes.get(id);
        nodes.push({
            id: node.id,
            deviceClass: node.deviceClass.specific.label,
        });
    }

    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(nodes, null, 3));
});

app.get('/api/nodes/:id', async (req, res) => {
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    const values = node.getDefinedValueIDs().map(it => {
        try {
            const val = node.getValue(it);
            return {...it, val};
        } catch (ex) {
            return {...it};
        }
    });

    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(values, null, 3));
});

// https://zwave-js.github.io/node-zwave-js/#/getting-started/quickstart
(async () => {
    driver.once("driver ready", () => {
        for(let id of driver.controller.nodes.keys()) {
            const node = driver.controller.nodes.get(id);
            if(id === 5) {
                // node.setValue({
                //     commandClass: 67,
                //     endpoint: 0,
                //     property: 'setpoint',
                //     propertyKey: 2,
                // }, 73);
            }
        }
    });
    await driver.start();

    process.on('exit', function () {
        console.log('Destroying driver...');
        driver.destroy();
        console.log('Destroyed');
    });
    console.log('Registered shutdown hook.');
})();

app.listen(3001)
