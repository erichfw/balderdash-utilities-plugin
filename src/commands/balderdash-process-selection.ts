/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Command, Editor, MarkdownView } from 'obsidian';
import { Block } from '../models/block';
import {ContextTranslator} from '../services/context-translator';
import {TaskProcessor } from 'src/services/task-line-processor';
import { ResourceProcessor } from 'src/services/resource-line-processor';
import { AcronymProcessor } from 'src/services/acronym-line-processor';

interface Settings {
	
	myTaskAliases: string[];
	myTaskHeader: string;
	myResourceAliases: string[];
	myResouceFile: string;
	myAcronymFile: string;
	myResourceHeader: string;
	myBlockListHeader: string;
	myDestinationOverwrite: string;
	myAcronymHeader:string;
	myAcronymAliases:string[];
	myBlockNoteFolder: string;
	myMeetingBlockAliase:string;
}

export enum Level {
    NEWFILE = 1,
    EMBEDFULL = 2,
    EMBEDHARD = 3,
	EMBEDSOFT = 4
}

export class ProcessSelectionTasksCommand implements Command {
	id = 'balderdash-process-selection';
	name = 'Process Balderdash Selection';
	settings: Settings;

	constructor(settings: Settings) {
		this.settings = settings;
	}    

	editorCallback = async (editor: Editor, ctx: MarkdownView) => {
		if (!('app' in ctx)) return;
		const view = ctx as MarkdownView;
		const selection = editor.getSelection();
		if (selection === "") return;

		const translator = new ContextTranslator(view.app);
				
		//Determine block 

		let block = new Block(selection);

		//Get related file
		const currentFile = view.app.vault.getFileByPath(view.file!.path);
		const resourceFile  = view.app.vault.getFileByPath(this.settings.myResouceFile);
		const acronymFile = view.app.vault.getFileByPath(this.settings.myAcronymFile);

		if (!currentFile) console.error('Current file cannot be opened in Balderdash plugin.');
		if (!resourceFile) console.error('Resource file cannot be opened in Balderdash plugin.');
		if (!acronymFile) console.error('Acronym file cannot be opened in Balderdash plugin.');

		//Line processors

		const taskProcessor1 = new TaskProcessor(this.settings,translator);
		const resourceProcessor1 = new ResourceProcessor(this.settings);
		const acronymProcessor1 = new AcronymProcessor(this.settings);

		block = await block.mapEachLine(async (line,index) => await taskProcessor1.process(line, index, currentFile!, currentFile!, []))
		block = await block.mapEachLine(async (line,index) => await resourceProcessor1.process(line, index, currentFile!, currentFile!,resourceFile!));
		block = await block.mapEachLine(async (line,index) => await acronymProcessor1.process(line, index, currentFile!, currentFile!,acronymFile!));
				
		console.debug("Trying to replace seletion:", selection);

		await view.app.vault.process(currentFile!, (data) => data.replace(selection, `${block.getText()}`));

		// editor.refresh();
		// editor.focus();

		// const index = editor.getValue().indexOf(`${block.getHeader()}`)
		// if (index !== -1) {
		// 	const from = editor.offsetToPos(index);
		// 	const to = editor.offsetToPos(index + block.getHeader().length+1);
		// 	editor.scrollIntoView({ from, to });
		// }	
		
	} 
}