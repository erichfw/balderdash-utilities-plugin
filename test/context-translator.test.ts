import { App, TFile, Vault } from 'obsidian';
import { ContextTranslator, ContextType } from '../src/services/context-translator';

class MockFile implements TFile {
    path: string;
    name: string;
    vault: Vault;
    basename: string;
    extension: string;
    parent: any;
    stat: any;

    constructor(path: string) {
        this.path = path;
        this.name = path.split('/').pop() || '';
        this.basename = this.name.replace(/\.[^/.]+$/, '');
        this.extension = 'md';
    }
}   

const createMockApp = (files: Record<string, { path: string, type?: ContextType, key?: string }>) => {
    const fileObjects: Record<string, MockFile> = {};
    const fileCache: Record<string, any> = {};
    
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
                const file = fileObjects[linkpath + '.md'];
                return file ? Object.assign(Object.create(MockFile.prototype), file) : null;
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
        'team.md': { path: 'team.md', type: ContextType.COMMUNITY, key:"#community" },
        'person.md': { path: 'person.md', type: ContextType.STAKEHOLDER, key:"#stakeholder"  },
        'developer.md': { path: 'developer.md', type: ContextType.ROLE, key:"#role"  }
    };
    
    const mockApp = createMockApp(testFiles);
    const translator = new ContextTranslator(mockApp);
    const mockSourceFile = new MockFile('source.md');

    test('should extract linked path correctly', () => {
        expect(ContextTranslator.extractLinkedPath('[[project1]]')).toBe('project1');
        expect(ContextTranslator.extractLinkedPath('[[project1#section]]')).toBe('project1');
    });

    test('should translate links with context type', () => {
        const result = translator.translate('[[project1]]', mockSourceFile);
        expect(result?.file.path).toBe('project1.md');
        expect(result?.type).toBe(ContextType.OUTCOME);
    });

    test('should translate tags with context type', () => {
        const tagFiles = {
            'agile.md': { path: 'agile.md', type: ContextType.COMMUNITY, key: '#agile' }
        };
        const tagApp = createMockApp(tagFiles);
        const tagTranslator = new ContextTranslator(tagApp);
        
        const result = tagTranslator.translate('#agile', mockSourceFile);
        expect(result?.file.path).toBe('agile.md');
        expect(result?.type).toBe(ContextType.COMMUNITY);
    });

    test('should return undefined for invalid context items', () => {
        const result = translator.translate('invalid', mockSourceFile);
        expect(result).toBeUndefined();
    });

    test('should handle empty context items array', () => {
        const results = translator.translateAll([], mockSourceFile);
        expect(results).toHaveLength(0);
    });

    test('should filter out non-context tags', () => {
        const result = translator.translate('#action', mockSourceFile);
        expect(result).toBeUndefined();
    });

    test('should sort results by context type priority', () => {
        const contextItems = ['[[developer]]', '[[person]]', '[[team]]', '[[project1]]'];
        const results = translator.translateAll(contextItems, mockSourceFile);
        
        expect(results[0].path).toBe('project1.md');  // OUTCOME
        expect(results[1].path).toBe('team.md');      // COMMUNITY
        expect(results[2].path).toBe('person.md');    // STAKEHOLDER
        expect(results[3].path).toBe('developer.md'); // ROLE
    });

        test('should sort results by context type priority', () => {
        const contextItems = ['#role', '[[person]]', '#community', '[[project1]]'];
        const results = translator.translateAll(contextItems, mockSourceFile);
        
        expect(results[0].path).toBe('project1.md');  // OUTCOME
        expect(results[1].path).toBe('team.md');      // COMMUNITY
        expect(results[2].path).toBe('person.md');    // STAKEHOLDER
        expect(results[3].path).toBe('developer.md'); // ROLE
    });
});