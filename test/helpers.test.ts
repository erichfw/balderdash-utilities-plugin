import { generateUniqueCode, fileToHeader} from '../src/utils/helpers';
import { TFile } from 'obsidian';

// Mock TFile
class MockTFile {
    path: string;
    name: string;
    vault: any;

    constructor(path: string) {
        this.path = path;
        this.name = path.split('/').pop() || '';
        this.vault = {
            read: jest.fn().mockResolvedValue('# Todo\n\n- [ ] Existing content\n- [ ] Existing task content\n\n# Notes\n\n - This is a note\n\n# Another header\n\n - Existing content\n - Existing content'),            
            modify: jest.fn().mockResolvedValue('')
        };
    }
}

// Mock TFile
class MockTFileEmpty {
    path: string;
    name: string;
    vault: any;

    constructor(path: string) {
        this.path = path;
        this.name = path.split('/').pop() || '';
        this.vault = {
            read: jest.fn().mockResolvedValue(''),
            modify: jest.fn().mockResolvedValue('')
        };
    }
}


describe('Helpers', () => {

    describe('fileToHeader', () => {

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

        test('should add line to file under existing header', async () => {
            const line = "- [ ] This is a new line";
            const file = new MockTFile('tasks.md');
            
            await fileToHeader(line, file as TFile,mockSettings.myTaskHeader);
            
            expect(file.vault.read).toHaveBeenCalledWith(file);
            expect(file.vault.modify).toHaveBeenCalled();
            expect(file.vault.modify).toHaveBeenCalledWith(file,'# Todo\n\n- [ ] This is a new line\n- [ ] Existing content\n- [ ] Existing task content\n\n# Notes\n\n - This is a note\n\n# Another header\n\n - Existing content\n - Existing content\n\n');
        });
        
        test('should add line to file under new header if file is empty', async () => {
        
            const line = "This is a new line";
            const file = new MockTFileEmpty('empty.md');
            
            await fileToHeader(line, file as TFile, mockSettings.myTaskHeader);

            expect(file.vault.read).toHaveBeenCalled();
            expect(file.vault.modify).toHaveBeenCalled();
            expect(file.vault.modify).toHaveBeenCalledWith(file,"# Todo\n\nThis is a new line\n\n");
        });

        test('should create new header if file is not empty but does not have header', async () => {
            const line = "This is a new line";
            const file = new MockTFile('tasks.md');
            
            await fileToHeader(line, file as TFile, "# New header");

            expect(file.vault.read).toHaveBeenCalled();
            expect(file.vault.modify).toHaveBeenCalled();
            expect(file.vault.modify).toHaveBeenCalledWith(file,'# Todo\n\n- [ ] Existing content\n- [ ] Existing task content\n\n# Notes\n\n - This is a note\n\n# Another header\n\n - Existing content\n - Existing content\n\n# New header\n\nThis is a new line\n\n');
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