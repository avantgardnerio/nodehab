const { getSunrise, getSunset } = require('sunrise-sunset-js');

const commandClass = 38;
const property = `currentValue`;

module.exports = async (driver, config, notify, db, opts) => {
    const deviceId = parseInt(Object.keys(config.nodes).find(k => config.nodes[k] === opts.deviceName));
    const device = driver.controller.nodes.get(deviceId);
    const location = config.location;
    console.log(`shadeId=${deviceId}`);

    const getDuration = () => {
        const now = new Date();
        const sunrise = getSunrise(...location);
        const sunset = getSunset(...location);
        let target = opts.time;
        if(target === 'sunrise') {
            target = `${String(sunrise.getHours()).padStart(2, '0')}:${String(sunrise.getMinutes()).padStart(2, '0')}`;
        }
        if(target === 'sunset') {
            target = `${String(sunset.getHours()).padStart(2, '0')}:${String(sunset.getMinutes()).padStart(2, '0')}`;
        }

        const offset = now.getTimezoneOffset();
        const offsetHours = String(Math.abs(offset) / 60).padStart(2, '0');
        const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
        const offsetSign = offset > 0 ? '-' : '+';
    
        const dateText = new Date(now.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
        const dateTimeText = `${dateText}T${target}${offsetSign}${offsetHours}:${offsetMinutes}`;
        const instant = Date.parse(dateTimeText);
        let duration = instant - now.getTime();
        if(duration <= 0) { 
            duration = duration + 24 * 60 * 60 * 1000; 
        }

        console.log(`Setting ${opts.deviceName} to ${opts.target} at ${dateTimeText} in ${Math.round(duration / 1000 / 60)} minutes from now`);

        return duration;
    };

    const takeAction = async () => {
        const curVal = await device.getValue({ commandClass, property });
        if(opts.op === 'gt' && curVal > opts.target) {
            await device.setValue({ commandClass, property: 'targetValue' }, opts.target);
        }
        if(opts.op === 'lt' && curVal < opts.target) {
            await device.setValue({ commandClass, property: 'targetValue' }, opts.target);
        }
        setTimeout(takeAction, getDuration());
    };
    setTimeout(takeAction, getDuration());

    return {
        valueUpdated: async (node, args) => {
            // don't care
        }    
    }
}
