import { App, TFile, Vault } from 'obsidian';
import { ContextTranslator, ContextType } from '../src/models/context-translator';

// Mock classes
class MockFile implements TFile {
    path: string;
    name: string;
    vault: Vault;
    basename: string;
    extension: string;
    parent: any;
    stat: any;

    constructor(path: string, type?: ContextType) {
        this.path = path;
        this.name = path.split('/').pop() || '';
        this.basename = this.name.replace(/\.[^/.]+$/, '');
        this.extension = 'md';
    }
}

// Mock App for testing
const createMockApp = (files: Record<string, { path: string, type?: ContextType, key?: string }>) => {
    const fileObjects: Record<string, MockFile> = {};
    const fileCache: Record<string, any> = {};
    
    // Create file objects and cache
    Object.entries(files).forEach(([path, data]) => {
        fileObjects[path] = new MockFile(data.path);
        fileCache[path] = {
            frontmatter: {
                type: data.type,
                key: data.key
            }
        };
    });
    
    return {
        vault: {
            getMarkdownFiles: () => Object.values(fileObjects)
        },
        metadataCache: {
            getFirstLinkpathDest: (linkpath: string, sourcePath: string) => {
                return fileObjects[linkpath + '.md'] || null;
            },
            getFileCache: (file: TFile) => {
                return fileCache[file.path];
            }
        }
    } as unknown as App;
};

describe('ContextTranslator', () => {
    const testFiles = {
        'project1.md': { path: 'project1.md', type: ContextType.OUTCOME },
        'team.md': { path: 'team.md', type: ContextType.COMMUNITY },
        'person.md': { path: 'person.md', type: ContextType.STAKEHOLDER },
        'developer.md': { path: 'developer.md', type: ContextType.ROLE }
    };
    
    const mockApp = createMockApp(testFiles);
    const translator = new ContextTranslator(mockApp);
    const mockSourceFile = new MockFile('source.md');

    test('should extract linked path correctly', () => {
        expect(ContextTranslator.extractLinkedPath('[[project1]]')).toBe('project1');
        expect(ContextTranslator.extractLinkedPath('[[project1#section]]')).toBe('project1');
    });

    test('should return undefined for invalid context items', () => {
        const result = translator.translate('invalid', mockSourceFile as TFile);
        expect(result).toBeUndefined();
    });

    test('should handle empty context items array', () => {
        const results = translator.translateAll([], mockSourceFile as TFile);
        expect(results).toHaveLength(0);
    });

    test('should filter out non-context tags', () => {
        const result = translator.translate('#action', mockSourceFile as TFile);
        expect(result).toBeUndefined();
    });

    test('should handle mixed valid and invalid context items', () => {
        const contextItems = ['[[project1]]', 'invalid', '#action'];
        const results = translator.translateAll(contextItems, mockSourceFile as TFile);
        expect(results).toHaveLength(0); // All items should be filtered out in current implementation
    });
});