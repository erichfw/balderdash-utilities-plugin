import { TFile } from 'obsidian';
import { Task } from '../models/task';
import { fileToHeader} from '../utils/helpers'
import { ContextTranslator } from './context-translator';

export interface TaskFileProcessorSettings {
  myTaskHeader:string;
}

export class TaskFileProcessor {
    private settings: TaskFileProcessorSettings;
    private translator: ContextTranslator;

    constructor(
        settings: TaskFileProcessorSettings,
        translator: ContextTranslator,
    ) {
        this.settings = settings;
        this.translator = translator;
    }


    /**
     * Processes a task line and files it to the appropriate destination
     * @param line - The line of text containing the task
     * @param index - Index of the line in the file
     * @param newFile - The new file being created/modified
     * @param currentFile - The current file being processed
     * @param destinationFiles - Array of potential destination files with context
     * @returns The processed line with added backlink anchor
     */

    async process(
        line: string,
        currentFile : TFile,
    ): Promise<string> {

        const task = new Task(line);
        const dest = this.translator.translateAll(task.getContext(), currentFile);

        if (dest.length > 0) {
            await fileToHeader(task.toString(),dest[0].file,this.settings.myTaskHeader);
            return "";
        }
        else return task.toString();        
    }   

}
