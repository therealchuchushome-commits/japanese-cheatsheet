const STATE_KEY = 'japanTravelCheatsheetState';

export function saveState(state) {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(STATE_KEY, serializedState);
    } catch (e) {
        console.error("Could not save state", e);
    }
}

export function loadState() {
    try {
        const serializedState = localStorage.getItem(STATE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.error("Could not load state", e);
        return undefined;
    }
}
