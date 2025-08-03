import { ContextType } from '../src/services/context-translator';
import {TaskFileProcessor } from '../src/services/task-file-processor';
import {fileToHeader} from '../src/utils/helpers'


const mockSettings = {
    myTaskHeader: '# Todos'
};

jest.mock('../src/utils/helpers', () => ({
    generateBacklink: jest.fn(() => ({ link: '[[file#^abc123|🖇️]]', anchor: 'abc123' })),
    fileToHeader: jest.fn().mockResolvedValue(undefined)
}));

const createMockFile = (path : string) => ( {
        path : path,
        name : path.split('/').pop() || '',
        vault : {
            read: jest.fn().mockResolvedValue(''),
            modify: jest.fn().mockResolvedValue('')
        }
    }
)

const mockCurrentFile = createMockFile('current.md') as any;
const myDestinationFile  = createMockFile('destination.md') as any;


describe('TaslFileProcessor', () => {
        
    describe("process", () => {

            beforeEach(() => {
                    jest.clearAllMocks();
            });                      

            test('should refile line if context can be discovered', async () => {
                const line = '- [ ] Task line with context';
                
                const translator = {
                    translateAll :  () => [{
                        contextItem : "[[context]]",
                        file: myDestinationFile,
                        type: ContextType.OUTCOME
                    }]
                }

                const tp = new TaskFileProcessor(mockSettings,translator as any);
                
                const result = await tp.process(line, mockCurrentFile);

                expect(fileToHeader).toHaveBeenCalledWith(
                    `- [ ] Task line with context #15m`,
                    myDestinationFile,
                    mockSettings.myTaskHeader
                );

                expect(result).toEqual("");
             });

        test('should not refile if context cannot be discovered.', async () => {
              const line = '- [ ] Task line with context';
                
                const translator = {
                    translateAll :  () => []
                }

                const tp = new TaskFileProcessor(mockSettings,translator as any);
                
                const result = await tp.process(line, mockCurrentFile);

                expect(fileToHeader).not.toHaveBeenCalled();
                expect(result).toEqual("- [ ] Task line with context #15m");
        });

    })

});