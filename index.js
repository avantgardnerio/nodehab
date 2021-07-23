const { Driver } = require("zwave-js");
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const driver = new Driver("/dev/ttyACM0");
driver.on("error", (e) => {
    console.error(e); // You must add a handler for the error event before starting the driver
});

app.use(bodyParser());
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

app.post('/nodes/exclude', async (req, res) => {
    const result = await driver.controller.beginExclusion();
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(result, null, 3));
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

app.put('/api/nodes/:id', async (req, res) => {
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    const row = req.body;
    console.log(row);
    node.setValue({
        commandClass: row.commandClass,
        endpoint: row.endpoint,
        property: row.property,
        propertyKey: row.propertyKey,
    }, parseInt(row.val));
});

// https://zwave-js.github.io/node-zwave-js/#/getting-started/quickstart
(async () => {
    driver.once("driver ready", () => {
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
