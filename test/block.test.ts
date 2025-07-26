import { Block } from '../src/models/block';

describe('Block', () => {
    test('should extract header correctly', () => {
        const blockText = `# Test Header
    
[[link1]]
#tag1
#tag2

Some content here.`;
        const block = new Block(blockText);
        const header = block.extractHeader();
        
        expect(header.level).toBe('#');
        expect(header.value).toBe('Test Header');
        expect(block.getHeaderLevel()).toBe('#');
        expect(block.getHeaderValue()).toBe('Test Header');
        expect(block.getHeaderLevelNumber()).toBe(1);
    });

test('should extract context correctly', () => {
        const blockText = `## Test Header
    
[[link1]]
#tag1 
#tag2 #tag3 [[link2]]

Some content here.`;
        const block = new Block(blockText);
        const context = block.extractContext();
        expect(context).toContain('[[link1]]');
        expect(context).toContain('[[link2]]');
        expect(context).toContain('#tag1');
        expect(context).toContain('#tag2');
        expect(context).toContain('#tag3');
        expect(context).toHaveLength(5);
    });

    
test('should extract context correctly - tags in lines', () => {
        const blockText = `## Test Header
    
[[link1]]
#tag1 

context stops with first line #tag2 #tag3 [[link2]]

Some content here.`;
        const block = new Block(blockText);
        const context = block.extractContext();
        expect(context).toContain('[[link1]]');
        expect(context).toContain('#tag1');
        expect(context).toHaveLength(2);
    });


    test('should handle block with no header', () => {
        const noHeaderBlock = new Block('Just some text without a header');
        const noHeader = noHeaderBlock.extractHeader();
        
        expect(noHeader.level).toBe('#');
        expect(noHeader.value).toBe(noHeaderBlock.getBlockId());
    });

    test('should use first header when multiple headers exist', () => {
        const multiHeaderBlock = new Block(`# First Header
    
Some content
    
## Second Header
    
More content`);
        const multiHeader = multiHeaderBlock.extractHeader();
        
        expect(multiHeader.level).toBe('#');
        expect(multiHeader.value).toBe('First Header');
    });

    test('should handle different header levels', () => {
        const h2Block = new Block('## Level 2 Header');
        const h3Block = new Block('### Level 3 Header');
        
        expect(h2Block.getHeaderLevelNumber()).toBe(2);
        expect(h3Block.getHeaderLevelNumber()).toBe(3);
    });

    test('should generate unique block IDs', () => {
        const block1 = new Block('Some text');
        const block2 = new Block('Other text');
        
        expect(block1.getBlockId()).not.toBe(block2.getBlockId());
        expect(block1.getBlockId()).toHaveLength(10);
    });

    test('should return full text content', () => {
        const text = '# Header\nSome content';
        const block = new Block(text);
        
        expect(block.getText()).toBe(text);
    });

    test('should handle empty context', () => {
        const block = new Block('# Header\nJust plain text');
        const context = block.extractContext();
        
        expect(context).toHaveLength(0);
    });
});