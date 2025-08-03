import { TFile } from 'obsidian';
import { Task } from '../models/task';
import { Block } from '../models/block';
import { fileToHeader} from '../utils/helpers'

export interface MeetingBlockProcessorSettings {
  myMeetingBlockAliase : string;
  myTaskHeader:string;
}

export class MeetingBlockProcessor {
    private settings: MeetingBlockProcessorSettings;

    constructor(
        settings: MeetingBlockProcessorSettings,
    ) {
        this.settings = settings;
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
        block: Block,
        newFile: TFile,
        currentFile: TFile,
    ): Promise<Block> {
        // Check if line contains any task aliases
        if ( !block.containsOtherTags(this.settings.myMeetingBlockAliase)) {
            return block;
        }

        const TASK_DURATION = /(#[0-9]{1,3}m)/; 

        // Generate backlink for the task
        const link  = `[[${newFile.path}]]`
        const duration = block.getOtherTags().join(" ").match(TASK_DURATION)![0] || "#15m"

        // Create and configure task object
        const task = new Task(`- [x] #meeting ${block.getHeaderValue()} ${duration}`);
        task.addContext(block.getContext());
        task.setBacklink(link);   
        
        // File task to destination under specified header
        await fileToHeader(task.toString(),currentFile,this.settings.myTaskHeader);
        
        return block;
    }   

}
