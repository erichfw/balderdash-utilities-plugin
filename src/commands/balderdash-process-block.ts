/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Command, Editor, MarkdownView, TFile } from 'obsidian';
import { Block } from '../models/block';
import {fileToHeader} from '../utils/helpers';
import {ContextTranslator} from '../services/context-translator';
import {TaskProcessor } from 'src/services/task-line-processor';
import { ResourceProcessor } from 'src/services/resource-line-processor';
import { AcronymProcessor } from 'src/services/acronym-line-processor';
import { MeetingBlockProcessor } from 'src/services/meeting-block-processor';

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

export class ProcessBlockTasksCommand implements Command {
	id = 'balderdash-process-block';
	name = 'Process Balderdash block';
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

		//Create new file
		//Todo: add test for alphanumeric
		const nonAlphanumericRegex = /[^a-zA-Z0-9\s-]/g;
		const fileName = `${block.getHeaderValue()}`.replace(nonAlphanumericRegex,"").concat(".md");
		const fullPath = `${this.settings.myBlockNoteFolder}/${fileName}`;

		//Use existing file
		const abstractFile = await view.app.vault.getAbstractFileByPath(fullPath);
		
		let newFile : TFile;
	
		if (!abstractFile){
			console.debug(`Creating file: ${fullPath}`);
			newFile = await view.app.vault.create(fullPath,"");	
		}
		else {
			console.debug(`Reusing file: ${fullPath}`);
			newFile = await view.app.vault.getFileByPath(fullPath)!
		}

		if (!newFile) {	console.error("Cannot read new file or read new file"); return;}

		//Get related file
		const currentFile = view.app.vault.getFileByPath(view.file!.path);
		const resourceFile  = view.app.vault.getFileByPath(this.settings.myResouceFile);
		const acronymFile = view.app.vault.getFileByPath(this.settings.myAcronymFile);

		if (!currentFile) console.error('Current file cannot be opened in Bladerdash plugin.');
		if (!resourceFile) console.error('Resource file cannot be opened in Bladerdash plugin.');
		if (!acronymFile) console.error('Acronym file cannot be opened in Bladerdash plugin.');

		const blockContextDestination = translator.translateAll(block.getContext(),currentFile!);

		if (blockContextDestination.length === 0) console.error('No destination file can be identified in Bladerdash plugin.');

		//Line processors

		const taskProcessor1 = new TaskProcessor(this.settings,translator);
		const resourceProcessor1 = new ResourceProcessor(this.settings);
		const acronymProcessor1 = new AcronymProcessor(this.settings);

		block = await block.mapEachLine(async (line,index) => await taskProcessor1.process(line, index, newFile!, currentFile!, blockContextDestination))
		block = await block.mapEachLine(async (line,index) => await resourceProcessor1.process(line, index, newFile!, currentFile!,resourceFile!));
		block = await block.mapEachLine(async (line,index) => await acronymProcessor1.process(line, index, newFile!, currentFile!,acronymFile!));
	

		//Block processors

		const meetingProcessor = new MeetingBlockProcessor(this.settings);
		block = await meetingProcessor.process(block, newFile!, currentFile!);


		//File block in each desintation, the first destination as embedded

		blockContextDestination.forEach(async (f, i) => {
			if (i === 0) await fileToHeader(`${block.getHeader()}\n\n![[${newFile!.basename}]]\n`, f.file, this.settings.myBlockListHeader)
			else await fileToHeader(`## [[${newFile!.basename}]]\n`, f.file, this.settings.myBlockListHeader)
		})

		await view.app.vault.process(currentFile!, (data) => data.replace(selection, `${block.getHeader()}\n\n![[${newFile!.path}]]`));
		await view.app.vault.process(newFile!, (data) => {
			let lines = block.getContext().join("\n").concat("\n\n");
			lines = lines + block.getOtherTags().join("\n").concat("\n\n");
			lines = lines + block.getText();
			return lines;
		});

		// Open new file in new tab
		await view.app.workspace.openLinkText(newFile!.path, currentFile!.path, true);

		editor.refresh();
		editor.focus();

	} 
}