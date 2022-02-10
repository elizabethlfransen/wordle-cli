export interface ProgramArguments {
    disableBackground: boolean
}

export function parseArguments(args: string[] = process.argv.slice(2)): ProgramArguments {
    return {
        disableBackground: args.includes("--disable-background")
    };
}