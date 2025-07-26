// import moment from "moment";

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

/**
 * Extracts links and tags from a line of text
 * @param text The text to extract context from
 * @returns Array of links and tags
 */
export function extractLineContext(text: string): string[] {
    const links = text.match(/\[\[.*?\]\]/g) || [];
    // Extract all hashtag-style tags from the text (e.g. #tag, #tag/subtag)
    const tags = text.match(/#[\w/]+/g) || [];        
    return [...links, ...tags];
}

// export function fileTodo(text:string,file:TFile,backlink : {link:string, anchor:string}) {
//     console.log(`Adding todo ${text} to ${file.name} `);
//     let newLine = text.replace(/^\s*-\s*/, "").trim();
//     newLine = newLine.concat(` ${backlink.link}`);
//     newLine = newLine.concat(` ➕${moment().format("YYYY-MM-DD")}`).trim()
//     newLine = newLine.contains("#today") ? newLine.replace("#today","").concat(` 📅${moment().format("YYYY-MM-DD")}`).trim() : newLine;
//     newLine = newLine.replace("#frog","🐸");
//     newLine = "- [ ] ".concat(newLine);
    
//     return text.concat(` ^${backlink.anchor}`);
// }

// export async function updateSectionLists(sectionHeader : string, items: string[], editor : Editor) {
//     if (items.length > 0) {
//         const fileContent = editor.getDoc().getValue()
//         console.log(`Processing ${items.length} items for header: ${sectionHeader}`);	
//         const newBlock = `${sectionHeader}\n\n${items.join("\n")} `
//         console.log(`New block: ${newBlock}`);
//         if (fileContent.contains(sectionHeader)) {
//             console.log(`Existing list found, inserting items under ${sectionHeader}`);
//             const exitingListHeaderStart = fileContent.toLowerCase().indexOf(sectionHeader.toLowerCase());
//             const listMarker = "-";
//             const exitingListStart = fileContent.toLowerCase().indexOf(listMarker,exitingListHeaderStart);
//             console.log(`Header start position: ${exitingListHeaderStart}, List start position: ${exitingListStart}`);
//             editor.setSelection(editor.offsetToPos(exitingListHeaderStart),editor.offsetToPos(exitingListStart-1));
//             editor.replaceSelection(newBlock)
//         } else {
//             console.log(`Existing list not found, creating new list under ${sectionHeader} at end of file`);
//             editor.setSelection(editor.offsetToPos(fileContent.length));
//             editor.replaceSelection(newBlock.concat("\n\n"));
//         }
        
//     }
// }

// export function insertTableItem(tags: Map<string, string[]>, vault: Vault, file:TFile) {
//     if (tags.size > 0) {
//         vault.cachedRead(file).then((fileContent) => {		
//             for (const [tag, tagItems] of tags.entries()) {
//                 console.log(`Processing tag ${tag} with ${tagItems.length} items`);
//                 if (fileContent.includes(tag)) {
//                     console.log(`Existing table found for tag: "${tag}"`);
//                     const exitingListHeaderStart = fileContent.toLowerCase().indexOf(`# ${tag.toLowerCase()}`);
//                     const tableMarker = "--- |\n";
//                     const exitingListStart = fileContent.toLowerCase().indexOf(tableMarker,exitingListHeaderStart);
//                     const newBlock = `${tagItems.join("\n")}`
//                     fileContent = fileContent.substring(0,exitingListStart+tableMarker.length).concat(newBlock).concat("\n").concat(fileContent.substring(exitingListStart+tableMarker.length,fileContent.length));
//                 } else {
//                     console.log(`Existing table not found for tag: "${tag}"`);
//                     const newBlock = `# ${tag}\n\n| Date |  Resource Link  | Source  | Tags |\n| --- | --- | --- | --- |\n${tagItems.join("\n").concat("\n")}`
//                     console.log(`New table to append: ${newBlock}`);
                    
//                 }
//             }	
//             vault.process(file, (data) => fileContent);
//         }).catch((err) => console.log(err));
//     }
// }


