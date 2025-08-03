import { TFile } from 'obsidian';
import moment from 'moment'
import {generateBacklink, fileToHeader} from '../utils/helpers'

export interface AcronymProcessorSettings {
    myAcronymHeader:string;
    myAcronymAliases:string[];
}

export class AcronymProcessor {
    private settings: AcronymProcessorSettings;

    constructor(
        settings: AcronymProcessorSettings,
    ) {
        this.settings = settings;
    }

    async process(
        line: string,
        index: number,
        newFile: TFile,
        currentFile: TFile,
        acronymFile : TFile)
    : Promise<string> {
         if (!this.settings.myAcronymAliases.some(t => line.includes(t))) {
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
        

        this.settings.myAcronymAliases.filter(t => newLine = newLine.replace(t,""));

        console.log(`Writing acronym to current file:`, line);        
        await fileToHeader(newLine,currentFile,this.settings.myAcronymHeader);
        console.log(`Writing acronym to acronym file:`, line);    
        await fileToHeader(newLine,acronymFile,this.settings.myAcronymHeader);
   
        line = line.concat(" ^").concat(resourceBacklink.anchor);
        return line;
    }

}
