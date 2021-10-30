const { Driver } = require("zwave-js");
const webPush = require("web-push");
const fs = require('fs');
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const initOptions = {};
const pgp = require('pg-promise')(initOptions);
const con = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS,
    allowExitOnIdle: true,
};
const db = pgp(con);

const config = JSON.parse(fs.readFileSync('./data/config.json'));
const networkKey = Buffer.from(config.networkKey, "hex");
const options = {
    networkKey,
};

if(!config.vapidKeys) {
    const vapidKeys = webPush.generateVAPIDKeys();
    console.log(JSON.stringify(vapidKeys, null, 3));
    process.exit(-1);
} else {
    webPush.setVapidDetails(config.url, config.vapidKeys.publicKey, config.vapidKeys.privateKey);
}

const plugins = [];
const files = fs.readdirSync('plugins');

let ready = false;
const driver = new Driver(config.controllerAddress, options);
driver.on("error", (e) => {
    console.error(e); // You must add a handler for the error event before starting the driver
});

app.use(bodyParser());
app.use(express.static('node_modules'))
app.use(express.static('public'));

app.get('/api/vapid/publicKey', (req, res) => {
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(config.vapidKeys.publicKey, null, 3));
});

app.post('/api/push/register', async (req, res) => {
    console.log(JSON.stringify(req.body, null, 3))
    await db.none('insert into subscriptions (subscription) values ($1) on conflict do nothing;',
        [JSON.stringify(req.body)]
    );
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(true, null, 3));
})

app.get('/api/nodes', async (req, res) => {
    const nodes = [];

    if(ready) {
        for(let id of driver.controller.nodes.keys()) {
            const node = driver.controller.nodes.get(id);
            nodes.push({
                id: node.id,
                nickname: config.nodes[id],
                deviceClass: node.deviceClass.specific.label,
            });
        }
    }

    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(nodes, null, 3));
});

app.post('/nodes/heal', async (req, res) => {
    const result = await driver.controller.beginHealingNetwork();
    res.header("Content-Type",'application/json');
    console.log(`Healing: `, result);
    res.send(JSON.stringify(result, null, 3));
});

app.post('/nodes/exclude', async (req, res) => {
    const result = await driver.controller.beginExclusion();
    res.header("Content-Type",'application/json');
    console.log(`Excluding: `, result);
    res.send(JSON.stringify(result, null, 3));
});

app.post('/nodes/include', async (req, res) => {
    const result = await driver.controller.beginInclusion(false);
    res.header("Content-Type",'application/json');
    console.log(`Including: `, result);
    res.send(JSON.stringify(result, null, 3));
});

app.get('/api/nodes/:id', async (req, res) => {
    try {
        const node = driver.controller.nodes.get(parseInt(req.params.id));
        const values = node.getDefinedValueIDs().map(it => {
            try {
                const val = node.getValue(it);
                return {...it, val};
            } catch (ex) {
                return {...it};
            }
        });

        res.header("Content-Type", 'application/json');
        res.send(JSON.stringify(values, null, 3));
    } catch(ex) {
        console.error('Error in /api/nodes/:id', ex);
        res.status(ex.status || 500).send({error: ex.message})
    }
});

app.get('/api/nodes/:id/failed', async (req, res) => {
    console.log(`Checking if node ${req.params.id} failed...`);
    const isFailed = await driver.controller.isFailedNode(req.params.id);
    console.log(`Node ${req.params.id} failed: ${isFailed}`);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(isFailed, null, 3));
});

app.get('/api/nodes/:id/refreshValues', async (req, res) => {
    console.log(`Refreshing values ${req.params.id}...`);
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    await node.refreshValues();
    console.log(`Values for ${req.params.id} refreshed!`);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(true, null, 3));
});

app.get('/api/nodes/:id/refreshInfo', async (req, res) => {
    console.log(`Refreshing info ${req.params.id}...`);
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    await node.refreshInfo();
    console.log(`Info for ${req.params.id} refreshed!`);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(true, null, 3));
});

app.get('/api/nodes/:id/ping', async (req, res) => {
    console.log(`Pinging node ${req.params.id}...`);
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    //await node.refreshInfo();
    const result = await node.ping();
    console.log(`Node ${req.params.id} pinged=${result}!`);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(result, null, 3));
});

app.get('/api/nodes/:id/heal', async (req, res) => {
    console.log(`Healing node ${req.params.id}...`);
    const result = await driver.controller.healNode(parseInt(req.params.id));
    console.log(`Node ${req.params.id} heal=${result}!`);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(result, null, 3));
});

