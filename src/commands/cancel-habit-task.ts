import moment from 'moment';
import { Command, Editor, MarkdownView } from 'obsidian';

interface Settings {
    myTaskAliases: string[];
}

export class CancelHabitTasksCommand implements Command {
    id = 'balderdash-cancel-habit-tasks';
    name =  'Cancel habits tasks';
    settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }    

    async editorCallback (editor: Editor, view: MarkdownView) {
                
                const selection = editor.getSelection()
                console.log('Processing selection:', selection);
                const lines = selection.split('\n');
                console.log(`Processing ${lines.length} lines`);	
                const processedLines = lines.map(line => {
                    if (line.includes('- [ ]') && line.includes("#habit"))
                        return line.replace("- [ ]","- [-]").concat(` ❌ ${moment().format("YYYY-MM-DD")}`)
                    return line;
                });

                editor.replaceSelection(processedLines.join("\n"));		
    }		            
}