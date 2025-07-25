/* eslint-disable @typescript-eslint/no-inferrable-types */
import moment from 'moment';
import { extractLineContext } from '../utils/helpers';

const METADATA_CHARS: string = '📅🛫⏳⏫🔼🔽🔺⏬🆔⛔🔁➕✅';
const TASK_PRIORITY: RegExp = /[⏫🔼🔽🔺⏬]/u; 
const TASK_COMPLETE: RegExp = /^-\s\[x\]/;
const SOURCE_BACKLINK: RegExp = /\[\[.*?\|?\s?🖇️\]\]/u; 
const TASK_NAME: RegExp = /^(-\s\[[x\s]\]\s)(.*?)(?:\s[📅🛫⏳⏫🔼🔽🔺⏬🆔⛔🔁➕✅]|$)/u;
const TASK_DURATION: RegExp = /#([0-9]{1,3})m/; 

enum TaskPriority {
  Highest = '🔺',
  High = '⏫',
  Normal = '',
  Low = '🔽',
  Medium = '🔼', 
  Lowest = '⏬'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const order = {
    [TaskPriority.Highest] : 6,
    [TaskPriority.High] : 5,
    [TaskPriority.Normal] : 4,
    [TaskPriority.Low] : 3,
    [TaskPriority.Medium] : 2,
    [TaskPriority.Lowest] : 1
}

export const DUE_DATE_FORMAT: string = 'YYYY-MM-DD';

export class Task {
  private complete?: boolean;
  private dueDate?: moment.Moment;
  private scheduledDate?: moment.Moment;
  private creationDate?: moment.Moment;
  private startedDate?:moment.Moment;
  private completionDate?: moment.Moment;
  private line: string;
  private priority : TaskPriority
  private metadata: string = '';
  private metadataMap = new Map<string, string>();
  private backlink: string = '';
  private name: string = '';
  private context : string[];
  private duration : number = 15;

  constructor(line: string) {
    this.line = line;
    this.parse();
  }

  equals(task: Task) {
    return this.name === task.getName();
  }

  getDueDate(): moment.Moment {
    if (this.dueDate === undefined) {
      const meta = this.getMetadata();
      this.dueDate = moment(meta.get('📅'));
    }
    return this.dueDate;
  }

  getScheduledDate(): moment.Moment  {
    if (this.scheduledDate === undefined) {
      const meta = this.getMetadata();
      this.scheduledDate = moment(meta.get('⏳'));
    }
    return this.scheduledDate;
  }

  getCreatedDate(): moment.Moment  {
    if (this.creationDate === undefined) {
      const meta = this.getMetadata();
      this.creationDate = moment(meta.get('➕'));
    }
    return this.creationDate;
  }

  getStartedDate(): moment.Moment  {
    if (this.startedDate === undefined) {
      const meta = this.getMetadata();
      this.startedDate = moment(meta.get('🛫'));
    }
    return this.startedDate;
  }

  getCompletionDate(): moment.Moment  {
    if (this.completionDate === undefined) {
      const meta = this.getMetadata();
      this.completionDate = moment(meta.get('✅'));
    }
    return this.completionDate;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }

  getDuration():number{
    return this.duration;
  }

  getBacklink(): string {
     return this.backlink;
  }  
  
  getMetadata(): Map<string, string> {
    return this.metadataMap;   
  }

  getName(): string {
    return this.name;
  }

  isComplete(): boolean {
    return !!this.complete;
  }

  isDue(): boolean {
    if (this.getDueDate() === undefined) return false;
    return !!(this.dueDate && moment(this.getDueDate()).isBefore(moment().add(1, 'day')));
    // Double negation operator (!!) converts a value to boolean  }
  }

  private parse() {

    let temp = this.line
    const matched1 = this.line.match(SOURCE_BACKLINK)
    if (matched1) {
      this.backlink = matched1[0];
      temp = this.line.replace(matched1[0], '');
    }
    const matched3 = this.line.match(TASK_DURATION)
    if (matched3) {
      this.duration = Number(matched3[1]);
      temp = this.line.replace(matched3[1], '');
    }

    const matched2 = temp.match(TASK_NAME);
    if (matched2) {
      this.name = matched2[2];
      this.metadata = this.line.replace(matched2[1] + matched2[2], '');
      this.context = extractLineContext(this.name);
    }

    this.complete = !!this.line.match(TASK_COMPLETE);
    
    const priorityMatch = this.line.match(TASK_PRIORITY);
    if (priorityMatch) {
      this.priority = priorityMatch[0].trim() as TaskPriority;
    } else {
      this.priority = TaskPriority.Normal;
    }

    for (const char of METADATA_CHARS) {
      if (this.metadata.includes(char)) {
          // Match metadata pattern: space + emoji + space + (captured value) + (space or end of string)
          const matched = this.metadata.match(new RegExp(String.raw`\s${char}\s(.*?)(?:\s|$)`));        
          if (matched) {
            this.metadataMap.set(char, matched[1]);
          }
      }
    }
  }

  toString(): string {
    const complete = this.complete ? 'x' : ' ';
    return `- [${complete}] ${this.name} ${this.context.join(" ")} #${this.duration}m ${this.backlink} ${this.metadata}`;
  }
}
