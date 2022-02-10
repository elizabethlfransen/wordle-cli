import {setupProcessHooks} from "./setup-process-hooks";
import {promptCenteredActionDialog} from "./dialog";

main().then();

async function main() {
    setupProcessHooks();
    let result = await mainScreen();
    console.clear();
    console.log(result);
}

function startTodaysWordle() {

}

function startRandomWordle() {

}

function showDateChooser() {

}

function exit() {
    process.exit(0);
}

function mainScreen() {
    return promptCenteredActionDialog("Wordle-CLI",
        {
            text: "Today's wordle",
            action: startTodaysWordle
        },
        {
            text: "Random Wordle",
            action: startRandomWordle
        },
        {
            text: "Specific Wordle",
            action: showDateChooser
        },
        {
            text: "Exit",
            action: exit
        },
    );
}