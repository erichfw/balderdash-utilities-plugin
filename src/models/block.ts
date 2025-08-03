/* eslint-disable @typescript-eslint/no-inferrable-types */
import { generateUniqueCode } from '../utils/helpers';
import moment from 'moment';

/**
 * Represents a block of text in a markdown file
 */
export class Block {
    private text: string;
    private header : {level : string, value : string, raw : string}
    private blockContext: string[];
    private blockId: string;
    private otherBlockTags : string[];

    public static extractLineContext(text: string): string[] {
        const links = text.match(/\[\[.*?\]\]/g) || [];
        // Extract all hashtag-style tags from the text (e.g. #tag, #tag/subtag)
        const tags = text.match(/#(rel|role)\/[\w/]+/g) || [];        
        return [...links, ...tags];
    }

    /**
     * Creates a new Block instance
     * @param text The block text content
     */
    constructor(text: string) {
        this.text = text;
        this.blockId = generateUniqueCode(10);
        this.header = this.extractHeader(text);
        this.text = text.replace(this.header.raw, "").trim();
        const context =  this.extractContext();
        this.blockContext = context.context;
        this.otherBlockTags = context.otherTags;
    }

    /**
     * Extracts the header from the block text
     * @returns Object containing header level and value
     */
    private extractHeader(text:string): { level: string, value: string, raw : string } {
        const headerRegex = /^(#{1,6})(\s+)(.*)$/m;
        const match = text.match(headerRegex);
        
        if (match) {
            return {
                level: match[1].trim(),
                value: match[3].trim(),
                raw: `${match[1]}${match[2]}${match[3]}`
            };
        } else {
            return {
                level: "#",
                value: this.getBlockId(),
                raw: `# ${moment().format("YYYY-MM-DD")} - ${this.getBlockId()}`
            };
        }
    }

    /**
     * 
     * @returns 
     */
    public getHeader(): string {
        return this.header.raw;
    }

    /**
     * Gets the level of the block header as number
     * @returns 
     */
    public getHeaderLevelNumber(): number {
        return this.header.level.length;
    }

    /**
     * Gets the level of the block header
     * @returns The header level (e.g., '#', '##', etc.)
     */
    public getHeaderLevel(): string {
        return this.header.level;
    }


    /**
     * Gets the value of the block header
     * @returns The header text value
     */
    public getHeaderValue(): string {
        return this.header.value;
    }

    /**
     * Extracts the context from the block
     * @returns Array of context items (tags and links)
     */
    private extractContext(): {otherTags:string[],context:string[]} {
        const lines = this.text.split('\n');
        const context = [];
        const otherTags = []
        const newLines : string[] = []
        let capture = true;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (capture) {
                // Capture context after header
                if (/^\[\[.+?\]\]/.test(line) || /^#\w+/.test(line)) {
                    // Extract links and tags
                    const links = line.match(/\[\[.+?\]\]/g) || [];
                    const contextTags = line.match(/#(rel|role)[\w/]+/g) || [];
                    const other = line.match(/#(?!(rel|role)\/)[\w/]+/g) || [];               
                    context.push(...links, ...contextTags);
                    otherTags.push(...other);
                } else if (line.length > 0) {
                    // Stop capturing on first non-tag/non-link line
                    capture  = false;
                    newLines.push(line);
                }
            } else {
                newLines.push(line);
            }
        }

        this.setText(newLines.join("\n"));
        
        return {otherTags:otherTags, context:context};
    }

    /**
     * Gets the context of the block
     * @returns Array of context items (tags and links)
     */
    public getContext(): string[] {
        //Todo: Always return context in right order
        return this.blockContext;
    }

    /**
     * Gets the context of the block
     * @returns Array of context items (tags and links)
     */
    public getOtherTags(): string[] {
        return this.otherBlockTags;
    }


     /**
     * Gets the context of the block
     * @returns Array of context items (tags and links)
     */
    public containsOtherTags(tag:string): boolean {
        return this.getOtherTags().includes(tag);
    }


    /**
     * Gets the unique ID for this block
     * @returns The block ID
     */
    public getBlockId(): string {
        return this.blockId;
    }

    /**
     * Gets the full text content of the block
     * @returns The block text
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Gets the full text content of the block
     * @returns The block text
     */
    public setText(text:string) {
        this.text = text;
    }

    /**
     * Iterates through each line of the block text
     * @param callback Function to execute for each line
     */
    public forEachLine(callback: (line: string, index: number, ...args: any[]) => void, ...args: any[]): Block {
        const lines = this.text.split('\n');
        lines.forEach((line, index) => {
            callback(line, index, ...args);
        });
        return this;
    }


    /**
     * Iterates through each line of the block text
     * @param callback Function to execute for each line
     */
    public async mapEachLine(callback: (line: string, index: number, ...args: any[]) => Promise<string>, ...args: any[]): Promise<Block> {
        let lines = this.text.split('\n');
        lines = await Promise.all(lines.map(async (line, index) => {
            return await callback(line, index, ...args);
        }));
        this.text = lines.join("\n");
        return this;
    }

}