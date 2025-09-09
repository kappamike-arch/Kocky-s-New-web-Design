import React, { useState } from 'react';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<any>({});

export function Tabs({ defaultValue, value, onValueChange, className = '', children }: TabsProps) {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue);
  
  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue);
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ selectedTab: value || selectedTab, setSelectedTab: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  const isSelected = context.selectedTab === value;
  
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => context.setSelectedTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  
  if (context.selectedTab !== value) {
    return null;
  }
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
}

