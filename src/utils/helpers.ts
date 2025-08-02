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
		console.log(`Adding ${lines} to ${file.basename} under ${header}`);
		let oldFileContent = "";

		try {
			oldFileContent = await file.vault.read(file);
		} catch (error) {
			console.log("File not read:", error);
			return;
		}

		let newFileContent = "";
		let headerFlag = false;
		let outFlag = false;

		if (!oldFileContent) {
			newFileContent = header + "\n\n" + lines;
		}
		else {
			for (const oldLine of oldFileContent.split("\n")){			
				if (oldLine === header && outFlag !== true ) { headerFlag = true; newFileContent = newFileContent + oldLine + "\n"; continue }
				if (headerFlag && oldLine !== "" ) { newFileContent = newFileContent + lines + "\n" + oldLine + "\n"; headerFlag = false; outFlag = true }
				else newFileContent = newFileContent.concat(oldLine).concat("\n")
			}
			if (!outFlag) {
				newFileContent = oldFileContent + "\n\n" + header + "\n\n" + lines;
			}
		}

		//Todo: What happens if header is last line in file

		if (newFileContent.endsWith("\n") && !newFileContent.endsWith("\n\n")) newFileContent = newFileContent + "\n"
		if (!newFileContent.endsWith("\n\n")) newFileContent = newFileContent + "\n\n"

		try {
			await file.vault.modify(file, newFileContent);
			console.log("File updated successfully.");
		} catch (error) {
			console.log("Failed to update file:", error);
		}
	}
