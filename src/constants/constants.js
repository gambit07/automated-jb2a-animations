const log = () => { };
export default log;

export function aaDebugger(...args) {
    console.log(`DEBUG | Automated Animations |`, ...args);
}

// Credit to Wasp for these functions
export function custom_notify(message) {
    message = `Automated Animations | ${message}`;
    ui.notifications.notify(message);
    console.log(message.replace("<br>", "\n"));
}

export function custom_warning(warning, notify = false) {
    warning = `Automated Animations | ${warning}`;
    if (notify) {
        ui.notifications.warn(warning);
    }
    console.warn(warning.replace("<br>", "\n"));
}

export function custom_error(error, notify = true) {
    error = `Automated Animations | ${error}`;
    if (notify) {
        ui.notifications.error(error);
    }
    return new Error(error.replace("<br>", "\n"));
}