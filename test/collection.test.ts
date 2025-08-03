export {}

// import { Collection } from '../src/models/collection';
// import { Task } from '../src/models/task';

// describe('Collection', () => {
//     test('should add tasks to collection', () => {
//         const collection = new Collection();
//         const task1 = new Task('- [ ] Task 1');
//         const task2 = new Task('- [ ] Task 2');
        
//         collection.add(task1);
//         collection.add(task2);
        
//         expect(collection.size()).toBe(2);
//     });

//     test('should get tasks from collection', () => {
//         const collection = new Collection();
//         const task = new Task('- [ ] Test task');
        
//         collection.add(task);
//         const tasks = collection.getTasks();
        
//         expect(tasks).toHaveLength(1);
//         expect(tasks[0].getName()).toBe('Test task');
//     });

//     test('should filter completed tasks', () => {
//         const collection = new Collection();
//         const completedTask = new Task('- [x] Completed task');
//         const incompleteTask = new Task('- [ ] Incomplete task');
        
//         collection.add(completedTask);
//         collection.add(incompleteTask);
        
//         const completed = collection.getCompletedTasks();
//         const incomplete = collection.getIncompleteTasks();
        
//         expect(completed).toHaveLength(1);
//         expect(incomplete).toHaveLength(1);
//         expect(completed[0].getName()).toBe('Completed task');
//         expect(incomplete[0].getName()).toBe('Incomplete task');
//     });

//     test('should sort tasks by priority', () => {
//         const collection = new Collection();
//         const highTask = new Task('- [ ] High priority ⏫');
//         const lowTask = new Task('- [ ] Low priority 🔽');
//         const normalTask = new Task('- [ ] Normal priority');
        
//         collection.add(lowTask);
//         collection.add(highTask);
//         collection.add(normalTask);
        
//         const sorted = collection.sortByPriority();
        
//         expect(sorted[0].getPriority()).toBe('⏫');
//         expect(sorted[2].getPriority()).toBe('🔽');
//     });

//     test('should get due tasks', () => {
//         const collection = new Collection();
//         const today = new Date().toISOString().split('T')[0];
//         const dueTask = new Task(`- [ ] Due task 📅 ${today}`);
//         const futureTask = new Task('- [ ] Future task 📅 2025-12-31');
        
//         collection.add(dueTask);
//         collection.add(futureTask);
        
//         const dueTasks = collection.getDueTasks();
        
//         expect(dueTasks).toHaveLength(1);
//         expect(dueTasks[0].getName()).toBe('Due task');
//     });
// });