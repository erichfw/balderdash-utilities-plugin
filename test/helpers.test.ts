import { generateUniqueCode, extractLineContext } from '../src/utils/helpers';

describe('Helpers', () => {
    describe('generateUniqueCode', () => {
        test('should generate code with default length of 10', () => {
            const code = generateUniqueCode();
            expect(code).toHaveLength(10);
        });

        test('should generate code with specified length', () => {
            const code = generateUniqueCode(5);
            expect(code).toHaveLength(5);
        });

        test('should generate different codes on multiple calls', () => {
            const code1 = generateUniqueCode();
            const code2 = generateUniqueCode();
            expect(code1).not.toBe(code2);
        });

        test('should only contain alphanumeric characters', () => {
            const code = generateUniqueCode(20);
            expect(code).toMatch(/^[0-9A-Za-z]+$/);
        });
    });

    describe('extractLineContext', () => {
        test('should extract links from text', () => {
            const text = 'This has [[link1]] and [[link2]]';
            const context = extractLineContext(text);
            expect(context).toContain('[[link1]]');
            expect(context).toContain('[[link2]]');
        });

        test('should extract tags from text', () => {
            const text = 'This has #tag1 and #tag2';
            const context = extractLineContext(text);
            expect(context).toContain('#tag1');
            expect(context).toContain('#tag2');
        });

        test('should extract both links and tags', () => {
            const text = 'Mixed [[link]] and #tag content';
            const context = extractLineContext(text);
            expect(context).toContain('[[link]]');
            expect(context).toContain('#tag');
            expect(context).toHaveLength(2);
        });

        test('should return empty array for text without context', () => {
            const text = 'Plain text without links or tags';
            const context = extractLineContext(text);
            expect(context).toHaveLength(0);
        });

        test('should handle complex links with sections', () => {
            const text = 'Link to [[file#section]] here';
            const context = extractLineContext(text);
            expect(context).toContain('[[file#section]]');
        });

        test('should handle complex links rename', () => {
            const text = 'Link to [[file|rename]] here';
            const context = extractLineContext(text);
            expect(context).toContain('[[file|rename]]');
        });

        test('should handle complex nested tags', () => {
            const text = 'Tag with numbers #tag/tag2/tag3 here';
            const context = extractLineContext(text);
            expect(context).toContain('#tag/tag2/tag3');
        });
    });
});