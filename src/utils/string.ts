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
    str.replace(/[^a-zA-Z0-9.,!? ]/g, '');
