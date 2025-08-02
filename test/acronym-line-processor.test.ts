import {fileToHeader} from '../src/utils/helpers'
import moment from 'moment'
import { AcronymProcessor } from '../src/services/acronym-line-processor';

// Mock dependencies
jest.mock('../src/models/block', () => ({
    Block: {
        extractLineContext: jest.fn(() => ['[[context]]'])
    }
}));

jest.mock('../src/utils/helpers', () => ({
    generateBacklink: jest.fn(() => ({ link: '[[file#^abc123|🖇️]]', anchor: 'abc123' })),
    fileToHeader: jest.fn().mockResolvedValue(undefined)
}));

const mockSettings = {
    myAcronymAliases: ['#acronym'],
    myAcronymHeader: '# Resources and Acronyms',
};

const createMockFile = (path : string) => ( {
        path : path,
        name : path.split('/').pop() || '',
        vault : {
            read: jest.fn().mockResolvedValue(''),
            modify: jest.fn().mockResolvedValue('')
        }
    }
)

const mockNewFile = createMockFile('new.md') as any;
const mockCurrentFile = createMockFile('current.md') as any;
const mockAcronymFile = createMockFile('acronyms.md') as any;


describe('AcronymsProcessor', () => {
        
    describe("process", () => {

            beforeEach(() => {
                    jest.clearAllMocks();
            });                      

            test('should process acronyms line and file the resource', async () => {
                const line = 'ABC - alpha brovo charly #acronym';

                const tp = new AcronymProcessor(mockSettings);
                
                const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockAcronymFile);

                expect(fileToHeader).toHaveBeenCalledWith(
                    `- ${moment().format("YYYY-MM-DD")} - ABC - alpha brovo charly [[file#^abc123|🖇️]]`,
                    mockCurrentFile,
                "# Resources and Acronyms"
                );

                //File with line context mock returned from translator
                expect(fileToHeader).toHaveBeenCalledWith(
                    `- ${moment().format("YYYY-MM-DD")} - ABC - alpha brovo charly [[file#^abc123|🖇️]]`,
                    mockAcronymFile,
                "# Resources and Acronyms"
                );

                expect(result).toContain('ABC - alpha brovo charly #acronym ^abc123');
             });

        test('should not process line that does not contain acronym tag.', async () => {
            const line = '- #action #here Complete task';

             const tp = new AcronymProcessor(mockSettings);
            
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockAcronymFile);
            expect(fileToHeader).not.toHaveBeenCalled();
            expect(result).toContain('- #action #here Complete task');
        });

        test('should not process lines that is already anchored', async () => {
            const line = '- resource #acronym ^abc123';
            const tp = new AcronymProcessor(mockSettings);
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockAcronymFile);
            expect(fileToHeader).not.toHaveBeenCalled();
            expect(result).toContain('- resource #acronym ^abc123');
        });
    })

});