import {Command, Editor, MarkdownView, TFile } from 'obsidian';
import { Block } from '../models/block';
import {fileToHeader} from '../utils/helpers';
import {ContextTranslator} from '../services/context-translator';
import {TaskProcessor } from 'src/services/task-line-processor';
import { ResourceProcessor } from 'src/services/resource-line-processor';

interface Settings {
	
	myTaskAliases: string[];
	myTaskHeader: string;
	myResourceAliases: string[];
	myResouceFile: string;
	myResourceHeader: string;
	myBlockListHeader: string;
	myDestinationOverwrite: string;
	// myBlockNoteFolder: string;
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

		const block = new Block(selection);
		console.debug(`Block context is: ${block.getContext()} `)
		console.debug(`Block header is: ${block.getHeader()} `)

		//Create new file
		//Todo: add test for alphanumeric
		const newfileparent = view.app.fileManager.getNewFileParent(view.file?.path || "");
		const nonAlphanumericRegex = /[^a-zA-Z0-9\s-]/g;
		const fileName = `${block.getHeaderValue()}`.replace(nonAlphanumericRegex,"").concat(".md");
		const fullPath = `${newfileparent.path}/${fileName}`;
		console.debug(`Will try and create a file with filename: ${fullPath}`)

		//Use existing file
		let newFile : TFile | null;
		if (!view.app.vault.getAbstractFileByPath(fullPath)){
			newFile = await view.app.vault.create(fullPath,"");	
		}
		else {
			newFile = await view.app.vault.getFileByPath(fullPath)
		}

		if (newFile && newFile!.name) {	console.log("Cannot read new file or read new file"); return;}

		//Get related file
		const currentFile : TFile = view.app.vault.getFileByPath(view.file!.path)!;
		const resourceFile : TFile = view.app.vault.getFileByPath(this.settings.myResouceFile)!;
		const destinationFiles = translator.translateAll(block.getContext(),currentFile);

		const taskProcessor1 = new TaskProcessor(this.settings,translator);
		const resourceProcessor1 = new ResourceProcessor(this.settings);
		block.mapEachLine(async (line,index) => {
			let newLine = line;
			newLine = await taskProcessor1.process(line, index, newFile!, currentFile, destinationFiles);
			newLine = await resourceProcessor1.process(newLine, index, newFile!, currentFile,resourceFile); 
			return newLine;
		} );
		
		//File block in each desintation, the first destination as embedded
		destinationFiles.forEach(async (f, i) => {
			if (i === 1) await fileToHeader(`#${block.getHeader()}\n\n![[${newFile!.path}]]\n`, f.file, this.settings.myBlockListHeader)
			else await fileToHeader(`#${block.getHeader()}\n\n[[${newFile!.path}]]\n`, f.file, this.settings.myBlockListHeader)
		})

		console.log("Trying to replace seletion:", selection);

		await view.app.vault.process(currentFile, (data) => data.replace(selection, `${block.getHeader()}\n\n![[${newFile!.path}]]`));

		editor.refresh();

		const index = editor.getValue().indexOf(`${block.getHeader()}`)
		if (index !== -1) {
			const from = editor.offsetToPos(index);
			const to = editor.offsetToPos(index + block.getHeader().length+1);
			editor.scrollIntoView({ from, to });
		}		
	} 
}