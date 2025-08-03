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

	editorCallback = async (editor: Editor, ctx: MarkdownView | any) => {
		if (!('app' in ctx)) return;
		const view = ctx as MarkdownView;
		const selection = editor.getSelection();
		if (selection === "") return;

		const translator = new ContextTranslator(view.app);
				
		//Determine block 

		let block = new Block(selection);
		console.debug(`Block context is: ${block.getContext()} `)
		console.debug(`Block header is: ${block.getHeader()} `)

		//Create new file
		//Todo: add test for alphanumeric
		const nonAlphanumericRegex = /[^a-zA-Z0-9\s-]/g;
		const fileName = `${block.getHeaderValue()}`.replace(nonAlphanumericRegex,"").concat(".md");
		const fullPath = `${this.settings.myBlockNoteFolder}/${fileName}`;
		console.debug(`Will try and create a file with filename: ${fullPath}`)

		//Use existing file
		const abstractFile = await view.app.vault.getAbstractFileByPath(fullPath);
		console.debug(`File read: ${abstractFile}`);
		
		let newFile : TFile;
	
		if (!abstractFile){
			console.debug(`Creating file: ${fullPath}`);
			newFile = await view.app.vault.create(fullPath,"");	
		}
		else {
			console.debug(`Reusing file: ${fullPath}`);
			newFile = await view.app.vault.getFileByPath(fullPath)!
		}

		console.log("File read: ", newFile);

		if (!newFile) {	console.log("Cannot read new file or read new file"); return;}

		//Get related file
		const currentFile = view.app.vault.getFileByPath(view.file!.path);
		const resourceFile  = view.app.vault.getFileByPath(this.settings.myResouceFile);
		const acronymFile = view.app.vault.getFileByPath(this.settings.myAcronymFile);

		if (!currentFile) console.log('Current file cannot be opened in bladerdash plugin');
		if (!resourceFile) console.log('Resource file cannot be opened in bladerdash plugin');
		if (!acronymFile) console.log('Acronym file cannot be opened in bladerdash plugin');

		const destinationFiles = translator.translateAll(block.getContext(),currentFile!);

		if (destinationFiles.length === 0) console.log('No destination file cannot be identified in bladerdash plugin');

		//Line processors

		const taskProcessor1 = new TaskProcessor(this.settings,translator);
		const resourceProcessor1 = new ResourceProcessor(this.settings);
		const acronymProcessor1 = new AcronymProcessor(this.settings);

		block = await block.mapEachLine(async (line,index) => await taskProcessor1.process(line, index, newFile!, currentFile!, destinationFiles))
		block = await block.mapEachLine(async (line,index) => await resourceProcessor1.process(line, index, newFile!, currentFile!,resourceFile!));
		block = await block.mapEachLine(async (line,index) => await acronymProcessor1.process(line, index, newFile!, currentFile!,acronymFile!));
	

		//Block processors

		const meetingProcessor = new MeetingBlockProcessor(this.settings);
		block = await meetingProcessor.process(block, newFile!, currentFile!);

		console.log(destinationFiles);
		
		//File block in each desintation, the first destination as embedded
		destinationFiles.forEach(async (f, i) => {
			if (i === 0) await fileToHeader(`${block.getHeader()}\n\n![[${newFile!.basename}]]\n`, f.file, this.settings.myBlockListHeader)
			else await fileToHeader(`## [[${newFile!.basename}]]\n`, f.file, this.settings.myBlockListHeader)
		})
		
		console.log("Trying to replace seletion:", selection);

		await view.app.vault.process(currentFile!, (data) => data.replace(selection, `${block.getHeader()}\n\n![[${newFile!.path}]]`));
		await view.app.vault.process(newFile!, (data) => {
			let lines = block.getContext().join("\n").concat("\n\n");
			lines = lines + block.getOtherTags().join("\n").concat("\n\n");
			lines = lines + block.getText();
			return lines;
		});

		// editor.refresh();
		// editor.focus();

		// const index = editor.getValue().indexOf(`${block.getHeader()}`)
		// if (index !== -1) {
		// 	const from = editor.offsetToPos(index);
		// 	const to = editor.offsetToPos(index + block.getHeader().length+1);
		// 	editor.scrollIntoView({ from, to });
		// }	
		
		// Open new file in new tab
		await view.app.workspace.openLinkText(newFile!.path, currentFile!.path, true);

	} 
}