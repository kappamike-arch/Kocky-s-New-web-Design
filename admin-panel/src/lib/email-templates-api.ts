import { apiJson, ensureArray, ListResp, extractArray } from './api';

// Template interfaces
interface Template {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html: string;
  text?: string;
  variables: any;
  isActive: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  templates?: T[];
  template?: T;
  message?: string;
}

export async function listTemplates() {
  try {
    const resp = await apiJson<ListResp<Template>>('/email-templates');
    const templates = extractArray<Template>(resp);
    return {
      success: true,
      templates
    };
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Let UNAUTHORIZED errors bubble up to the calling component
    if ((error as Error).message === "UNAUTHORIZED") {
      throw error;
    }
    return {
      success: false,
      templates: []
    };
  }
}

export async function getTemplate(id: string) {
  try {
    const data = await apiJson<ApiResponse<Template>>(`/email-templates/${id}`);
    return {
      success: data.success || false,
      template: data.template || null
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    if ((error as Error).message === "UNAUTHORIZED") {
      throw error;
    }
    return {
      success: false,
      template: null
    };
  }
}

export async function createTemplate(payload: any) {
  try {
    const data = await apiJson<ApiResponse<Template>>('/email-templates', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    return { success: false, message: 'Failed to create template' };
  }
}

export async function updateTemplate(id: string, payload: any) {
  try {
    const data = await apiJson<ApiResponse<Template>>(`/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return data;
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, message: 'Failed to update template' };
  }
}

export async function previewTemplate(payload: any) {
  try {
    const data = await apiJson<{ success: boolean; html?: string; text?: string }>('/email-templates/preview', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data;
  } catch (error) {
    console.error('Error previewing template:', error);
    return { success: false, message: 'Failed to preview template' };
  }
}

export async function sendTest(payload: any) {
  try {
    const data = await apiJson<{ success: boolean; message?: string }>('/email-templates/send-test', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data;
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, message: 'Failed to send test email' };
  }
}

export async function deleteTemplate(id: string) {
  try {
    const data = await apiJson<{ success: boolean; message?: string }>(`/email-templates/${id}`, {
      method: 'DELETE'
    });
    return data;
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, message: 'Failed to delete template' };
  }
}