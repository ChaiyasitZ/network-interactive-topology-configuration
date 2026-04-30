import { Request, Response } from 'express';
import { Client } from 'ssh2';
import { generateWithAI } from '../services/openRouter';

export const discoverTopology = async (req: Request, res: Response) => {
  const { host, port, username, password } = req.body;

  if (!host || !username || !password) {
    return res.status(400).json({ error: 'Missing SSH credentials (host, username, password)' });
  }

  const conn = new Client();

  conn.on('ready', () => {
    console.log(`[Discovery] Connected to seed device: ${host}`);
    // Issue standard neighbor discovery commands (IOS/EOS)
    conn.exec('show lldp neighbors\nshow cdp neighbors', (err, stream) => {
      if (err) {
        conn.end();
        return res.status(500).json({ error: 'Failed to execute neighbor discovery commands' });
      }

      let output = '';

      stream.on('close', async () => {
        conn.end();
        console.log(`[Discovery] Command finished, passing output to AI mapping engine.`);

        // Use AI to neatly parse raw messy terminal CLI strings into structured React Flow Coordinates
        const systemPrompt = `You are an expert network parser. The user provides raw CLI output from 'show lldp neighbors' or 'show cdp neighbors'. 
Convert this raw text into a valid JSON object matching the React Flow schema with two arrays: 'nodes' and 'edges'.
1. Create a node for the Seed device (id: "${host}").
2. Create nodes for every newly discovered neighbor.
3. Create edges connecting them.
Return ONLY valid JSON. No markdown ticks, no preamble.`;

        try {
          const content = await generateWithAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Raw SSH Output from ${host}:\n\n${output}` }
          ]);

          let parsedOutput = {};
          try {
            parsedOutput = JSON.parse(content || '{}');
          } catch (parseError) {
            console.warn("Failed to parse AI output as JSON", content);
          }

          return res.json(parsedOutput);
        } catch (aiError) {
          console.error("AI Mapping Error:", aiError);
          return res.status(500).json({ error: 'Failed to AI-map device output' });
        }
      }).on('data', (data: any) => {
        output += data.toString();
      }).stderr.on('data', (data: any) => {
        output += data.toString();
      });
    });
  }).on('error', (err) => {
    console.error(`[Discovery] SSH Error:`, err.message);
    return res.status(500).json({ error: 'SSH connection to seed device failed', details: err.message });
  }).connect({
    host,
    port: port || 22,
    username,
    password,
    readyTimeout: 10000,
    tryKeyboard: true
  });
};