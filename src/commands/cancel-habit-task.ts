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
                
                const selection = editor.getSelection();
                const lines = selection.split('\n');	
                const processedLines = lines.map(line => {
                    if (line.includes('- [ ]') && line.includes("#habit"))
                        return line.replace("- [ ]","- [-]").concat(` ❌ ${moment().format("YYYY-MM-DD")}`)
                    return line;
                });

                editor.replaceSelection(processedLines.join("\n"));		
    }		            
}