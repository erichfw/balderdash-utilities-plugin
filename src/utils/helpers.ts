/**
 * Generates a random alphanumeric code of specified length
 * @param length The length of the code to generate (default: 10)
 * @returns A random alphanumeric string
 */
export function generateUniqueCode(length = 10): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwqyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Extracts links and tags from a line of text
 * @param text The text to extract context from
 * @returns Array of links and tags
 */
export function extractLineContext(text: string): string[] {
    const links = text.match(/\[\[.*?\]\]/g) || [];
    const tags = text.match(/#\w+/g) || [];
    return [...links, ...tags];
}