// ################################## Configuration of the consumers and the Logic #####################################

// Average calculation duration in seconds
const avgCalculationDuration = 180;
// Smartmeter current
const dp_GridEnergy = 'sonoff.0.SmartMeter.LK13BE_current';
const dp_OverFlowConsumers = '0_userdata.0.Energy.OwerFlowConsumers';
const dp_AvgOverflow = '0_userdata.0.Energy.AvgOverflow';
const avgOverflow = { startMeasurement: null, measurements: [], currentAVGOverflow: null, };

// Consumers
const consumers = [
    {
        // Name of the consumer
        name: 'Waschmaschine',
        // Datapoint to start the consumer
        dp: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.programs.active.BSH_Common_Root_ActiveProgram',
        // Is the consumer allowed to shut down from this script?
        shutdownAllowed: false,
        // [Optional] Is there a dependency for the activation of this consumer?
        dp_depend: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.status.BSH_Common_Status_RemoteControlStartAllowed',
        // [Optional] Is there a different data point for the activity of the consumer?
        dp_state: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.status.BSH_Common_Status_OperationState',
        // [Optional] Does the state have to be formatted or manipulated?
        stateFormat: (value) => {
            const connected = getState('homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.general.connected').val
            if ((value == 'BSH.Common.EnumType.OperationState.Run' || value == 'BSH.Common.EnumType.OperationState.Finished') && connected == true) {
                return true;
            }
            else if (value == true) {
                return getState('homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
        // Custom triggers for the state evaluation, these triggers only trigger the logic and have no further influence!
        customTrigger: ['homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.general.connected'],
        // From which overflow the consumer should be switched on 
        watt: 1,
        // A priority can be specified here if there are several similar start values
        prio: 1,
        // Internally variable!
        depend_state: false,
        // Internally variable!
        state: false
    },
    {
        name: 'Trockner',
        dp: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.programs.active.BSH_Common_Root_ActiveProgram',
        shutdownAllowed: false,
        dp_depend: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.status.BSH_Common_Status_RemoteControlStartAllowed',
        dp_state: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.status.BSH_Common_Status_OperationState',
        stateFormat: (value) => {
            const connected = getState('homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.general.connected').val
            if ((value == 'BSH.Common.EnumType.OperationState.Run' || value == 'BSH.Common.EnumType.OperationState.Finished') && connected == true) {
                return true;
            }
            else if (value == true) {
                return getState('homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
        customTrigger: ['homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.general.connected'],
        watt: 1,
        prio: 1,
        depend_state: false,
        state: false
    },
    {
        name: 'Geschirrspühler',
        dp: 'homeconnect.0.011110523002002336.programs.active.BSH_Common_Root_ActiveProgram',
        shutdownAllowed: false,
        dp_depend: 'homeconnect.0.011110523002002336.status.BSH_Common_Status_RemoteControlStartAllowed',
        dp_state: 'homeconnect.0.011110523002002336.status.BSH_Common_Status_OperationState',
        stateFormat: (value) => {
            if (value == 'BSH.Common.EnumType.OperationState.Run' || value == 'BSH.Common.EnumType.OperationState.Finished') {
                return true;
            }
            else if (value == true) {
                setState('homeconnect.0.011110523002002336.settings.BSH_Common_Setting_PowerState', 'BSH.Common.EnumType.PowerState.On')
                sleep(5000);
                return getState('homeconnect.0.011110523002002336.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
        customTrigger: null,
        watt: 1,
        prio: 1,
        depend_state: false,
        state: false
    },
    {
        name: 'E-Bike Charger (Dennis)',
        dp: 'zigbee.0.5c0272fffe857db1.state',
        shutdownAllowed: true,
        dp_depend: null,
        dp_state: null,
        stateFormat: null,
        customTrigger: null,
        watt: 170,
        prio: 0,
        depend_state: false,
        state: false
    },
    {
        name: 'E-Bike Charger (Nicole)',
        dp: 'zigbee.0.5c0272fffe7f9d7b.state',
        shutdownAllowed: true,
        dp_depend: null,
        dp_state: null,
        stateFormat: null,
        customTrigger: null,
        watt: 170,
        prio: 0,
        depend_state: false,
        state: false
    },
    // {
    //     name: 'Wohnzimmer Tablet',
    //     dp: 'zigbee.0.5c0272fffe8c7945.state',
    //     shutdownAllowed: true,
    //     dp_depend: null,
    //     dp_state: null,
    //     stateFormat: null,
    //     customTrigger: null,
    //     watt: 10,
    //     prio: 0,
    //     depend_state: false,
    //     state: false
    // },
    // {
    //     name: 'Test 15 Watt',
    //     dp: '0_userdata.0.Test_15_Watt',
    //     shutdownAllowed: true,
    //     dp_depend: null,
    //     dp_state: null,
    //     stateFormat: null,
    //     customTrigger: null,
    //     watt: 15,
    //     prio: 0,
    //     depend_state: false,
    //     state: true
    // },
    // {
    //     name: 'Test 10 Watt',
    //     dp: '0_userdata.0.Test_10_Watt',
    //     shutdownAllowed: true,
    //     dp_depend: null,
    //     dp_state: null,
    //     stateFormat: null,
    //     customTrigger: null,
    //     watt: 10,
    //     prio: 0,
    //     depend_state: false,
    //     state: true
    // },
    // {
    //     name: 'Test 500 Watt',
    //     dp: '0_userdata.0.Test_500_Watt',
    //     shutdownAllowed: true,
    //     dp_depend: null,
    //     dp_state: null,
    //     stateFormat: null,
    //     customTrigger: null,
    //     watt: 500,
    //     prio: 0,
    //     depend_state: false,
    //     state: true
    // },
];

createState(dp_AvgOverflow, avgOverflow.currentAVGOverflow, { name: 'Current AVG Overflow', "type": "number", "unit": "W", "read": true, "write": false, "role": "value", });
createState(dp_OverFlowConsumers, createHTML(consumers, avgOverflow.currentAVGOverflow), { name: 'OverFlow Consumers', "type": "string", "read": true, "write": false });

// ################################## Calculation of the PV overflow in the average  #####################################

let currentOverflow = getState(dp_GridEnergy).val;

on({ id: dp_GridEnergy, change: 'ne' }, (obj) => {
    currentOverflow = obj.state.val * -1;

    // Init avgOverflow measurement
    if (avgOverflow.startMeasurement == null) {
        avgOverflow.startMeasurement = Date.now();
        avgOverflow.measurements.push(currentOverflow);
        // Set lastAVG from all measurements after x seconds from startMeasurement
    } else if (Date.now() - avgOverflow.startMeasurement > (avgCalculationDuration * 1000)) {
        avgOverflow.currentAVGOverflow = Math.round(median(avgOverflow.measurements));//Math.round(avgOverflow.measurements.reduce((a, b) => a + b, 0) / avgOverflow.measurements.length);
        avgOverflow.measurements = [];
        avgOverflow.startMeasurement = null;
        //log(`currentAVGOverflow: ${avgOverflow.currentAVGOverflow}`);
        newLogic(avgOverflow.currentAVGOverflow);
        // Add current measurement to measurements
    } else {
        avgOverflow.measurements.push(currentOverflow);
    }
    old_logic();
});

// ################################ Get state of all consumers and subscribe to changes ###################################

// Get current state of all consumers and subscribe to changes for each consumer
for (const consumer of consumers) {
    const stateDP = consumer.dp_state ? consumer.dp_state : consumer.dp;
    consumer.state = stateFormater(consumer, getState(stateDP).val);

    // Sub State   
    on({ id: stateDP, change: 'ne' }, (obj) => {
        consumer.state = stateFormater(consumer, obj.state.val);
        setState(dp_OverFlowConsumers, createHTML(consumers, avgOverflow.currentAVGOverflow), true);
    });

    // Has current consumer dependend DP?
    if (consumer.dp_depend) {
        // Get current state of dependend DP
        consumer.depend_state = getState(consumer.dp_depend).val;
        // Sub State
        on({ id: consumer.dp_depend, change: 'ne' }, (obj) => {
            consumer.depend_state = obj.state.val;
            setState(dp_OverFlowConsumers, createHTML(consumers, avgOverflow.currentAVGOverflow), true);
        });
    }

    if (consumer.customTrigger) {
        for (const trigger of consumer.customTrigger) {
            on({ id: trigger, change: 'ne' }, () => {
                consumer.state = stateFormater(consumer, getState(stateDP).val);
            });
        }
    }
}

// ######################################################## Logic ########################################################

function newLogic(currentAVGOverflow) {
    // Check if currentAVGOverflow is greater than 0
    if (currentAVGOverflow > 0) {
        // Get all consumers where State is false and watt <= currentAVGOverflow and depend_state is true or null
        let foundConsumers = consumers.filter(x => x.state == false && x.watt <= currentAVGOverflow && (!x.dp_depend || x.depend_state == true));
        // Sort by watt and prio   
        foundConsumers = foundConsumers.sort((a, b) => a.watt - b.watt || a.prio - b.prio);
        // Consumer found?
        if (foundConsumers.length > 0) {
            const startConsumer = [foundConsumers[0]];
            // Skip the first consumer, since it is already in the array, and run through the rest to yield the optimal consume. 
            for (const consumer of foundConsumers.slice(1)) {
                // Check whether more consumers must be switched on to compensate for the positive overflow. 
                if (sumWatt(startConsumer) >= currentAVGOverflow) {
                    break;
                }
                startConsumer.push(consumer);
            }

            // Now check whether the last consumer must be removed so that the overflow is not exceeded 
            while (sumWatt(startConsumer) > currentAVGOverflow) {
                startConsumer.pop();
            }

            // Set state of consumers to true
            for (const consumer of startConsumer) {
                //consumer.state = true;
                setState(consumer.dp, stateFormater(consumer, true));
                consumer.state = true;
                log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${consumer.name} state to true`);
                //pushOver_Dennis('Power_Consumption_Calculation', `currentAVGOverflow is ${currentAVGOverflow}W -> set ${consumer.name} state to true`, '');
            }

        }
        // Check if currentAVGOverflow is less than 0
    } else if (currentAVGOverflow < 0) {
        // Get all consumers where State is true and shut down is allowed
        let foundConsumers = consumers.filter(x => x.state == true && x.shutdownAllowed == true);
        // Sort by watt small to big 
        foundConsumers = foundConsumers.sort((a, b) => a.watt - b.watt);
        // Consumer found?
        if (foundConsumers.length > 0) {
            const shutdownConsumers = [foundConsumers[0]];
            // Skip the first consumer, since it is already in the array, and run through the rest to yield the optimal shutdown. 
            for (const consumer of foundConsumers.slice(1)) {
                // Check whether more consumers must be switched off to compensate for the negative overflow. 
                if (sumWatt(shutdownConsumers) > currentAVGOverflow * -1) {
                    break;
                }
                shutdownConsumers.push(consumer);
            }

            // Now check if small consumers can be removed, so that not too much is switched off unnecessarily. 
            let lastRemovedConsumer = null;
            while (sumWatt(shutdownConsumers) >= currentAVGOverflow * -1) {
                lastRemovedConsumer = shutdownConsumers.shift();
            }
            // I could not think of a better logic here  
            if (lastRemovedConsumer != null) {
                shutdownConsumers.push(lastRemovedConsumer);
            }

            // Set state of consumers to false
            for (const consumer of shutdownConsumers) {
                //consumer.state = false;
                setState(consumer.dp, stateFormater(consumer, false));
                consumer.state = false;
                log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${consumer.name} state to false`);
                //pushOver_Dennis('Power_Consumption_Calculation', `currentAVGOverflow is ${currentAVGOverflow}W -> set ${consumer.name} state to false`, '');
            }
        }
    }

    setState(dp_AvgOverflow, currentAVGOverflow < 0 ? 0 : currentAVGOverflow, true);
    setState(dp_OverFlowConsumers, createHTML(consumers, currentAVGOverflow), true);
}

function createHTML(consumers, currentAVGOverflow) {
    currentAVGOverflow = currentAVGOverflow < 0 || currentAVGOverflow == null ? 0 : currentAVGOverflow
    let html = `<center>
    AVG Überschuss: <b><font color=${currentAVGOverflow > 0 ? '#3bcf0e' : ''}>${currentAVGOverflow}</b><small> W</small></font>
    </center>
    <hr>
    <table width=100%>
    <tr>
    <th align=left>Verbraucher</th>
    <th align=right>Trigger</th>
    <th width=120>Abhänigkeit</th>
    <th>Status</th>
    </tr>`;

    for (const consumer of consumers) {
        const stateColor = consumer.state == true ? '#3bcf0e' : '';

        html += `</tr>`
        html += `<td><font color=${stateColor}>${consumer.name}</font></td>`
        html += `<td align=right><font color=${stateColor}>${consumer.watt}<small> W</small></font></td>`
        html += `<td align=center>${consumer.dp_depend == null ? '<font color=#A5FFAD>〵</font>' : (consumer.depend_state == true ? '<font color=3bcf0e><b>✓</b></font>' : '<font color=orange>✘</font>')}</td>`

        if (consumer.dp_depend == null || consumer.depend_state == true) {
            html += `<td align=center><font color=${stateColor}>${consumer.state ? 'An' : '<font color=#A5FFAD>Wartend</font>'}</font></td>`
        }
        else {
            html += `<td align=center><font color=${stateColor}>${consumer.state ? 'An' : '<font color=orange>Aus</font>'}</font></td>`
        }

        html += `</tr>`;
    }

    html += '</table>';
    return html;
}

function sumWatt(consumers) {
    return consumers.reduce((a, b) => a + b.watt, 0);
}

function median(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function stateFormater(consumer, val) {
    if (consumer.stateFormat) {
        return consumer.stateFormat(val);
    }
    return val;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}