import chalk from "chalk";
import boxen from "boxen";
import stringWidth from "string-width";
import ansi from "ansi";

const cursor = ansi(process.stdout);

const args = process.argv.slice(2);
const shouldChangeBackground = !args.includes("--disable-background");
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on('data', () => {})

process.on('SIGINT', () => process.exit(0));


process.on('exit', () => {
    hideAlternateScreen();
    cursor.show();
    cursor.reset()
});

function showAlternateScreen() {
    process.stdout.write(Buffer.from([0x1b, 0x5b, 0x3f, 0x31, 0x30, 0x34, 0x39, 0x68]))
}

function hideAlternateScreen() {
    process.stdout.write(Buffer.from([0x1b, 0x5b, 0x3f, 0x31, 0x30, 0x34, 0x39, 0x6c]))
}

main().then();

async function main() {
    showAlternateScreen();
    cursor.hide();
    if (shouldChangeBackground)
        cursor.bg.black();
    await mainScreen();
}

function promptMainDialog(title: string, options: string[]) {
    function onResize() {
        render();
    }

    function transformSelectedOption(option: string) {
        return `${chalk.blue('❯')} ${chalk.cyan.underline(option)}`;
    }

    function transformUnselectedOption(option: string) {
        return chalk.gray(`  ${option}`);
    }

    function handleKeyPress(key: Buffer) {
        console.log(key);
    }

    let selectedIndex = 0;
    const transformedOptions = options
        .map((option, index) => index === selectedIndex ? transformSelectedOption(option) : transformUnselectedOption(option))

    function render() {
        drawMainDialog(title, transformedOptions);
    }

    return new Promise(() => {
        process.stdout.on('resize', onResize);
        process.stdin.on('data', handleKeyPress);
        render();
    });
}

function mainScreen() {
    return promptMainDialog("Wordle-CLI", [
        "Today's wordle",
        "Random Wordle",
        "Specific Wordle",
        "Exit"
    ])
}

function drawMainDialog(title: string, options: string[]) {
    console.clear();
    const prompt = boxen(options.join("\n"), {
        titleAlignment: "center",
        textAlignment: "left",
        borderStyle: "round",
        title: chalk.green(title),
        padding: {
            left: 2,
            right: 2,
            top: 0,
            bottom: 0
        },
        borderColor: "yellow"
    });
    const lines = prompt.split(/\n/g);
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