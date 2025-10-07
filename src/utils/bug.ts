export const reportBug = (
    message: string,
    info?: Record<string, unknown>,
): void => {
    console.error(
        `POSSIBLE BUG: ${message}. Please report this on GitHub`,
        info ?? '',
    );
};
