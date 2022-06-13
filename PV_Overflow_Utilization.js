// ################################## Configuration of the consumers and the Logic #####################################

// Average calculation duration in seconds
const avgCalculationDuration = 180;
// Smartmeter current
const dp_GridEnergy = 'sonoff.0.SmartMeter.LK13BE_current';

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
            if (value == 'BSH.Common.EnumType.OperationState.Run') {
                return true;
            }
            else if (value == true) {
                return getState('homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
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
            if (value == 'BSH.Common.EnumType.OperationState.Run') {
                return true;
            }
            else if (value == true) {
                return getState('homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
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
            if (value == 'BSH.Common.EnumType.OperationState.Run') {
                return true;
            }
            else if (value == true) {
                return getState('homeconnect.0.011110523002002336.programs.selected.BSH_Common_Root_SelectedProgram').val;
            }
            else {
                return false;
            }
        },
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
    //     watt: 10,
    //     prio: 0,
    //     depend_state: false,
    //     state: false
    // },
    {
        name: 'Test 15 Watt',
        dp: '0_userdata.0.Test_15_Watt',
        shutdownAllowed: true,
        dp_depend: null,
        dp_state: null,
        stateFormat: null,
        watt: 15,
        prio: 0,
        depend_state: false,
        state: true
    },
    {
        name: 'Test 10 Watt',
        dp: '0_userdata.0.Test_10_Watt',
        shutdownAllowed: true,
        dp_depend: null,
        dp_state: null,
        stateFormat: null,
        watt: 10,
        prio: 0,
        depend_state: false,
        state: true
    },
    {
        name: 'Test 500 Watt',
        dp: '0_userdata.0.Test_500_Watt',
        shutdownAllowed: true,
        dp_depend: null,
        dp_state: null,
        stateFormat: null,
        watt: 500,
        prio: 0,
        depend_state: false,
        state: true
    },
];

// ################################## Calculation of the PV overflow in the average  #####################################

let currentOverflow = getState(dp_GridEnergy).val;
const avgOverflow = { startMeasurement: null, measurements: [], currentAVGOverflow: null, };

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
        log(`currentAVGOverflow: ${avgOverflow.currentAVGOverflow}`);
        newLogic(avgOverflow.currentAVGOverflow);
        // Add current measurement to measurements
    } else {
        avgOverflow.measurements.push(currentOverflow);
    }
});

// ################################ Get state of all consumers and subscribe to changes ###################################

// Get current state of all consumers and subscribe to changes for each consumer
for (const x of consumers) {
    const stateDP = x.dp_state ? x.dp_state : x.dp;
    x.state = stateFormater(x, getState(stateDP).val);

    // Sub State   
    on({ id: stateDP, change: 'ne' }, (obj) => {
        x.state = stateFormater(x, obj.state.val);
    });

    // Has current consumer dependend DP?
    if (x.dp_depend) {
        // Get current state of dependend DP
        x.depend_state = getState(x.dp_depend).val;
        // Sub State
        on({ id: x.dp_depend, change: 'ne' }, (obj) => {
            x.depend_state = obj.state.val;
        });
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
                consumer.state = true;
                setState(consumer.dp, stateFormater(consumer, true));

                log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${consumer.name} state to true`);
                pushOver_Dennis('Power_Consumption_Calculation', `currentAVGOverflow is ${currentAVGOverflow}W -> set ${consumer.name} state to true`, '');
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
                consumer.state = false;
                setState(consumer.dp, stateFormater(consumer, false));

                log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${consumer.name} state to false`);
                pushOver_Dennis('Power_Consumption_Calculation', `currentAVGOverflow is ${currentAVGOverflow}W -> set ${consumer.name} state to false`, '');
            }
        }
    }
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

function pushOver_Dennis(titel, text, prio) {
    sendTo("pushover.1", {
        message: text,
        title: titel,
        priority: prio
    });
}

function stateFormater(consumer, val) {
    if (consumer.stateFormat) {
        return consumer.stateFormat(val);
    }
    return val;
}
