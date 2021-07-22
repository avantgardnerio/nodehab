// https://zwave-js.github.io/node-zwave-js/#/getting-started/quickstart
const { Driver } = require("zwave-js");

(async () => {
// Tell the driver which serial port to use
    const driver = new Driver("/dev/ttyACM0");
// You must add a handler for the error event before starting the driver
    driver.on("error", (e) => {
        // Do something with it
        console.error(e);
    });
// Listen for the driver ready event before doing anything with the driver
    driver.once("driver ready", () => {
        /*
        Now the controller interview is complete. This means we know which nodes
        are included in the network, but they might not be ready yet.
        The node interview will continue in the background.
        */

        driver.controller.nodes.forEach((node) => {
            //console.log(node);
            // e.g. add event handlers to all known nodes
        });

        // When a node is marked as ready, it is safe to control it
        for(let id of driver.controller.nodes.keys()) {
            const node = driver.controller.nodes.get(id);
            node.once("ready", async () => {
                // e.g. perform a BasicCC::Set with target value 50
                // await node.commandClasses.Basic.set(50);
            });
        }
    });
// Start the driver. To await this method, put this line into an async method
    await driver.start();

// driver.destroy();
})();
