import { Block } from '../src/models/block';
import {fileToHeader} from '../src/utils/helpers'
import { MeetingBlockProcessor } from '../src/services/meeting-block-processor';

jest.mock('../src/utils/helpers', () => ({
    generateBacklink: jest.fn(() => ({ link: '[[file#^abc123|🖇️]]', anchor: 'abc123' })),
    generateUniqueCode : jest.fn( () => "xxxxxx"),
    fileToHeader: jest.fn().mockResolvedValue(undefined)
}));

const mockSettings = {
    myMeetingBlockAliase: '#meeting',
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
const lineContextFile = createMockFile('linecontext.md') as any

describe('MeetingBlockProcessor', () => {

    describe("process", () => {

            beforeEach(() => {
                    jest.clearAllMocks();
            });                      

            test('should process meeting block and create new meeting entry', async () => {
            const blockText = `# Test Header
                
            [[link1]]
            #meeting
            #30m
            
            Some content here.`;
            const block = new Block(blockText);

            expect(block.getContext()).toContain('[[link1]]');
            expect(block.getContext()).toHaveLength(1);

            const tp = new MeetingBlockProcessor(mockSettings);
            
            await tp.process(block, mockNewFile, mockCurrentFile);
            //File with line context mock returned from translator
            expect(fileToHeader).toHaveBeenCalledWith(
                "- [x] #meeting Test Header [[link1]] #30m [[new.md]]",
                mockCurrentFile,
                mockSettings.myTaskHeader
            );

        });
    })

});