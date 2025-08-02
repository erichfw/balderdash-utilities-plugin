// Mock the helpers module
jest.mock('../src/utils/helpers', () => ({
    generateUniqueCode: jest.fn(() => 'xxxxx'),
    extractLineContext: jest.fn(() => [])
}));

jest.mock('../src/services/context-translator', () => ({
    ContextTranslator: jest.fn().mockImplementation(() => ({
        translateAll: jest.fn(() => []),
        limitContext: jest.fn(() => [])
    }))
}));

import {ProcessBlockTasksCommand} from '../src/commands/balderdash-process-block';

// Mock Editor
class MockEditor {
    private selection = '';
    
    getSelection(): string {
        return this.selection;
    }
    
    setSelection(text: string): void {
        this.selection = text;
    }
    
    replaceSelection(text: string): void {
        this.selection = text;
    }
    
    refresh(): void {}
    
    getValue(): string {
        return this.selection;
    }
    
    offsetToPos(offset: number): any {
        return { line: 0, ch: offset };
    }
    
    scrollIntoView(range: any): void {}
}

// Mock MarkdownView
const createMockView = () => ({
    app: {
        vault: {
            create: jest.fn().mockResolvedValue({ path: 'test.md', name: 'test.md' }),
            getFileByPath: jest.fn().mockReturnValue({ path: 'source.md' }),
            process: jest.fn().mockResolvedValue('')
        },
        fileManager: {
            getNewFileParent: jest.fn().mockReturnValue('folder')
        }
    },
    file: { path: 'source.md', basename: 'source' }
});


// describe('ProcessBlockTasksCommand', () => {

//     const mockSettings = {
//         myTaskHeader:"# Todo",
//         myTaskAliases: ["#action","#follow-up","#think-about","#read"],
//         myResourceAliases: ["#resource","#resource-lucid","#resource-docx","#resource-xlsx","#resource-pptx","#resource-http","#resource-pdf","#resource-confluence","#resource-teams"],
//         myResouceFile: "Resources.md",
//         myResourceHeader:"# Resources",
//         myTaskDestinationOverwrite : "#here",
//         myBlockNoteFolder: "005 / Meeting Notes",
//         myBlockListHeader: "# Notes"
//     };
    
//     const command = new ProcessBlockTasksCommand(mockSettings);


//     const block = `# THIS IS A HEADER

//         [[person1]] [[outcome1]] 
//         [[outcome2]] [[community1]] #role1

//         - line one
//         - line two has line context #action #30m [[outcome 2]]
//         - line three has a preprocessing action #follow-up
//         - line four
//             - line five
//             - line six
//         - line seven is a #action #here
//     `

//     const block2 = `# THIS IS A HEADER

//         [[person1]] [[outcome1]] 
//         [[outcome2]] [[community1]] #role1

//         - line one
//         - line two has line context #action #30m [[outcome 2]] ^xxxxx
//         - line three has a preprocessing action Follow up #action #5m ^xxxxx
//         - line four
//             - line five
//             - line six
//         - line seven is a #action ^xxxxx 
//     `
    
//     // test('should handle empty selection - exit early', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection('');
        
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     expect("a").toBe('b');
//     // });
        
//     // test('should create new file - alinged to header name', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection('# Test Header\n\nContent');
       
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     expect(view.app.vault.create).toHaveBeenCalledWith("folder/Test Header.md","");
//     // });  

//     // test('should create new file - no header name', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection('Some content\nSome more content\n\nAnd more content');
       
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     expect(view.app.vault.create).toHaveBeenCalledWith("folder/xxxxx.md","");
//     // });  


//     // test('should preprocess lines with actions', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection(block);

//     //     await command.editorCallback(editor as any, view as any);
        
//     //     const result = editor.getSelection();
//     //     expect(result).toContain('Follow up'); // Preprocessing of #follow-up
//     //     expect(result).toContain('^'); // Block codes added
//     //     expect(result).toContain('![[test.md]]'); // File link created

//     //     expect(command.fileToHeader).toHaveBeenCalledWith("folder/xxxxx.md","");
//     // });

//     // test('should be filed correctly based on block context and associated destination', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection(block);
        
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     const result = editor.getSelection();
//     //     expect(result).toContain('[[person1]]'); // Context preserved
//     //     expect(result).toContain('[[outcome1]]'); // Context preserved
//     //     expect(result).toContain('![[test.md]]'); // Block filed to new file
//     // });  

//     // test('should add tasks to appropriate list in line with block context', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection('- #action Complete task [[outcome1]]');
        
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     // Task should be processed and filed based on context
//     //     expect(editor.getSelection()).toContain('^'); // Block code added
//     // });

//     // test('should add tasks to current list with #here overwrite', async () => {
//     //     const editor = new MockEditor();
//     //     const view = createMockView();
//     //     editor.setSelection('- #action #here Complete task');
        
//     //     await command.editorCallback(editor as any, view as any);
        
//     //     // Task should stay in current file due to #here
//     //     expect(editor.getSelection()).toContain('^'); // Block code added
//     // });
// });