app.put('/api/nodes/:id/values', async (req, res) => {
    try {
        const row = req.body;
        const val = {
            commandClass: row.commandClass,
            endpoint: row.endpoint,
            property: row.property,
        };
        console.log(`Polling node ${req.params.id} value ${JSON.stringify(val, null, 3)}...`);
        const node = driver.controller.nodes.get(parseInt(req.params.id));
        const result = await node.pollValue(val);
        console.log(`Node ${req.params.id} poll result=${result}!`);
        res.header("Content-Type", 'application/json');
        res.send(JSON.stringify(result, null, 3));
    } catch(ex) {
        console.error('Error in /api/nodes/:id/values', ex);
        res.status(ex.status || 500).send({error: ex.message})
    }
});
                                                                                                                        
app.post('/api/nodes/:id/remove', async (req, res) => {
    const nodeId = parseInt(req.params.id);                              
    console.log(`Removing node ${req.params.id}...`);
    const result = await driver.controller.removeFailedNode(nodeId);
    res.header("Content-Type",'application/json');
    console.log(`Remove node result: `, result);
    res.send(JSON.stringify(result, null, 3));
});

app.put('/api/nodes/:id', async (req, res) => {
    const node = driver.controller.nodes.get(parseInt(req.params.id));
    const row = req.body;
    console.log(`${new Date()} setting ${row.commandClass} ${row.prop} to ${row.val}`);
    await node.setValue({
        commandClass: row.commandClass,
        endpoint: row.endpoint,
        property: row.property,
        propertyKey: row.propertyKey,
    }, row.val);
    res.send(JSON.stringify(true));
});

app.get('/api/dashboard', async (req, res) => {
    try {
        const dashboard = config.dashboard.map(it => ({...it}));
        for (let obj of dashboard) {
            if (obj.driver === 'zwave') {
                const node = driver.controller.nodes.get(obj.node);
                if (obj.read) {
                    obj.current = await node.getValue({
                        commandClass: obj.commandClass,
                        endpoint: obj.endpoint,
                        property: obj.read
                    });
                }
                if (obj.write) {
                    obj.target = await node.getValue({
                        commandClass: obj.commandClass,
                        endpoint: obj.endpoint,
                        property: obj.write
                    });
                }
            }
        }
        res.header("Content-Type", 'application/json');
        res.send(JSON.stringify(dashboard));
    } catch(ex) {
        console.error('/api/dashboard', ex);
        return res.status(500).json({ error: ex.toString() });
    }
});

app.use((error, req, res, next) => {
    return res.status(500).json({ error: error.toString() });
});

// https://zwave-js.github.io/node-zwave-js/#/getting-started/quickstart
(async () => {
    driver.once("driver ready", async () => {
        ready = true;

        // initialize plugins
        for(let file of files) {
            try {
                const Plugin = require(`./plugins/${file}`);
                const instance = new Plugin(driver, config);
                plugins.push(instance);
                await instance.init();
            } catch(ex) {
                console.error(`Error loading plugin: ${file}`, ex);
            }
        }

        // subscribe to notifications
        for(let tuple of driver.controller.nodes) {
            const node = tuple[1];
            const endpoints = node.getEndpointIndizes();
            console.log(`Node ${node.nodeId} endpoints=${JSON.stringify(endpoints)}`);
            node.on('value updated', async (node, args) => {
                try {
                    console.log(`value updated node=${node.nodeId} args=${JSON.stringify(args, undefined, 2)}`);

                    // log
                    await db.none('insert into events (node, "commandClass", endpoint, property, "prevValue", "newValue") values ($1, $2, $3, $4, $5, $6)',
                        [node.nodeId, args.commandClass, args.endpoint, JSON.stringify(args.property), JSON.stringify(args.prevValue), JSON.stringify(args.newValue)]
                    );

                    // notify subscribers
                    const subscriptions = await db.many('select * from subscriptions');
                    for(let subscription of subscriptions) {
                        try {
                            await webPush.sendNotification(subscription.subscription, JSON.stringify(args));
                        } catch(ex) {
                            console.error(`Error pushing notification!`, ex);
                        }
                    }

                    // forward to plugins
                    for(let plugin of plugins) {
                        try {
                            await plugin.valueUpdated(node, args);
                        } catch(ex) {
                            console.error(`Error notifying plugin ${plugin}`, ex);
                        }
                    }
                } catch(ex) {
                    console.error('Error handling event!', ex);
                }
            });
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
