export module ClientErrors {
    export function commandNotFound(command: string): string {
        return (command + ": command not found");
    }

    export function wrongArguments(command: string): string {
        return (command + ": wrong arguments")
    }

    export function mustBeInChan(command: string): string {
        return (command + ": must be executed in a channel");
    }
}