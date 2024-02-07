import { _debugLog } from "../lib/LayeredLoader";

interface MultiCommand {
    commands: Array<any[]>;
    set(key: string, value: string): MultiCommand;
    expire(key: string, seconds: number): MultiCommand;
    exec(callback?: (err: Error | null, results: any[]) => void): void;
  }
  
  class MockRedisClient {
    data: { [key: string]: string };
    multiCommands: MultiCommand[];
    ready: boolean;
  
    constructor() {
      this.data = {};
      this.multiCommands = [];
      this.ready = true;
    }
  
    get isReady(): boolean {
      return this.ready;
    }
  
    MGET(keys: string[]): (string | null)[] {
      const values = keys.map(key => this.data[key] || null);
      return values;
    }
  
    SET(key: string, value: string): void {
      this.data[key] = value;
    }
  
    del(key: string): void {
      delete this.data[key];
      _debugLog('after del mock state ', this.data)
    }
  
    multi(): MultiCommand {
        const that = this;
      const multiObject: MultiCommand = {
        commands: [],
        set(key: string, value: string): MultiCommand {
          this.commands.push(['SET', key, value]);
          return this;
        },
        expire(key: string, seconds: number): MultiCommand {
          // This is a mock, so expire won't actually do anything
          this.commands.push(['EXPIRE', key, seconds]);
          return this;
        },
        exec() : any[] {
          const results = this.commands.map(command => {
            const [cmd, ...args] = command;
            return that.executeCommand(cmd, args);
          });
          _debugLog('after mutli, mock state: ', that.data);
          return results;
        },
      };
  
      this.multiCommands.push(multiObject);
      return multiObject;
    }
  
    private executeCommand(cmd: string, args: any[]): any {
      switch (cmd) {
        case 'SET':
          return this.SET(args[0], args[1]);
        case 'EXPIRE':
          // This is a mock, so expire won't actually do anything
          return true;
        default:
          throw new Error(`Unsupported command: ${cmd}`);
      }
    }
  }
  
  export function createClient(): MockRedisClient {
    return new MockRedisClient();
  }