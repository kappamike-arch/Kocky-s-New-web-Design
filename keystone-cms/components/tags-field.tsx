import React, { useState } from 'react';
import { FieldProps } from '@keystone-6/core/types';
import { Button } from '@keystone-ui/button';
import { Stack } from '@keystone-ui/core';
import { TextInput } from '@keystone-ui/fields';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';

export const TagsField = ({ field, value, onChange }: FieldProps<typeof field>) => {
  const [newTag, setNewTag] = useState('');
  const tags = value || [];

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Stack gap="medium">
      <div style={{ display: 'flex', gap: '8px' }}>
        <TextInput
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button onClick={addTag} tone="active">
          <PlusIcon size="small" />
          Add
        </Button>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {tags.map((tag, index) => (
          <div
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              backgroundColor: '#f0f0f0',
              borderRadius: '20px',
              fontSize: '14px',
            }}
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(tag)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2Icon size="small" />
            </button>
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default TagsField;
