// Utility functions for device ID management
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('flash_vocab_device_id');
  
  if (!deviceId) {
    // Generate a unique device ID using timestamp + random string
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('flash_vocab_device_id', deviceId);
  }
  
  return deviceId;
};

export const clearDeviceId = () => {
  localStorage.removeItem('flash_vocab_device_id');
};