// import moment from "moment";

import { TFile } from "obsidian";

/**
 * Generates a random alphanumeric code of specified length
 * @param length The length of the code to generate (default: 10)
 * @returns A random alphanumeric string
 */
export function generateUniqueCode(length = 10): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwqyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function generateBacklink(target:TFile) : {link:string, anchor:string} {
    const guid = generateUniqueCode(6)
    return {link : `[[${target.path}#^${guid}|🖇️]]`, anchor: guid}
}

/**
 * Extracts links and tags from a line of text
 * @param text The text to extract context from
 * @returns Array of links and tags
 */


export async function fileToHeader(lines : string, file : TFile, header : string) {

		if (!file) {console.error("filetoheader - didnt receive a file to export header ",header," with lines ", lines); return}
		console.debug(`filetoheader - adding ${lines} to ${file.name} under header ${header}`);

		const newContent = header + "\n\n" + lines;
		const regex = new RegExp(`^${header}(?:\\n^\\s*$)*`, 'gm');

		try {
			await file.vault.process(file, 
					(oldFileContent) => {
						if (!oldFileContent) {
							//Empty file
							return newContent; 
						}
						if (oldFileContent.match(regex)) {
							return oldFileContent.replace(oldFileContent.match(regex)![0], newContent)
						}
						return oldFileContent + "\n\n" + newContent;
					}	
				)
			console.debug(`File ${file.name} updated successfully.`);
		} catch (error) {
			console.debug("Failed to update file:", error);
		}
	}
