import { TFile } from 'obsidian';
import { Task } from '../models/task';
import { Block } from '../models/block';
import { ContextTranslator } from './context-translator';
import moment from 'moment'
import {generateBacklink, fileToHeader} from '../utils/helpers'
import * as chrono from 'chrono-node';

export interface TaskProcessorSettings {
    myTaskAliases: string[];
    myDestinationOverwrite: string;
    myTaskHeader:string;
}

export class TaskProcessor {
    private settings: TaskProcessorSettings;
    private translator: ContextTranslator;

    constructor(
        settings: TaskProcessorSettings,
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
        index: number, 
        newFile: TFile,
        currentFile: TFile,
        destinationFiles: Array<{ file: TFile; contextItem: string }>
    ): Promise<string> {
        // Check if line contains any task aliases
        if (!this.settings.myTaskAliases.some(t => line.includes(t))) {
            return line;
        }
        if (line.includes("^")) {
            return line;
        }

        console.debug(`Processing "${line}" in task processor. `);

        // Generate backlink for the task
        const taskBacklink = generateBacklink(newFile);
        
        // Determine task destination based on line context
        const taskDestinations = this.translator.translateAll(Block.extractLineContext(line), currentFile);
        const taskDestination = taskDestinations.length > 0 ? taskDestinations[0] : null;
        
        // Select destination - use current file if overwrite flag present, otherwise use translated or first destination
        const selectedDest = line.includes(this.settings.myDestinationOverwrite) 
            ? currentFile 
            : taskDestination?.file || destinationFiles[0]?.file;
        
        
        // Remove destination overwrite flag and preprocess line
        line = line.replace(this.settings.myDestinationOverwrite, "");
        let taskline = this.preprocess(line);
        
        // Remove task aliases
        this.settings.myTaskAliases.forEach(t => taskline = taskline.replace(t, ""));

        // Create and configure task object
        const task = new Task(taskline);
        task.addContext(destinationFiles.map(f => f.contextItem));
        task.setBacklink(taskBacklink.link);    
        
        // Add backlink anchor to original line
        line = line.concat("^").concat(taskBacklink.anchor);

        // File task to destination under specified header
        await fileToHeader(task.toString(),selectedDest,this.settings.myTaskHeader);
        
        return line;
    }   

    //ToDo make this settings driven
    public preprocess(line: string) : string {
        let newLine : string = line;
        newLine = newLine.includes("#key-date") ? newLine.concat(" #action #0m") : newLine;
        newLine = chrono.parseDate(newLine) ? newLine.concat(` 📅${moment(chrono.parse(newLine, new Date(),{ forwardDate: true })[0].start.date()).format("YYYY-MM-DD")}`) : newLine
        newLine = newLine.includes("#follow-up") ? newLine.concat(" #action #5m").replace("#follow-up", "Follow up") : newLine; //short hand for #action #5m
        newLine = newLine.includes("#think-about") ? newLine.concat(" #action #30m").replace("#think-about", "Think about") : newLine; //short hand for #action #30m
        newLine = newLine.includes("#read") ? newLine.concat(" #action #30m").replace("#read", "Read") : newLine; //short hand for #action #30m
        newLine = newLine.includes("#today") ? newLine.replace("#today'", `📅${moment().format("YYYY-MM-DD")}`) : newLine; //short hand for #action  
        newLine = newLine.includes("#frog") ? newLine.replace("#frog", "#🐸") : newLine;
        return newLine;
    }
}
