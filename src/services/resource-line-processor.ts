import { TFile } from 'obsidian';
import moment from 'moment'
import {generateBacklink, fileToHeader} from '../utils/helpers'

export interface ResourceProcessorSettings {
    myResourceAliases: string[];
    myResourceHeader:string;
}

export class ResourceProcessor {
    private settings: ResourceProcessorSettings;

    constructor(
        settings: ResourceProcessorSettings,
    ) {
        this.settings = settings;
    }

    async process(
        line: string,
        index: number,
        newFile: TFile,//ForBacklinkg
        currentFile: TFile,
        resourceFile : TFile) //Save in currentFile
    : Promise<string> {
        if (!this.settings.myResourceAliases.some(t => line.includes(t))) {
            return line;
        }
        if (line.includes("^")) {
            return line;
        }
        const resourceBacklink = generateBacklink(newFile);
        
        let newLine = line;
        newLine = newLine.trim().startsWith("- ") ? newLine : "- ".concat(newLine);
        newLine = `- ${moment().format("YYYY-MM-DD")} ${newLine}`
        newLine = newLine.concat(resourceBacklink.link);

        this.settings.myResourceAliases.filter(t => newLine = newLine.replace(t,""));

        await fileToHeader(newLine,currentFile,this.settings.myResourceHeader);

        //ToDo: Check if resource exists before creating duplicate
        await this.settings.myResourceAliases.filter(t => line.includes(t)).forEach(async t => await fileToHeader(newLine,resourceFile,t.replace("#","# ")));
         
        line = line.concat(" ^").concat(resourceBacklink.anchor);
        return line;
    }

}
