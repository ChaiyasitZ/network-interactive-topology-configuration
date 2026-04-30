import { Request, Response } from 'express';
import { pushConfiguration } from '../services/sshService';
import { DeploymentLog } from '../models/DeploymentLog';

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

    try {
      // Execute the SSH Push
      output = await pushConfiguration(
        device.ip,
        22,
        credForDevice.username,
        credForDevice.password,
        credForDevice.privateKey,
        device.config
      );
      
      // Determine if there were invalid input errors in the device terminal
      if (output.toLowerCase().includes('% invalid input') || output.toLowerCase().includes('error')) {
        status = 'failed';
        // Note: Auto-Remediation hook would go here in step 6.4
      } else {
        status = 'success';
      }
    } catch (err: any) {
      output = err.message || 'SSH Connection Failed';
      status = 'failed';
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