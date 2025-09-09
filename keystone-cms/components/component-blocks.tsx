import React from 'react';
import { 
  NotEditable, 
  component, 
  fields 
} from '@keystone-6/fields-document/component-blocks';

export const componentBlocks = {
  hero: component({
    label: 'Hero Section',
    preview: (props) => (
      <div style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px'
      }}>
        <h1>{props.fields.heading.element}</h1>
        <p>{props.fields.subheading.element}</p>
      </div>
    ),
    schema: {
      heading: fields.child({ 
        kind: 'inline',
        placeholder: 'Hero heading...'
      }),
      subheading: fields.child({ 
        kind: 'inline',
        placeholder: 'Hero subheading...'
      }),
      alignment: fields.select({
        label: 'Text Alignment',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      }),
    },
  }),

  callToAction: component({
    label: 'Call to Action',
    preview: (props) => (
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>{props.fields.title.element}</h3>
        <button style={{
          backgroundColor: props.fields.buttonColor.value,
          color: 'white',
          padding: '0.5rem 1.5rem',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          {props.fields.buttonText.value}
        </button>
      </div>
    ),
    schema: {
      title: fields.child({ 
        kind: 'inline',
        placeholder: 'CTA title...'
      }),
      buttonText: fields.text({
        label: 'Button Text',
        defaultValue: 'Learn More',
      }),
      buttonLink: fields.url({
        label: 'Button Link',
        defaultValue: '/',
      }),
      buttonColor: fields.text({
        label: 'Button Color',
        defaultValue: '#FF6B35',
      }),
    },
  }),

  menuShowcase: component({
    label: 'Menu Showcase',
    preview: (props) => (
      <div style={{ 
        padding: '1rem',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}>
        <h3>🍽️ Menu Showcase</h3>
        <p>Category: {props.fields.category.value}</p>
        <p>Items to show: {props.fields.itemCount.value}</p>
      </div>
    ),
    schema: {
      category: fields.select({
        label: 'Menu Category',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Appetizers', value: 'APPETIZERS' },
          { label: 'Entrees', value: 'ENTREES' },
          { label: 'Desserts', value: 'DESSERTS' },
          { label: 'Beverages', value: 'BEVERAGES' },
          { label: 'Specials', value: 'SPECIALS' },
        ],
        defaultValue: 'ALL',
      }),
      itemCount: fields.integer({
        label: 'Number of items',
        defaultValue: 6,
      }),
      showPrices: fields.checkbox({
        label: 'Show prices',
        defaultValue: true,
      }),
    },
  }),

  testimonial: component({
    label: 'Testimonial',
    preview: (props) => (
      <div style={{ 
        padding: '1.5rem',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontStyle: 'italic'
      }}>
        <p>"{props.fields.quote.element}"</p>
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          — {props.fields.author.value}
        </p>
      </div>
    ),
    schema: {
      quote: fields.child({ 
        kind: 'inline',
        placeholder: 'Customer testimonial...'
      }),
      author: fields.text({
        label: 'Author Name',
        defaultValue: '',
      }),
      rating: fields.integer({
        label: 'Rating (1-5)',
        defaultValue: 5,
        validation: { min: 1, max: 5 },
      }),
    },
  }),

  locationMap: component({
    label: 'Location Map',
    preview: () => (
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p>📍 Interactive Map</p>
        <p>Restaurant location will be displayed here</p>
      </div>
    ),
    schema: {
      address: fields.text({
        label: 'Address',
        defaultValue: '',
      }),
      latitude: fields.text({
        label: 'Latitude',
        defaultValue: '',
      }),
      longitude: fields.text({
        label: 'Longitude',
        defaultValue: '',
      }),
    },
  }),

  openingHours: component({
    label: 'Opening Hours',
    preview: (props) => (
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <h4>🕐 Opening Hours</h4>
        <NotEditable>
          <p>{props.fields.schedule.element}</p>
        </NotEditable>
      </div>
    ),
    schema: {
      schedule: fields.child({ 
        kind: 'block',
        placeholder: 'Enter opening hours...'
      }),
      specialNote: fields.text({
        label: 'Special Note',
        defaultValue: '',
      }),
    },
  }),
};

export default componentBlocks;
