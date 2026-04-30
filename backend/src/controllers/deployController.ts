import { Request, Response } from 'express';
import { pushConfiguration } from '../services/sshService';
import { DeploymentLog } from '../models/DeploymentLog';
import { generateWithAI } from '../services/openRouter';

export const deployConfigurations = async (req: Request, res: Response) => {
  const { devices, credentials } = req.body;
  
  if (!devices || !Array.isArray(devices) || devices.length === 0) {
    return res.status(400).json({ error: 'No devices provided for deployment.' });
  }

  // Launch all SSH deployments concurrently using Promise.all
  const deploymentPromises = devices.map(async (device: any) => {
    const credForDevice = credentials[device.id] || credentials['default'];
    let status: 'success' | 'failed' = 'failed';
    let output = '';
    let currentConfig = device.config;
    let attempts = 0;
    const MAX_REMEDIATION_ATTEMPTS = 2;

    while (attempts < MAX_REMEDIATION_ATTEMPTS) {
      try {
        // Execute the SSH Push
        output = await pushConfiguration(
          device.ip,
          22,
          credForDevice.username,
          credForDevice.password,
          credForDevice.privateKey,
          currentConfig
        );
        
        // Determine if there were invalid input errors in the device terminal
        if (output.toLowerCase().includes('% invalid input') || output.toLowerCase().includes('error')) {
          console.log(`[Remediation] Error detected for ${device.ip}. Attempting AI fix (Attempt ${attempts + 1}/${MAX_REMEDIATION_ATTEMPTS})...`);
          
          const systemPrompt = `You are an expert network engineer. The previous configuration push failed with terminal errors.
Fix the requested configuration based on the provided error output. 
Output ONLY the corrected raw configuration text. No markdown wrap, no JSON, just the commands.`;

          currentConfig = await generateWithAI([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Original Config:\n${currentConfig}\n\nTerminal Error Output:\n${output}` }
          ]);
          
          attempts++;
        } else {
          status = 'success';
          break; // Success, exit retry loop
        }
      } catch (err: any) {
        output = err.message || 'SSH Connection Failed';
        status = 'failed';
        break; // Hard SSH error, don't just retry bad config
      }
    }

    if (attempts >= MAX_REMEDIATION_ATTEMPTS && status !== 'success') {
       status = 'failed';
       output += '\n\n[System] AI Remediation failed after maximum attempts.';
    }

    // Capture the raw terminal output in MongoDB
    const log = new DeploymentLog({
      deviceId: device.id,
      deviceHostname: device.label || device.ip,
      status,
      terminalOutput: output
    });
    
    await log.save();

    return {
      deviceId: device.id,
      host: device.ip,
      status,
      logId: log._id,
      output
    };
  });

  try {
    const results = await Promise.all(deploymentPromises);
    
    const allSuccessful = results.every(r => r.status === 'success');
    
    res.json({
      success: allSuccessful,
      message: allSuccessful ? 'All devices deployed successfully' : 'Deployment completed with some failures',
      results
    });
  } catch (error) {
    console.error('Deployment orchestration error:', error);
    res.status(500).json({ error: 'Orchestration failed' });
  }
};