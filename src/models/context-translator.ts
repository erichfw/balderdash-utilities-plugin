import { App, TFile, Vault } from 'obsidian';

/**
 * Translates context items (tags and links) to TFile objects
 * with caching to avoid repeated searches
 */

export enum ContextType {
    OUTCOME = '#stakeholder',
    ROLE = '#role',
    COMMUNITY = '#community', 
    STAKEHOLDER = '#outcome',
}

const order = {
        [ContextType.OUTCOME]: 1,
        [ContextType.COMMUNITY]: 2,
        [ContextType.STAKEHOLDER]: 3,
        [ContextType.ROLE]: 4
}


export class ContextTranslator {
    private app: App;
    private vault:Vault;

    /**
     * Creates a new ContextTranslator
     * @param vault The Obsidian vault
     */
    constructor(app: App) {
        this.app = app;
        this.vault = app.vault;
    }

    
    public static extractLinkedPath(contextItem:string):string
    {
            const fileName = contextItem.substring(2, contextItem.length - 2);
            const hashIndex = fileName.indexOf('#');
            if (hashIndex !== -1) {
                return fileName.substring(0, hashIndex);
            }
            return fileName;
    }

    /**
     * Translates a context item to a TFile
     * @param contextItem The context item (tag or link)
     * @returns The matching TFile or undefined
     */
    public translate(contextItem: string, source:TFile): {file:TFile, type:ContextType} | undefined {

        // Process link
        if (contextItem.startsWith('[[') && contextItem.endsWith(']]')) {
            const linkedPath = ContextTranslator.extractLinkedPath(contextItem);
            try {
                const file = this.app.metadataCache.getFirstLinkpathDest(linkedPath, source.path);
                 if (file instanceof TFile) {
                    const type = this.app.metadataCache.getFileCache(file)?.frontmatter?.type 
                    return {file, type}
                }
                else {
                    return undefined
                }
            }
            catch {
                console.log(`Cannot convert context ${contextItem} to file`)
                return undefined;
            }
        }

        const notContext =  ["#0m","#5m","#15m","#30m","60m","120m","#meeting","#action","#action-here","#deadline","follow-up","read","#frog","#🐸"]

        // Process tag
        if (contextItem.startsWith('#') && !notContext.some(t => t === contextItem)) {
            const tagName = contextItem.substring(1);
            const files = this.vault.getMarkdownFiles();
            try {
                const file = files.find(f => this.app.metadataCache.getFileCache(f)?.frontmatter?.key === tagName);
                if (file) {
                    const type = this.app.metadataCache.getFileCache(file)?.frontmatter?.type 
                    return {file, type}
                }
                else {
                    return undefined
                }
            } catch {
                console.log(`Cannot convert context ${contextItem} to file.`)
                return undefined;
            }
        }
    }

    /**
     * Translates an array of context items to the first matching TFile
     * @param contextItems Array of context items (tags and links)
     * @returns The first matching TFile or undefined
     */
    public translateAll(contextItems: string[], sourcePath:TFile): TFile[] {
        const files = contextItems
            .map(i => this.translate(i, sourcePath))
            .filter((a): a is { file: TFile; type: ContextType } => a !== undefined)
            .sort((a, b) => order[a.type] - order[b.type])
            .map(a => a.file);
        console.log(`Translating context items: ${contextItems.join(', ')} to files: ${files.map(f => f.path).join(', ')}`);
        return files;
    }
}