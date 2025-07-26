import { Task } from '../src/models/task';

describe('Task', () => {
    test('should parse task name correctly', () => {
        const task = new Task('- [ ] Complete project 📅 2024-01-15');
        expect(task.getName()).toBe('Complete project');
    });

    test('should detect completion status', () => {
        const completedTask = new Task('- [x] Completed task');
        const incompleteTask = new Task('- [ ] Incomplete task');
        const otherTasks = new Task('- [-] Other status');
        
        expect(completedTask.isComplete()).toBe(true);
        expect(incompleteTask.isComplete()).toBe(false);
        expect(otherTasks.isComplete()).toBe(false);
    });

    test('should parse due date', () => {
        const task = new Task('- [ ] Task with due date 📅 2024-01-15');
        const dueDate = task.getDueDate();
        
        expect(dueDate.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    test('should parse scheduled date', () => {
        const task = new Task('- [ ] Task with scheduled date ⏳ 2024-01-10');
        const scheduledDate = task.getScheduledDate();
        
        expect(scheduledDate.format('YYYY-MM-DD')).toBe('2024-01-10');
    });

    test('should parse created date', () => {
        const task = new Task('- [ ] Task with created date ➕ 2024-01-05');
        const createdDate = task.getCreatedDate();
        
        expect(createdDate.format('YYYY-MM-DD')).toBe('2024-01-05');
    });

    test('should parse started date', () => {
        const task = new Task('- [ ] Task with started date 🛫 2024-01-08');
        const startedDate = task.getStartedDate();
        
        expect(startedDate.format('YYYY-MM-DD')).toBe('2024-01-08');
    });

    test('should parse task duration', () => {
    const task = new Task('- [ ] Task with duration #30m');
    const duration = task.getDuration();
    
    expect(duration).toBe(30);
    }); 
    
    test('should parse task backlink', () => {
        const task1 = new Task('- [ ] Task with backlink [[note]]');
        const backlink1 = task1.getBacklink();
        const task2 = new Task('- [ ] Task with backlink [[note|🖇️]]');
        const backlink2 = task2.getBacklink();
        expect(backlink1).toBe('');
        expect(backlink2).toBe("[[note|🖇️]]");
    });

    test('should handle multiple backlinks - negative case', () => {
        const task = new Task('- [ ] Task with multiple backlinks [[note1]] [[note2]]');
        const backlinks = task.getBacklink();
        
        expect(backlinks).toEqual('');
    });
    
    test('should parse completion date', () => {
        const task = new Task('- [x] Completed task ✅ 2024-01-20');
        const completionDate = task.getCompletionDate();
        
        expect(completionDate.format('YYYY-MM-DD')).toBe('2024-01-20');
        expect(task.isComplete()).toBe(true);
    });

    test('should parse priority', () => {
        const highTask = new Task('- [ ] High priority task ⏫');
        const lowTask = new Task('- [ ] Low priority task 🔽');
        
        expect(highTask.getPriority()).toBe('⏫');
        expect(lowTask.getPriority()).toBe('🔽');
    });

    test('should handle multiple metadata', () => {
        const task = new Task('- [ ] Complex task 📅 2024-01-15 ⏳ 2024-01-10 ➕ 2024-01-05 ⏫');
        
        expect(task.getName()).toBe('Complex task');
        expect(task.getDueDate().format('YYYY-MM-DD')).toBe('2024-01-15');
        expect(task.getScheduledDate().format('YYYY-MM-DD')).toBe('2024-01-10');
        expect(task.getCreatedDate().format('YYYY-MM-DD')).toBe('2024-01-05');
        expect(task.getPriority()).toBe('⏫');
    });
});