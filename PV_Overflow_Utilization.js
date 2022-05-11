// ################################## Configuration of the consumers and the Logic #####################################

// Average calculation duration in seconds
const avgCalculationDuration = 60;

// Consumers
const consumers = [
    {
        // Name of the consumer
        name: 'Waschmaschine',
        // Datapoint to start the consumer
        dp: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.commands.BSH_Common_Command_ResumeProgram',
        // Is the consumer allowed to shut down from this script?
        shutdownAllowed: false,
        // [Optional] Is there a dependency for the activation of this consumer?
        dp_depend: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.status.BSH_Common_Status_RemoteControlStartAllowed',
        // [Optional] Is there a different data point for the activity of the consumer?
        dp_state: 'homeconnect.0.BOSCH-WAV28G40-68A40E5081AE.status.BSH_Common_Status_OperationState',
        // [Optional] Does the state have to be formatted or manipulated?
        stateFormat: (value) => { return value == 'BSH.Common.EnumType.OperationState.Run' },
        // From which overflow the consumer should be switched on 
        watt: 400,
        // A priority can be specified here if there are several similar start values
        prio: 1,
        // Internally variable!
        depend_state: false,
        // Internally variable!
        state: false
    },
    {
        name: 'Trockner',
        dp: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.commands.BSH_Common_Command_ResumeProgram',
        shutdownAllowed: false,
        dp_depend: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.status.BSH_Common_Status_RemoteControlStartAllowed',
        dp_state: 'homeconnect.0.BOSCH-WTX87M40-68A40E4BA96F.status.BSH_Common_Status_OperationState',
        stateFormat: (value) => { return value == 'BSH.Common.EnumType.OperationState.Run' },
        watt: 400,
        prio: 2,
        depend_state: false,
        state: false
    },
    {
        name: 'Geschirrspühler',
        dp: 'homeconnect.0.011110523002002336.commands.BSH_Common_Command_ResumeProgram',
        shutdownAllowed: false,
        dp_depend: 'homeconnect.0.011110523002002336.status.BSH_Common_Status_RemoteControlStartAllowed',
        dp_state: 'homeconnect.0.011110523002002336.status.BSH_Common_Status_OperationState',
        stateFormat: (value) => { return value == 'BSH.Common.EnumType.OperationState.Run' },
        watt: 400,
        prio: 1,
        depend_state: false,
        state: false
    },
    // {
    //     name: 'Klima',
    //     dp: 'zigbee.0.5c0272fffe8c7945.state',
    //     shutdownAllowed: true,
    //     dp_depend: null,
    //     dp_state: null,
    //     stateFormat: null,
    //     watt: 100,
    //     prio: 0,
    //     depend_state: false,
    //     state: false
    // },
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
];

// ################################## Calculation of the PV overflow in the average  #####################################

const dp_GridEnergy = 'sonoff.0.SmartMeter.LK13BE_current';
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
        avgOverflow.currentAVGOverflow = Math.round(avgOverflow.measurements.reduce((a, b) => a + b, 0) / avgOverflow.measurements.length);
        avgOverflow.measurements = [];
        avgOverflow.startMeasurement = null;
        newLogic(avgOverflow.currentAVGOverflow);
        // Add current measurement to measurements
    } else {
        avgOverflow.measurements.push(currentOverflow);
    }
    old_logic();
});

// ################################ Get state of all consumers and subscribe to changes ###################################

// Get current state of all consumers and subscribe to changes for each consumer
for (const x of consumers) {
    const stateDP = x.dp_state ? x.dp_state : x.dp;
    // Get current state
    // If stateformat is set, check if state is in stateformat
    if (x.stateFormat) {
        x.state = x.stateFormat(getState(stateDP).val);
    } else {
        x.state = getState(stateDP).val;
    }

    // Sub State   
    on({ id: stateDP, change: 'ne' }, (obj) => {
        x.state = obj.state.val;
    });

    // Has current consumer dependend DP?
    if (x.dp_depend) {
        // Get current state of dependend DP
        x.depend_state = getState(x.dp_depend).val;
        // Sub State
        on({ id: x.dp_depend, change: 'ne' }, (obj) => {
            // If stateformat is set, check if state is in stateformat
            if (x.stateFormat) {
                x.state = x.stateFormat(obj.state.val);
            } else {
                x.depend_state = obj.state.val;
            }
        });
    }
}

// ######################################################## Logic ########################################################

function newLogic(currentAVGOverflow) {
    // Check if currentAVGOverflow is greater than 0
    if (currentAVGOverflow > 0) {
        // Get all consumers where State is false and watt <= currentAVGOverflow and depend_state is true or null
        let foundConsumers = consumers.filter(x => x.state == false && x.watt <= currentAVGOverflow && (x.dp_depend == null || x.depend_state == true));
        // Sort by watt and prio   
        foundConsumers = foundConsumers.sort((a, b) => a.watt - b.watt || a.prio - b.prio);
        // Consumer found?
        if (foundConsumers.length > 0) {
            let firstConsumer = foundConsumers[0];
            firstConsumer.state = true;
            setState(firstConsumer.dp, true);
            log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${firstConsumer.name} state to true`);

        }
        // Check if currentAVGOverflow is less than 0
    } else if (currentAVGOverflow < 0) {
        // Get all consumers where State is true and shut down is allowed
        let foundConsumers = consumers.filter(x => x.state == true && x.shutdownAllowed == true && x.watt <= (currentAVGOverflow * -1));
        // Sort by watt descending 
        foundConsumers = foundConsumers.sort((a, b) => a.watt - b.watt).reverse();
        // Consumer found?
        if (foundConsumers.length > 0) {
            let firstConsumer = foundConsumers[0];
            firstConsumer.state = false;
            setState(firstConsumer.dp, false);
            log(`currentAVGOverflow is ${currentAVGOverflow} -> set ${firstConsumer.name} state to false`);
        }
    }
}
