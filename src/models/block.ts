/* eslint-disable @typescript-eslint/no-inferrable-types */
import { generateUniqueCode } from '../utils/helpers';

/**
 * Represents a block of text in a markdown file
 */
export class Block {
    private text: string;
    private headerLevel: string = '#';
    private headerValue: string = '';
    private context: string[] = [];
    private blockId: string;

    /**
     * Creates a new Block instance
     * @param text The block text content
     */
    constructor(text: string) {
        this.text = text;
        this.blockId = generateUniqueCode(10);
        this.extractHeader();
        this.extractContext();
    }

    /**
     * Extracts the header from the block text
     * @returns Object containing header level and value
     */
    public extractHeader(): { level: string, value: string } {
        const headerRegex = /^(#{1,6})\s+(.*)$/m;
        const match = this.text.match(headerRegex);
        
        if (match) {
            this.headerLevel = match[1].trim();
            this.headerValue = match[2].trim();
        } else {
            this.headerLevel = '#';
            this.headerValue = this.blockId;
        }
        
        return {
            level: this.headerLevel,
            value: this.headerValue
        };
    }

    /**
     * Gets the level of the block header as number
     * @returns 
     */
    public getHeaderLevelNumber(): number {
        return this.headerLevel.length;
    }

    /**
     * Gets the level of the block header
     * @returns The header level (e.g., '#', '##', etc.)
     */
    public getHeaderLevel(): string {
        return this.headerLevel;
    }


    /**
     * Gets the value of the block header
     * @returns The header text value
     */
    public getHeaderValue(): string {
        return this.headerValue;
    }

    /**
     * Extracts the context from the block
     * @returns Array of context items (tags and links)
     */
    public extractContext(): string[] {
        const lines = this.text.split('\n');
        this.context = [];
        let capture = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check for header
            if (/^#{1,6}\s+/.test(line)) {
                capture = true;
                continue;
            }

            // Capture context after header
            if (capture) {
                if (/^\[\[.+?\]\]$/.test(line) || /^#\w+/.test(line)) {
                    // Extract links and tags
                    const links = line.match(/\[\[.+?\]\]/g) || [];
                    const tags = line.match(/#\w+/g) || [];
                    this.context.push(...links, ...tags);
                } else if (line.length > 0) {
                    // Stop capturing on first non-tag/non-link line
                    break;
                }
            }
        }
        
        return this.context;
    }

    /**
     * Gets the context of the block
     * @returns Array of context items (tags and links)
     */
    public getContext(): string[] {
        return this.context;
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

}