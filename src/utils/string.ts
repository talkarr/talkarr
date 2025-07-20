import ISO6391 from 'iso-639-1';

export const limitChars = (
    str: string,
    limit: number,
    wordMargin = 20,
): string => {
    if (str.length <= limit) {
        return str;
    }

    // do smart word break with ellipsis. Use wordMargin to add some extra chars to the limit. if still cannot be reached, backtrack to the last space
    const words = str.split(' ');
    let result = '';
    let currentLength = 0;

    for (const word of words) {
        if (currentLength + word.length + 1 > limit - wordMargin) {
            break;
        }

        result += `${word} `;
        currentLength += word.length + 1;
    }

    return `${result.trim()}...`;
};

// allow alphanumeric characters and punctuation
export const stripInvalidChars = (str: string): string =>
    str.replaceAll(/[^a-zA-Z0-9.,!? ]/g, '');

export const formatVideoDuration = (seconds: number): string => {
    // format as "42 minutes 42 seconds" or "42 seconds" or "1 hour 42 minutes 42 seconds"
    const parts = [];

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }

    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    if (remainingSeconds > 0) {
        parts.push(
            `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`,
        );
    }

    return parts.join(' ');
};

const getLanguageCode = (codeToCheck: string): string | null => {
    if (!ISO6391.validate(codeToCheck)) {
        return null;
    }

    return ISO6391.getName(codeToCheck);
};

export const formatLanguageCode = (code: string): string => {
    const codesToCheck = [code];

    if (code.length === 3) {
        // add code without last char
        codesToCheck.push(code.slice(0, 2));
    }

    for (const codeToCheck of codesToCheck) {
        const name = getLanguageCode(codeToCheck);
        if (name) {
            if (codeToCheck !== code) {
                return `${name} (${code})`;
            }
            return name;
        }
    }

    return code;
};

export const stripInvalidCharsForDataAttribute = (str: string): string =>
    str.replaceAll(/[^a-zA-Z0-9]/g, '');
