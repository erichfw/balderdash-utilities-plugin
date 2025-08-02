   
   import moment from 'moment';
   import { Command, Editor, MarkdownView } from 'obsidian';
   
   interface Settings {
       myTaskAliases: string[];
   }
   
   export class CancelTasksCommand implements Command {
       id = 'balderdash-cancel-tasks';
       name = 'Cancel tasks';
       settings: Settings;
   
       constructor(settings: Settings) {
           this.settings = settings;
       }    
   
       editorCallback = async (editor: Editor, view: MarkdownView) => {
                   
        const selection = editor.getSelection()
        console.log('Processing selection:', selection);
        const lines = selection.split('\n');
        console.log(`Processing ${lines.length} lines`);	
        const processedLines = lines.map(line => {
            if (line.includes('- [ ]')) 
                return line.replace("- [ ]","- [-]").concat(` ❌ ${moment().format("YYYY-MM-DD")}`)
            return line;
        });

        editor.replaceSelection(processedLines.join("\n"));	
    }    
}