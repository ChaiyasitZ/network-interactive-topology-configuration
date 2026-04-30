import { Request, Response } from 'express';
import { pushConfiguration, fetchConfiguration } from '../services/sshService';
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
    let rollbackConfig = '';
    const MAX_REMEDIATION_ATTEMPTS = 2;

    try {
      // Create baseline snapshot for Rollback
      console.log(`[Snapshot] Fetching running-config for baseline snapshot on ${device.ip}...`);
      rollbackConfig = await fetchConfiguration(
        device.ip,
        22,
        credForDevice.username,
        credForDevice.password,
        credForDevice.privateKey
      );
    } catch (err) {
      console.error(`[Snapshot Error] Failed to fetch baseline snapshot on ${device.ip}. Proceeding without snapshot.`);
    }

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

    // Capture the raw terminal output and Rollback config in MongoDB
    const log = new DeploymentLog({
      deviceId: device.id,
      deviceHostname: device.label || device.ip,
      status,
      terminalOutput: output,
      rollbackConfig
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

export const rollbackConfiguration = async (req: Request, res: Response) => {
  const { logId, credentials } = req.body;

  if (!logId) {
    return res.status(400).json({ error: 'Missing logId for rollback.' });
  }

  try {
    const deploymentLog = await DeploymentLog.findById(logId);
    
    if (!deploymentLog) {
      return res.status(404).json({ error: 'Deployment log not found.' });
    }

    if (!deploymentLog.rollbackConfig) {
      return res.status(400).json({ error: 'No rollback configuration (baseline snapshot) found for this deployment.' });
    }

    const deviceIp = deploymentLog.deviceHostname; // assuming we saved IP here or fallback to parsing if needed
    const credForDevice = credentials[deploymentLog.deviceId] || credentials['default'];

    if (!credForDevice) {
      return res.status(400).json({ error: 'Missing credentials for rollback.' });
    }

    console.log(`[Rollback] Executing rollback for device ${deviceIp}...`);
    
    // We parse the exact raw baseline to write back to memory
    // (In production, replace with `config replace` or copy start run depending on Vendor OS capabilities)
    const rollbackOutput = await pushConfiguration(
      deviceIp,
      22,
      credForDevice.username,
      credForDevice.password,
      credForDevice.privateKey,
      deploymentLog.rollbackConfig
    );
    
    // Update log status
    deploymentLog.status = 'rolled_back';
    await deploymentLog.save();

    res.json({
      success: true,
      message: `Successfully rolled back ${deviceIp}`,
      output: rollbackOutput
    });

  } catch (error: any) {
    console.error('Rollback execution error:', error);
    res.status(500).json({ error: 'Rollback failed', details: error.message });
  }
};