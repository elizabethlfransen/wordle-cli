import {cursor, programArgs} from "./setup-process-hooks";
import chalk from "chalk";
import {WORD_LIST} from "./WORD_LIST";

enum LetterStatus {
    CORRECT_POSITION,
    INCORRECT_POSITION,
    NOT_IN_WORD
}

enum AnswerSubmissionResult {
    INSUFFICIENT_LENGTH,
    NOT_IN_WORD_LIST,
    ACCEPTED
}

export function showWordleScreen(solution: string) {

    return new Promise<void>(resolve => {
        let keyboard = [
            "qwertyuiop",
            "asdfghjkl",
            "zxcvbnm"
        ];
        const validLetters = keyboard.join("");
        let letterPosition: Record<string, LetterStatus> = {};
        let wordleLines: string[] = [];
        let currentLine = "";
        let currentTimeoutId: NodeJS.Timer = null;
        let isFinished = false;
        let hasWon = false;
        let wonText = "Congrats!";
        let loseText = "Better luck next time.";
        let exitText = "Press esc any time to exit.";

        function submitAnswer() {
            if(currentLine.length  < 5) {
                return AnswerSubmissionResult.INSUFFICIENT_LENGTH;
            }
            if(!WORD_LIST.includes(currentLine)) {
                return AnswerSubmissionResult.NOT_IN_WORD_LIST;
            }
            Array.from(currentLine).forEach((character, index) => {
                if(character === solution[index]) {
                    letterPosition[character] = LetterStatus.CORRECT_POSITION;
                } else if (!(character in letterPosition) && solution.includes(character)) {
                    letterPosition[character] = LetterStatus.INCORRECT_POSITION;
                } else if(!solution.includes(character)) {
                    letterPosition[character] = LetterStatus.NOT_IN_WORD;
                }
            })
            wordleLines.push(formatWord(currentLine));
            if(currentLine == solution) {
                hasWon = true;
                isFinished = true;
            }
            if(wordleLines.length == 6) {
                isFinished = true;
            }
            currentLine = "";
            return AnswerSubmissionResult.ACCEPTED;
        }

        function formatWord(str: string) {
            return Array.from(str)
                .map((c, i) => {
                    if(solution[i] === c) {
                        return chalk.green(c);
                    }
                    if(solution.includes(c)) {
                        return chalk.yellow(c);
                    }
                    return c;
                })
                .join("");
        }

        function getLine(index: number) {
            if (index < wordleLines.length)
                return wordleLines[index];
            if (index == wordleLines.length) {
                return currentLine + chalk.gray("_".repeat(5 - currentLine.length));
            }
            return chalk.gray("_____");
        }

        let showError = false;
        let errorText = "Not on Wordlist";

        function colorLetter(letter: string) {
            switch (letterPosition[letter]) {
                case undefined:
                    return letter;
                case LetterStatus.CORRECT_POSITION:
                    return chalk.green(letter);
                case LetterStatus.INCORRECT_POSITION:
                    return chalk.yellow(letter);
                case LetterStatus.NOT_IN_WORD:
                    return chalk.gray(letter);
            }
        }

        function render() {
            console.clear();
            let startX = process.stdout.columns / 2 - 3;
            let startY = process.stdout.rows / 2 - 7;
            for (let i = 0; i < 6; i++) {
                cursor.goto(startX, startY + i);
                process.stdout.write(getLine(i))
            }
            let keyboardStartY = process.stdout.rows / 2 + 2;
            keyboard.forEach((keyboardRow, i) => {
                let y = keyboardStartY + i;
                let rowStartX = process.stdout.columns / 2 - keyboardRow.length
                Array.from(keyboardRow).forEach((key, x) => {
                    cursor.goto(rowStartX + x * 2, y);
                    process.stdout.write(colorLetter(key));
                })
            });
            if(hasWon) {
                cursor.goto(process.stdout.columns / 2 - wonText.length / 2, process.stdout.rows / 2);
                process.stdout.write(chalk.green(wonText));
            } else if(isFinished) {
                cursor.goto(process.stdout.columns / 2 - 3, process.stdout.rows / 2 - 1);
                process.stdout.write(chalk.red(solution));
                cursor.goto(process.stdout.columns / 2 - loseText.length / 2, process.stdout.rows / 2);
                process.stdout.write(chalk.yellow(loseText));
            } else if (showError) {
                cursor.goto(process.stdout.columns / 2 - errorText.length / 2, process.stdout.rows / 2);
                process.stdout.write(chalk.red(errorText))
            }
            cursor.goto(process.stdout.columns / 2 - exitText.length / 2, startY - 2);
            process.stdout.write(chalk.yellow(exitText));
        }

        function handleKeyPressed(key: string) {
            if(key == '\u001B') {
                process.stdout.removeListener('resize', render);
                process.stdin.removeListener('data', handleKeyPressed);
                resolve();
            }
            if(isFinished)
                return;
            if(validLetters.includes(key) && currentLine.length < 5) {
                currentLine += key;
                render();
            }
            if(key === "\x7F" && currentLine.length > 0) {
                currentLine = currentLine.substring(0, currentLine.length - 1);
                render();
            }
            if(key === "\r") {
                let result = submitAnswer();
                if(result == AnswerSubmissionResult.NOT_IN_WORD_LIST) {
                    showError = true;
                    if(currentTimeoutId != null) {
                        clearTimeout(currentTimeoutId);
                    }
                    currentTimeoutId = setTimeout(() => {
                        showError = false;
                        render();
                    }, 2000);
                    render();
                }
                if(result == AnswerSubmissionResult.ACCEPTED) {
                    render();
                }
            }
        }

        process.stdout.on('resize', render);
        process.stdin.on('data', handleKeyPressed);
        render();
    });
}