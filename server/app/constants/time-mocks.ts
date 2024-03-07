const FAKE_ROOM_ID = '1234';
const TICK = 1000;
const TIMER_VALUE = 3;
const TIMEOUT = 3000;

const FAKE_COUNTER = new Map<string, number>([
    [FAKE_ROOM_ID, TIMER_VALUE],
    ['2990', 0],
]);

const FAKE_INTERVAL = new Map<string, NodeJS.Timeout>([
    [
        FAKE_ROOM_ID,
        setInterval(() => {
            /* do nothing */
        }),
    ],
]);

export { FAKE_ROOM_ID, TICK, TIMER_VALUE, TIMEOUT, FAKE_COUNTER, FAKE_INTERVAL };
