import { Request, Response } from 'express';
import { generateWithAI } from '../services/openRouter';
import { AIGeneration } from '../models/AIGeneration';

export const generateTopology = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    // System prompt specifically constraining the LLM to output valid React Flow JSON
    const systemPrompt = `You are a network architecture expert. 
Convert the user's network design request into a valid JSON array containing 'nodes' and 'edges' following the React Flow schema. 
Return ONLY valid JSON. Do not include markdown blocks like \`\`\`json.`;
    
    const content = await generateWithAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ]);

    let parsedOutput = {};
    try {
      parsedOutput = JSON.parse(content || '{}');
    } catch (e) {
      console.warn("Failed to parse AI output as JSON", content);
    }

    // Log the generation event to MongoDB
    const generationLog = new AIGeneration({
       prompt: prompt,
       generationType: 'topology',
       aiOutput: parsedOutput,
       status: 'success',
       createdBy: req.body.userId || 'anonymous' // You can link this to auth later
    });
    await generationLog.save();

    res.json(parsedOutput);
  } catch (error) {
    console.error('Topology generation error:', error);
    res.status(500).json({ error: 'Failed to generate topology' });
  }
};

export const generateConfigs = async (req: Request, res: Response) => {
  try {
    const { topology, prompt } = req.body;
    
    const systemPrompt = `You are an expert network engineer. 
Generate standard network configurations (e.g., Cisco IOS, Arista EOS) based on the provided topology JSON and user request. 
Output ONLY JSON containing node IDs as keys and string configurations as values. No markdown formatting.`;
    
    const content = await generateWithAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Topology Context: ${JSON.stringify(topology)}\n\nConfig Request: ${prompt}` }
    ]);

    let parsedOutput = {};
    try {
      parsedOutput = JSON.parse(content || '{}');
    } catch (e) {
      console.warn("Failed to parse AI output as JSON", content);
    }

    // Log the event to MongoDB
    const generationLog = new AIGeneration({
       prompt: prompt,
       generationType: 'configuration',
       contextData: topology,
       aiOutput: parsedOutput,
       status: 'success',
       createdBy: req.body.userId || 'anonymous'
    });
    await generationLog.save();

    res.json(parsedOutput);
  } catch (error) {
    console.error('Config generation error:', error);
    res.status(500).json({ error: 'Failed to generate configurations' });
  }
};