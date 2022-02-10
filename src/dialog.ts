import stringWidth from "string-width";
import boxen from "boxen";
import chalk from "chalk";

export interface ActionDialogItem<T> {
    text: string,
    action(): Promise<T> | T
}

export function printCentered(text: string) {
    console.clear();
    const lines = text.split(/\n/g);
    const [termCenterX, termCenterY] = [Math.trunc(process.stdout.columns / 2), Math.trunc(process.stdout.rows / 2)];
    const promptCenterY = Math.trunc(lines.length / 2);
    const promptCenterX = Math.trunc(Math.max(
        ...lines
            .map(x => stringWidth(x))
    ) / 2)
    const startY = termCenterY - promptCenterY;
    // not sure why but we have to divide by 2 twice
    const startX = termCenterX - Math.trunc(promptCenterX / 2);
    lines.forEach((line, index) => {
        process.stdout.cursorTo(startX, startY + index);
        process.stdout.write(line);
    });
}

export function promptCentered(
    title: string,
    options: string[]
): Promise<[string, number]> {

    return new Promise<[string, number]>(resolve => {
        // checks
        if (options.length == 0) throw "At least one option must be provided";

        // vars
        let selectedOptionIndex = 0;

        // functions
        const render = () => renderPromptCentered(title, transformOptions());

        function cleanup() {
            process.stdout.removeListener('resize', render);
            process.stdin.removeListener('data', handleKeyPress);
        }

        function handleKeyPress(key: string) {
            switch (key) {
                case "\u001b[A":
                    selectedOptionIndex = Math.max(0, selectedOptionIndex - 1);
                    render();
                    break;
                case "\u001b[B":
                    selectedOptionIndex = Math.min(options.length - 1, selectedOptionIndex + 1);
                    render();
                    break;
                case "\r":
                    cleanup()
                    resolve([options[selectedOptionIndex], selectedOptionIndex]);
                    break;
            }
        }

        function transformUnselectedOption(option: string) {
            return `  ${option}`;
        }

        function transformSelectedOption(option: string) {
            return `${chalk.blue('❯')} ${chalk.cyan.underline(option)}`;
        }

        function transformOptions(): string[] {
            return options
                .map((option, index) => index === selectedOptionIndex ? transformSelectedOption(option) : transformUnselectedOption(option));
        }

        // setup
        process.stdout.on('resize', render);
        process.stdin.on('data', handleKeyPress);
        render();
    });
}

export async function promptCenteredActionDialog<T>(
    title: string,
    ...options: ActionDialogItem<T>[]
) {
    let optionsText = options.map(x => x.text);
    let [, resultIndex] = await promptCentered(title, optionsText);
    return await Promise.resolve().then(() => options[resultIndex].action());
}

function renderPromptCentered(
    title: string,
    options: string[]
) {
    printCentered(
        boxen(
            options.join("\n"),
            {
                title: chalk.green(title),
                borderStyle: 'round',
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 2,
                    right: 2,
                },
                borderColor: "yellow"
            }
        )
    );
}