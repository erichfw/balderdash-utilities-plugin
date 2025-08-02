import { ContextType } from '../src/services/context-translator';
import { TaskProcessor } from '../src/services/task-line-processor';
import {fileToHeader} from '../src/utils/helpers'

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
    myTaskAliases: ['#action', '#follow-up'],
    myDestinationOverwrite: '#here',
    myTaskHeader: '# Tasks'
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
const lineContextFile = createMockFile('linecontext.md') as any;
const mockDestinationFiles = [{ file: createMockFile( 'blockdest.md' ), contextItem: '[[blockdest]]' }] as any;


describe('TaskProcessor', () => {
        
    
    describe('preprocess', () => {

        const mockSettings = {
            myTaskHeader:"# Todo",
            myTaskAliases: ["#action","#follow-up","#think-about","#read"],
            myResourceAliases: ["#resource","#resource-lucid","#resource-docx","#resource-xlsx","#resource-pptx","#resource-http","#resource-pdf","#resource-confluence","#resource-teams"],
            myResouceFile: "Resources.md",
            myResourceHeader:"# Resources",
            myDestinationOverwrite : "#here",
            myBlockNoteFolder: "005 / Meeting Notes",
            myBlockListHeader: "# Notes"
        };

        const mockTranslator = {};
        const command = new TaskProcessor(mockSettings,mockTranslator as any)

        test('should decode #think-about allias to #action #30m and add "Think about" in pre-processing', async () => {
            const result =  command.preprocess('- #think-about abc');
            expect(result).toContain('- Think about abc #action #30m');
        });

        test('should decode #key-date and attempt to extract date', async () => {
            const result =  command.preprocess('- #think-about abc');
            expect(result).toContain('- Think about abc #action #30m');
        });

        test('should decode #read allias to #action #30m and add "Read" in pre-processing', async () => {
            const result =  command.preprocess('- #read abc');
            expect(result).toContain('- Read abc #action #30m');
        });

        test('should decode #follow-up allias to #action #5m and add "Follow up" in pre-processing', async () => {
            const result = command.preprocess('- #follow-up with someone');
            expect(result).toContain('- Follow up with someone #action #5m');
        });

        test('should decode #frog in preprocessing block #frog', async () => {
            const result =  command.preprocess('- This is a #frog line');
            expect(result).toContain('- This is a #🐸 line');
        });
       
    });

    describe("process", () => {

            beforeEach(() => {
                    jest.clearAllMocks();
            });                      

            test('should process task line and file with line context', async () => {
            const line = '- #action Complete project';
            const mockTranslator = {
                translateAll: jest.fn((contextItems: string[], sourcePath:any) => [{ file: lineContextFile, contextItem: '[[context]]' , type : ContextType.COMMUNITY}])
            };
            const tp = new TaskProcessor(mockSettings,mockTranslator as any);
            
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockDestinationFiles);
            //File with line context mock returned from translator
            expect(fileToHeader).toHaveBeenCalledWith(
                "- [ ] Complete project [[context]] [[blockdest]] #15m [[file#^abc123|🖇️]]",
                lineContextFile,
                mockSettings.myTaskHeader
            );

            expect(result).toContain('^abc123');
        });

        test('should process #here line to file in current file', async () => {
            const line = '- #action #here Complete task';
            const mockTranslator = {
                translateAll: jest.fn((contextItems: string[], sourcePath:any) => [{ file: lineContextFile, contextItem: '[[context]]' , type : ContextType.COMMUNITY}])
            };
            const tp = new TaskProcessor(mockSettings,mockTranslator as any);
            
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockDestinationFiles);
            expect(fileToHeader).toHaveBeenCalledWith(
                "- [ ] Complete task [[context]] [[blockdest]] #15m [[file#^abc123|🖇️]]",
                mockCurrentFile,
                mockSettings.myTaskHeader
            );
            expect(result).not.toContain('#here');
        });

        test('should not process line when no task aliases present', async () => {
            const line = '- Regular line without task alias';
            const mockTranslator = {};
            const tp = new TaskProcessor(mockSettings,mockTranslator as any);
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockDestinationFiles);
            expect(result).toBe(line);
            expect(fileToHeader).not.toHaveBeenCalled();
        });
    })

});