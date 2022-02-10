import {hideAlternateScreen, showAlternateScreen} from "./alternate-screen";
import ansi from "ansi";
import {parseArguments} from "./program-argument-parsing";

const INTERRUPT_SIGNAL = '\u0003';

export const cursor = ansi(process.stdout);

export const programArgs = parseArguments();

export function setupProcessHooks() {
    showAlternateScreen();
    process.stdin.setEncoding('utf8');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    cursor.hide();

    if(!programArgs.disableBackground)
        cursor.bg.black();

    process.on('exit', cleanup);
    process.stdin.on('data', (b: string) => {
        if(b === INTERRUPT_SIGNAL)
            process.exit(0);
    })
}

function cleanup() {
    hideAlternateScreen();
    cursor.show();
    cursor.reset();
}