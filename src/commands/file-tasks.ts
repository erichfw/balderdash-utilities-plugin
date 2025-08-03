import { Command, Editor, MarkdownView } from 'obsidian';
import { ContextTranslator } from 'src/services/context-translator';
import { TaskFileProcessor } from 'src/services/task-file-processor';

interface Settings {
    myTaskHeader: string;
}

export class FileTaskCommand implements Command {
    id = 'balderdash-file-tasks';
    name =  'File tasks';
    settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
    }    

    async editorCallback (editor: Editor, view: MarkdownView) {
                
                const selection = editor.getSelection()
                const lines = selection.split('\n');
                const tp = new TaskFileProcessor(this.settings,new ContextTranslator(view.app))

                //Get related file
                const currentFile = view.app.vault.getFileByPath(view.file!.path);
                if (!currentFile) console.error('Current file cannot be opened in Balderdash plugin,');

                const processedLines = lines.map(line => tp.process(line,currentFile! ))
                editor.replaceSelection(processedLines.join("\n"));		
    }		            
}