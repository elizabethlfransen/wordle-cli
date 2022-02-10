import {setupProcessHooks} from "./setup-process-hooks";
import {promptCenteredActionDialog} from "./dialog";
import {promptDatePicker} from "./date-picker";
import {getSolutionForDate, SOLUTIONS} from "./WORD_LIST";

main().then();

async function main() {
    setupProcessHooks();
    await mainScreen();
}

function startWordle(solution: string) {
    console.clear();
    console.log(solution);
}

function startTodaysWordle() {
    startWordle(getSolutionForDate());
}

function startRandomWordle() {
    startWordle(SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)]);
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
    startWordle(solutionForDate);
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