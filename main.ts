import moment from 'moment';
import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, TFile, Vault } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	myTaskTag: string;
	myTaskAlliases: string[];
	myDailyTaskHeader: string;
	myResourceTags: string[];
	myResouceFile: string;
	myProjectTags: string[];
	myProjectFiles: string[];
	myDailyResouceHeader: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	myTaskTag:"#action",
	myDailyTaskHeader:"## Todo",
	myTaskAlliases: ["#follow-up","#think-about","#read"],
	myResourceTags: ["#resource","#resource-lucid","#resource-docx","#resource-xlsx","#resource-pptx","#resource-http","#resource-pdf","#resource-confluence","#resource-teams"],
	myResouceFile: "Resources.md",
	myDailyResouceHeader:"# Resources",
	myProjectTags: ["#people","#personal","#delivery","#leadership","#product-engineering"],
	myProjectFiles: ["#people","#personal","#delivery","#leadership","#product-engineering"],
}

// Function to generate a random 5-digit alphanumeric code
function generateUniqueCode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwqyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


async function updateSectionLists(sectionHeader : string, items: string[], editor : Editor) {
    if (items.length > 0) {
		const fileContent = editor.getDoc().getValue()
		console.log(`Processing ${items.length} items for header: ${sectionHeader}`);	
		const newBlock = `${sectionHeader}\n\n${items.join("\n")} `
		console.log(`New block: ${newBlock}`);
		if (fileContent.contains(sectionHeader)) {
			console.log(`Existing list found, inserting items under ${sectionHeader}`);
			const exitingListHeaderStart = fileContent.toLowerCase().indexOf(sectionHeader.toLowerCase());
			const listMarker = "-";
			const exitingListStart = fileContent.toLowerCase().indexOf(listMarker,exitingListHeaderStart);
			console.log(`Header start position: ${exitingListHeaderStart}, List start position: ${exitingListStart}`);
			editor.setSelection(editor.offsetToPos(exitingListHeaderStart),editor.offsetToPos(exitingListStart-1));
			editor.replaceSelection(newBlock)
		} else {
			console.log(`Existing list not found, creating new list under ${sectionHeader} at end of file`);
			editor.setSelection(editor.offsetToPos(fileContent.length));
			editor.replaceSelection(newBlock.concat("\n\n"));
		}
		
    }
}

