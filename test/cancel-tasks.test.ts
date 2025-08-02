import { CancelTasksCommand } from '../src/commands/cancel-tasks';
import { CancelHabitTasksCommand } from '../src/commands/cancel-habit-task';
import moment from 'moment';

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
}

// Mock MarkdownView
const mockView = {} as any;

describe('CancelTasksCommand', () => {
    const mockSettings = {
        myTaskHeader:"# Todo",
        myTaskAliases: ["#action","#follow-up","#think-about","#read"],
        myResourceAliases: ["#resource","#resource-lucid","#resource-docx","#resource-xlsx","#resource-pptx","#resource-http","#resource-pdf","#resource-confluence","#resource-teams"],
        myResouceFile: "Resources.md",
        myResourceHeader:"# Resources",
        myCurrentPageDestinationOverwrite : "#here",
        myBlockNoteFolder: "005 / Meeting Notes"
    };
    
    const command = new CancelTasksCommand(mockSettings);
    
    test('should cancel incomplete tasks', async () => {
        const editor = new MockEditor();
        editor.setSelection('- [ ] Task to cancel\n- [x] Already done');
        
        await command.editorCallback(editor as any, mockView);
        
        const result = editor.getSelection();
        expect(result).toContain(`- [-] Task to cancel ❌ ${moment().format("YYYY-MM-DD")}`);
        expect(result).toContain('- [x] Already done');
    });
    
    test('should not modify non-task lines', async () => {
        const editor = new MockEditor();
        editor.setSelection('Regular text\n- [ ] Task to cancel\nMore text');
        
        await command.editorCallback(editor as any, mockView);
        
        const result = editor.getSelection();
        expect(result).toContain(`Regular text\n- [-] Task to cancel ❌ ${moment().format("YYYY-MM-DD")}\nMore text`);
    });
    
    test('should handle empty selection', async () => {
        const editor = new MockEditor();
        editor.setSelection('');
        
        await command.editorCallback(editor as any, mockView);
        
        expect(editor.getSelection()).toBe('');
    });
});

describe('CancelHabitTasksCommand', () => {
    const mockSettings = {
        myTaskAliases: ['#follow-up'],
        myTaskTag: '#action',
        myResourceTags: ['#resource']
    };
    
    const command = new CancelHabitTasksCommand(mockSettings);
    
    test('should cancel only habit tasks', async () => {
        const editor = new MockEditor();
        editor.setSelection('- [ ] Regular task\n- [ ] Habit task #habit\n- [ ] Another habit #habit');
        
        await command.editorCallback(editor as any, mockView);
        
        const result = editor.getSelection();
        expect(result).toContain('- [ ] Regular task');
        expect(result).toContain('- [-] Habit task #habit ❌');
        expect(result).toContain('- [-] Another habit #habit ❌');
    });
    
    test('should not cancel non-habit tasks', async () => {
        const editor = new MockEditor();
        editor.setSelection('- [ ] Task without habit tag\n- [ ] Another regular task');
        
        await command.editorCallback(editor as any, mockView);
        
        const result = editor.getSelection();
        expect(result).toContain('- [ ] Task without habit tag');
        expect(result).toContain('- [ ] Another regular task');
        expect(result).not.toContain('❌');
    });
    
    test('should add current date when cancelling', async () => {
        const editor = new MockEditor();
        editor.setSelection('- [ ] Habit task #habit');
        
        await command.editorCallback(editor as any, mockView);
        
        const result = editor.getSelection();
        expect(result).toContain(`❌ ${moment().format("YYYY-MM-DD")}`);
    });
});