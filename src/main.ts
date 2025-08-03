import { App,  Plugin, PluginSettingTab, Setting } from 'obsidian';
import { CancelTasksCommand } from './commands/cancel-tasks';
import { CancelHabitTasksCommand } from './commands/cancel-habit-task';
import { FileTaskCommand } from './commands/file-tasks';
import { ProcessBlockTasksCommand } from './commands/balderdash-process-block';
import { ProcessSelectionTasksCommand } from './commands/balderdash-process-selection';

interface MyPluginSettings {
	myTaskAliases: string[];
	myTaskHeader: string;
	myResourceAliases: string[];
	myResouceFile: string;
	myResourceHeader: string;
	myBlockListHeader: string;
	myDestinationOverwrite: string;
	myBlockNoteFolder: string;
	myAcronymHeader:string;
	myAcronymAliases:string[];
	myAcronymFile:string;
	myMeetingBlockAliase:string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	myTaskHeader:"# Todo",
	myTaskAliases: ["#action","#follow-up","#think-about","#read"],
	myResourceAliases: ["#resource-lucid","#resource-docx","#resource-xlsx","#resource-pptx","#resource-http","#resource-pdf","#resource-confluence","#resource-teams"],
	myResouceFile: "Resources.md",
	myResourceHeader:"# Resources",
	myBlockNoteFolder: "meetings",
	myBlockListHeader: "# Notes",
	myDestinationOverwrite: "#here",
	myAcronymHeader: "# Acronyms",
	myAcronymAliases: ["#acronym"],
	myAcronymFile:"Acronyms.md",
	myMeetingBlockAliase:"#meeting"
}


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();	
		this.addCommand(new ProcessSelectionTasksCommand(this.settings));
		this.addCommand(new CancelTasksCommand(this.settings));
		this.addCommand(new CancelHabitTasksCommand(this.settings));
		this.addCommand(new ProcessBlockTasksCommand(this.settings));
		this.addCommand(new FileTaskCommand(this.settings));
		this.addSettingTab(new SampleSettingTab(this.app, this));
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
			.setName('Task Header')
			.setDesc('Header text for task section')
			.addText(text => text
				.setPlaceholder('Enter task header')
				.setValue(this.plugin.settings.myTaskHeader)
				.onChange(async (value) => {
					this.plugin.settings.myTaskHeader = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Task Aliases')
			.setDesc('Tags that mark tasks (comma separated)')
			.addText(text => text
				.setPlaceholder('Enter task aliases')
				.setValue(this.plugin.settings.myTaskAliases.join(","))
				.onChange(async (value) => {
					this.plugin.settings.myTaskAliases = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Resource Aliases')
			.setDesc('Tags that mark resources (comma separated)')
			.addText(text => text
				.setPlaceholder('Enter resource aliases')
				.setValue(this.plugin.settings.myResourceAliases.join(","))
				.onChange(async (value) => {
					this.plugin.settings.myResourceAliases = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Resource File')
			.setDesc('Path to resource file')
			.addText(text => text
				.setPlaceholder('Enter resource file path')
				.setValue(this.plugin.settings.myResouceFile)
				.onChange(async (value) => {
					this.plugin.settings.myResouceFile = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Resource Header')
			.setDesc('Header text for resource section')
			.addText(text => text
				.setPlaceholder('Enter resource header')
				.setValue(this.plugin.settings.myResourceHeader)
				.onChange(async (value) => {
					this.plugin.settings.myResourceHeader = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Block List Header')
			.setDesc('Header text for block list section')
			.addText(text => text
				.setPlaceholder('Enter block list header')
				.setValue(this.plugin.settings.myBlockListHeader)
				.onChange(async (value) => {
					this.plugin.settings.myBlockListHeader = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Task Destination Overwrite')
			.setDesc('Tag to overwrite task destination')
			.addText(text => text
				.setPlaceholder('Enter task destination overwrite tag')
				.setValue(this.plugin.settings.myDestinationOverwrite)
				.onChange(async (value) => {
					this.plugin.settings.myDestinationOverwrite = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Block Note Folder')
			.setDesc('Folder path for block notes')
			.addText(text => text
				.setPlaceholder('Enter block note folder path')
				.setValue(this.plugin.settings.myBlockNoteFolder)
				.onChange(async (value) => {
					this.plugin.settings.myBlockNoteFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
		.setName('Acronym File')
		.setDesc('File for filing acronyms')
		.addText(text => text
			.setPlaceholder('Enter file name')
			.setValue(this.plugin.settings.myAcronymFile)
			.onChange(async (value) => {
				this.plugin.settings.myAcronymFile = value;
				await this.plugin.saveSettings();
			}));
				
	}
}