function insertTableItem(tags: Map<string, string[]>, vault: Vault, file:TFile) {
    if (tags.size > 0) {
		vault.cachedRead(file).then((fileContent) => {		
			for (const [tag, tagItems] of tags.entries()) {
					console.log(`Processing tag ${tag} with ${tagItems.length} items`);
					if (fileContent.includes(tag)) {
						console.log(`Existing table found for tag: "${tag}"`);
						const exitingListHeaderStart = fileContent.toLowerCase().indexOf(`# ${tag.toLowerCase()}`);
						const tableMarker = "--- |\n";
						const exitingListStart = fileContent.toLowerCase().indexOf(tableMarker,exitingListHeaderStart);
						const newBlock = `${tagItems.join("\n")}`
						fileContent = fileContent.substring(0,exitingListStart+tableMarker.length).concat(newBlock).concat("\n").concat(fileContent.substring(exitingListStart+tableMarker.length,fileContent.length));
					} else {
						console.log(`Existing table not found for tag: "${tag}"`);
						const newBlock = `# ${tag}\n\n| Date |  Resource Link  | Source  | Tags |\n| --- | --- | --- | --- |\n${tagItems.join("\n").concat("\n")}`
						console.log(`New table to append: ${newBlock}`);
						
					}
				}	
				vault.process(file, (data) => fileContent);
			}).catch((err) => console.log(err));
    }
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		console.log('Plugin settings loaded:', this.settings);

		this.addCommand({
			id: 'balderdash-cancel-task',
			name: 'Cancel task',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				
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
		}});

		this.addCommand({
			id: 'balderdash-cancel-habit-task',
			name: 'Cancel habits task',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				
				const selection = editor.getSelection()
				console.log('Processing selection:', selection);
				const lines = selection.split('\n');
				console.log(`Processing ${lines.length} lines`);	
				const processedLines = lines.map(line => {
					if (line.includes('- [ ]') && line.includes("#habit"))
						return line.replace("- [ ]","- [-]").concat(` ❌ ${moment().format("YYYY-MM-DD")}`)
					return line;
				});

				editor.replaceSelection(processedLines.join("\n"));		
		}});

		this.addCommand({
			id: 'balderdash-process-selection',
			name: 'Process selection',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				
				const selection = editor.getSelection()
				console.log('Processing selection:', selection);
				const lines = selection.split('\n');
				console.log(`Processing ${lines.length} lines`);
				const taskItems : string[] = [];
				const resourceItems : string[] = [];
				const resourceItemsByTag = new Map<string, string[]>();			
				const processedLines = lines.map(line => {

					if (!line.includes('^')) {
						const blockCode = generateUniqueCode();
						console.log(`Generated block code: ${blockCode} for line: ${line}`);
						let processed = false;
						if (this.settings.myTaskAlliases.concat(this.settings.myTaskTag).some(tag => line.includes(tag))) {
							console.log(`Processing task line: ${line}`);
							const regex = /^\s*-\s*/;						
							taskItems.push("- [ ] ".concat(line.replace(regex, "").trim()).replace(this.settings.myTaskTag, "").concat(` ➕${moment().format("YYYY-MM-DD")}`).trim().concat(` [[${view.file?.basename}#^${blockCode}|🖇️]]`));
							processed = true;
						}
						if (this.settings.myResourceTags.some(tag => line.includes(tag))) {					
							console.log(`Processing resource line: ${line}`);
							const regex = /^\s*-\s*/;
							resourceItems.push(" - ".concat(line.replace(regex, "").trim()).trim().concat(`[[${view.file?.basename}#^${blockCode}|🖇️]]`));
							this.settings.myResourceTags.forEach(tag => {
								if (line.includes(tag)) {
									console.log(`Found resource tag and adding line to tag: ${tag}`);
									const value = resourceItemsByTag.has(tag) ?  resourceItemsByTag.get(tag)! : [];
									resourceItemsByTag.set(tag,value.concat(`| ${moment().format("YYYY-MM-DD")} | ${line.replace("#read","").replace(tag,"").replace(regex, "").trim()} | [[${view.file?.basename}#^${blockCode}]] | xxx |`));
								}
							}
							);							
							processed = true;
						}
						if (processed) return line.concat(" ^").concat(blockCode) 
					}
					return line;
				});

				console.log(`Processed ${taskItems.length} tasks and ${resourceItems.length} resources`);
				resourceItemsByTag.forEach(async (values,tag) => {
					console.log(`Processing resource tag "${tag}" with ${values.length} items`);
				});

				editor.replaceSelection(processedLines.join("\n"));		
				updateSectionLists(this.settings.myDailyTaskHeader, taskItems, editor);
				updateSectionLists(this.settings.myDailyResouceHeader, resourceItems, editor);
				insertTableItem(resourceItemsByTag,this.app.vault, this.app.vault.getFileByPath(this.settings.myResouceFile)!);
		}});

		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex', 
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	// console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setDesc('Task tag')
			.addText(text => text
				.setPlaceholder('Task Tag')
				.setValue(this.plugin.settings.myTaskTag)
				.onChange(async (value) => {
					this.plugin.settings.myTaskTag = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setDesc('Daily task block header')
			.addText(text => text
				.setPlaceholder('Daily task block header')
				.setValue(this.plugin.settings.myDailyTaskHeader)
				.onChange(async (value) => {
					this.plugin.settings.myDailyTaskHeader = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setDesc('Daily resource block header')
			.addText(text => text
				.setPlaceholder('Daily resource block header')
				.setValue(this.plugin.settings.myDailyResouceHeader)
				.onChange(async (value) => {
					this.plugin.settings.myDailyResouceHeader = value;
					await this.plugin.saveSettings();
				}));


		new Setting(containerEl)
			.setName('Tasks alliase tag')
			.setDesc('Task line tag')
			.addText(text => text
				.setPlaceholder('Enter alliase tasgs')
				.setValue(this.plugin.settings.myTaskAlliases.join(","))
				.onChange(async (value) => {
					this.plugin.settings.myTaskAlliases = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Resource tag')
			.setDesc('Resource line tags')
			.addText(text => text
				.setPlaceholder('Enter resource tags')
				.setValue(this.plugin.settings.myResourceTags.join(","))
				.onChange(async (value) => {
					this.plugin.settings.myResourceTags = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
				.setName('Resource file')
				.setDesc('Resource file path')
				.addText(text => text
					.setPlaceholder('Enter resource filepath')
					.setValue(this.plugin.settings.myResouceFile)
					.onChange(async (value) => {
						this.plugin.settings.myResouceFile = value;
						await this.plugin.saveSettings();
					}));
}
}
