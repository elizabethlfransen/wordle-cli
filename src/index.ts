import {setupProcessHooks} from "./setup-process-hooks";
import {promptCenteredActionDialog} from "./dialog";
import {promptDatePicker} from "./date-picker";
import {getSolutionForDate, SOLUTIONS} from "./WORD_LIST";
import {showWordleScreen} from "./wordle-screen";

main().then();

async function main() {
    setupProcessHooks();
    await mainScreen();
}

async function startWordle(solution: string) {
    await showWordleScreen(solution);
    await mainScreen();
}

function startTodaysWordle() {
    return startWordle(getSolutionForDate());
}

function startRandomWordle() {
    return startWordle(SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)]);
}

async function showDateChooser(): Promise<void> {
    let result = await promptDatePicker();
    if(result == null) return await mainScreen();
    let solutionForDate = getSolutionForDate(result);
    if(solutionForDate == null) {
        return await promptCenteredActionDialog("Invalid Date", {
            text: "Ok",
            action: showDateChooser
        });
    }
    return startWordle(solutionForDate);
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