import {printCentered} from "./dialog";
import boxen from "boxen";
import chalk from "chalk";

export function promptDatePicker() {
    return new Promise<Date | null>(resolve => {
        let focusedComponentIndex = 0;
        let focusedButtonIndex = 1;
        let dateText = "";
        let validDate = false;

        function getDateComponents(): [string, string, string] {
            return [
                dateText.substring(0, 2).padEnd(2, "_"),
                dateText.substring(2, 4).padEnd(2, "_"),
                dateText.substring(4, 8).padEnd(4, "_")
            ];
        }

        function renderSelectedDateText() {
            return getDateComponents().map(c => chalk.blue.underline(c)).join("/");
        }

        function formatDate() {
            return getDateComponents().join("/");
        }

        function cleanup() {
            process.stdin.removeListener('data', handleKeyPressed);
        }

        function validateDate() {
            validDate = dateText.length === 8;
        }

        function handleKeyPressed(key: string) {
            switch (key) {
                case "\u001b[A":
                    if (focusedComponentIndex > 0) {
                        focusedComponentIndex = 0;
                        render();
                    }
                    break;
                case "\u001b[B":
                    if (focusedComponentIndex == 0) {
                        focusedComponentIndex = focusedButtonIndex;
                        render();
                    }
                    break;
                case "\u001b[C":
                    if (focusedComponentIndex == 1) {
                        focusedComponentIndex = 2;
                        focusedButtonIndex = 2;
                        render();
                    }
                    break;
                case "\u001b[D":
                    if (focusedComponentIndex == 2) {
                        focusedComponentIndex = 1;
                        focusedButtonIndex = 1;
                        render();
                    }
                    break;
                case "\r":
                    if (focusedComponentIndex == 1) {
                        cleanup();
                        resolve(null);
                    } else if (validDate) {
                        cleanup();
                        resolve(new Date(formatDate()));
                    }
                    break;
                case "\x7F":
                    if (focusedComponentIndex == 0) {
                        dateText.substring(0, Math.max(dateText.length - 1, 0));
                        render();
                    }
                    break;
                default:
                    let numberValue = Number(key);
                    if (numberValue >= 0 && numberValue <= 9 && dateText.length < 8) {
                        dateText += key;
                        validateDate();
                        render();
                    }
            }
        }

        function renderButton(text: string, focused: boolean, disabled: boolean = false) {
            let func = chalk;
            if (focused) {
                func = func.blue.underline;
            }
            if (disabled) {
                func = func.gray;
            }
            return func(text);
        }

        function render() {
            console.clear();
            printCentered(
                boxen(
                    [
                        focusedComponentIndex == 0 ? renderSelectedDateText() : formatDate(),
                        `${renderButton("cancel", focusedComponentIndex == 1)}  ${renderButton("ok", focusedComponentIndex == 2, !validDate)}`
                    ].join("\n"),
                    {
                        title: chalk.green("Pick a Date"),
                        borderColor: "yellow",
                        titleAlignment: "center",
                        textAlignment: "center",
                        padding: {
                            top: 0,
                            bottom: 0,
                            left: 1,
                            right: 1
                        },
                    }
                )
            );
        }

        process.stdin.on('data', handleKeyPressed);
        render();
    });
}