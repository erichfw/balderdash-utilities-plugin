import { Block } from '../src/models/block';
import moment from 'moment';

 describe('extractLineContext', () => {
        test('should extract links from text', () => {
            const text = 'This has [[link1]] and [[link2]]';
            const context = Block.extractLineContext(text);
            expect(context).toContain('[[link1]]');
            expect(context).toContain('[[link2]]');
        });

        test('should extract tags from text', () => {
            const text = 'This has #rel/1 and #rel/2';
            const context = Block.extractLineContext(text);
            expect(context).toContain('#rel/1');
            expect(context).toContain('#rel/2');
        });

        test('should extract both links and tags', () => {
            const text = 'Mixed [[link]] and #rel/1 content';
            const context = Block.extractLineContext(text);
            expect(context).toContain('[[link]]');
            expect(context).toContain('#rel/1');
            expect(context).toHaveLength(2);
        });

        test('should return empty array for text without context', () => {
            const text = 'Plain text without links or tags';
            const context = Block.extractLineContext(text);
            expect(context).toHaveLength(0);
        });

        test('should handle complex links with sections', () => {
            const text = 'Link to [[file#section]] here';
            const context = Block.extractLineContext(text);
            expect(context).toContain('[[file#section]]');
        });

        test('should handle complex links rename', () => {
            const text = 'Link to [[file|rename]] here';
            const context = Block.extractLineContext(text);
            expect(context).toContain('[[file|rename]]');
        });

        test('should handle complex nested tags', () => {
            const text = 'Tag with numbers #rel/1/2 here';
            const context = Block.extractLineContext(text);
            expect(context).toContain('#rel/1/2');
        });
    });


describe('Block', () => {
    test('should extract header correctly', () => {
        const blockText = `# Test Header
    
[[link1]]
#tag1
#tag2

Some content here.`;
        const block = new Block(blockText);
        const header = block.getHeader();
    
        expect(header).toBe('# Test Header');
        expect(block.getHeaderLevel()).toBe('#');
        expect(block.getHeaderValue()).toBe('Test Header');
        expect(block.getHeaderLevelNumber()).toBe(1);
    });

test('should extract context correctly', () => {
        const blockText = `## Test Header
    
[[link1]]
#rel/1 
#tag #role/2 [[link2]]

Some content here.`;
        const block = new Block(blockText);
        const context = block.getContext();
        expect(context).toContain('[[link1]]');
        expect(context).toContain('[[link2]]');
        expect(context).toContain('#rel/1');
        expect(context).toContain('#role/2');
        expect(context).toHaveLength(4);
    });

    
test('should extract context correctly - tags in lines', () => {
        const blockText = `## Test Header
    
[[link1]]
#rel/1 

context stops with first line #tag2 #tag3 [[link2]]

Some content here.`;
        const block = new Block(blockText);
        const context = block.getContext();
        expect(context).toContain('[[link1]]');
        expect(context).toContain('#rel/1');
        expect(context).toHaveLength(2);
    });


    test('should handle block with no header', () => {
        const noHeaderBlock = new Block('Just some text without a header');
        
        expect(noHeaderBlock.getHeader()).toContain(noHeaderBlock.getBlockId());
        expect(noHeaderBlock.getHeader()).toContain(moment().format("YYYY-MM-DD"));
    });

    test('should use first header when multiple headers exist', () => {
        const multiHeaderBlock = new Block(`# First Header
    
Some content
    
## Second Header
    
More content`);
        
        expect(multiHeaderBlock.getHeader()).toBe('# First Header');
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
        
        expect(block.getText()).toBe("Some content");
    });

    test('should handle empty context', () => {
        const block = new Block('# Header\nJust plain text');
        const context = block.extractContext();
        
        expect(context).toHaveLength(0);
    });

    test('should map each line with callback function', async () => {
        const blockText = '# Header\nLine 1\nLine 2\nLine 3';
        const block = new Block(blockText);
        
        const result = await block.mapEachLine(async (line, index) => `${index}: ${line}`);
        
        // No code transformation needed - the selected code is empty and the instruction appears to be 
        // an error message rather than a transformation instruction
        
        expect(result.getText().split("\n")).toEqual([
            '0: Line 1', 
            '1: Line 2', 
            '2: Line 3'
        ]);
    });

    test('should execute callback for each line', () => {
        const blockText = '# Header\nLine 1\nLine 2';
        const block = new Block(blockText);
        const mockCallback = jest.fn();
        
        block.forEachLine(mockCallback);
        
        expect(mockCallback).toHaveBeenCalledTimes(2);
        expect(mockCallback).toHaveBeenNthCalledWith(1, 'Line 1', 0);
        expect(mockCallback).toHaveBeenNthCalledWith(2, 'Line 2', 1);
    });

    test('should handle empty block in line operations', async () => {
        const block = new Block('');
        
        const mapResult = await block.mapEachLine(async (line) => line.toUpperCase());
        expect(mapResult.getText()).toEqual('');
        
        const mockCallback = jest.fn();
        block.forEachLine(mockCallback);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('', 0);
    });
    
});