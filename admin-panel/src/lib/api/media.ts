import { api } from '../api';

export const media = {
  checkFile: async (sectionId: string, type: 'image' | 'video') => {
    const response = await api.get(`/api/upload-media?sectionId=${sectionId}&type=${type}`);
    return response.data;
  },
  
  uploadFile: async (file: File, sectionId: string, type: 'image' | 'video') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionId', sectionId);
    formData.append('type', type);
    
    const response = await api.post('/api/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
