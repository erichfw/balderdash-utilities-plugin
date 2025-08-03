import { generateUniqueCode, fileToHeader} from '../src/utils/helpers';

describe('Helpers', () => {

    describe('fileToHeader', () => {
       const mockProcess = jest.fn();

        const mockFile = {
            name: 'test.md',
            vault: {
            process: mockProcess,
            },
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should handle empty file', async () => { 

            const existingContent = "";
            const lines = 'This is a new line';
            const header = '# Todo';

            await fileToHeader(lines, mockFile as any, header);

            const [[, callback]] = mockProcess.mock.calls;
            const result = callback(existingContent);
            expect(result).toBe("# Todo\n\nThis is a new line")

            expect(mockProcess).toHaveBeenCalledTimes(1);
            expect(mockProcess).toHaveBeenCalledWith(mockFile, expect.any(Function));

        });

        test('should replace existing header', async () => {
            
            const existingContent = "# Todo\nThis is an existing item";
            const lines = 'This is a new line';
            const header = '# Todo';

            await fileToHeader(lines, mockFile as any, header);

            const [[, callback]] = mockProcess.mock.calls;
            const result = callback(existingContent);
            expect(result).toBe("# Todo\n\nThis is a new line\nThis is an existing item")

            expect(mockProcess).toHaveBeenCalledTimes(1);
            expect(mockProcess).toHaveBeenCalledWith(mockFile, expect.any(Function));

        });

        test('should append to file when header not found', async () => {
            const existingContent = "# Notes\nexisiting note";
            const lines = 'This is a new line';
            const header = '# Todo';

            await fileToHeader(lines, mockFile as any, header);

            const [[, callback]] = mockProcess.mock.calls;
            const result = callback(existingContent);
            expect(result).toBe(`# Notes\nexisiting note\n\n${header}\n\n${lines}`);

            expect(mockProcess).toHaveBeenCalledTimes(1);
            expect(mockProcess).toHaveBeenCalledWith(mockFile, expect.any(Function));
        });

        test('should return early if no file provided', async () => {
            await fileToHeader('- new task', null as any, '# Tasks');
            
            expect(mockFile.vault.process).not.toHaveBeenCalled();
        });
    });


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
})