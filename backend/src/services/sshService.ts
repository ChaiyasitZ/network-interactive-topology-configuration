import { Client } from 'ssh2';

export const pushConfiguration = (
  host: string,
  port: number = 22,
  username: string,
  password?: string,
  privateKey?: string,
  configString: string = ''
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn.on('ready', () => {
      console.log(`[SSH] Authenticated to ${host}`);
      
      // Start an interactive shell for configuration
      conn.shell((err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on('close', () => {
          console.log(`[SSH] Stream closed for ${host}`);
          conn.end();
          resolve(output);
        }).on('data', (data: any) => {
          output += data.toString();
        });

        // Send configuration commands
        // 1. Enter config mode
        stream.write('configure terminal\n');
        
        // 2. Write all generated config lines
        const lines = configString.split('\n');
        for (const line of lines) {
          if (line.trim() && !line.startsWith('!')) {
            stream.write(`${line.trim()}\n`);
          }
        }

        // 3. Exit and save
        stream.write('end\n');
        stream.write('write memory\n');
        
        // 4. Close session
        stream.write('exit\n');
      });
    }).on('error', (err) => {
      console.error(`[SSH Error - ${host}]:`, err.message);
      reject(err);
    }).connect({
      host,
      port,
      username,
      password,
      privateKey,
      readyTimeout: 10000,
    });
  });
};

export const fetchConfiguration = (
  host: string,
  port: number = 22,
  username: string,
  password?: string,
  privateKey?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn.on('ready', () => {
      conn.exec('show running-config', (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        stream.on('close', () => {
          conn.end();
          resolve(output);
        }).on('data', (data: any) => {
          output += data.toString();
        }).stderr.on('data', (data: any) => {
          output += data.toString();
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host,
      port,
      username,
      password,
      privateKey,
      readyTimeout: 10000,
    });
  });
};