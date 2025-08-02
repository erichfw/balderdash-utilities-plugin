import { ResourceProcessor } from '../src/services/resource-line-processor';
import {fileToHeader} from '../src/utils/helpers'
import moment from 'moment'

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
    myResourceAliases: ['#resource-other', '#resource-pdf'],
    myResourceHeader: '# Resources',
    myResourceFile: 'Resources'
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
const mockResourceFile = createMockFile('resource.md') as any;


describe('ResourceProcessor', () => {
        
    describe("process", () => {

            beforeEach(() => {
                    jest.clearAllMocks();
            });                      

            test('should process resource line and file the resource', async () => {
                const line = 'resource #resource-pdf';

                const tp = new ResourceProcessor(mockSettings);
                
                const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockResourceFile);

                expect(fileToHeader).toHaveBeenCalledWith(
                    `- ${moment().format("YYYY-MM-DD")} - resource [[file#^abc123|🖇️]]`,
                    mockCurrentFile,
                "# Resources"
                );

                //File with line context mock returned from translator
                expect(fileToHeader).toHaveBeenCalledWith(
                    `- ${moment().format("YYYY-MM-DD")} - resource [[file#^abc123|🖇️]]`,
                    mockResourceFile,
                "# resource-pdf"
                );

                expect(result).toContain('resource #resource-pdf ^abc123');
             });

        test('should not process line that does not contain resource tag.', async () => {
            const line = '- #action #here Complete task';

            const tp = new ResourceProcessor(mockSettings);
            
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockResourceFile);
            expect(fileToHeader).not.toHaveBeenCalled();
            expect(result).toContain('- #action #here Complete task');
        });

        test('should not process lines that is already anchored', async () => {
            const line = '- resource #resource-pdf ^abc123';
            const tp = new ResourceProcessor(mockSettings);
            const result = await tp.process(line, 0, mockNewFile, mockCurrentFile, mockResourceFile);
            expect(fileToHeader).not.toHaveBeenCalled();
            expect(result).toContain('- resource #resource-pdf ^abc123');
        });
    })

});