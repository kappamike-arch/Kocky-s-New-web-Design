import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = ""
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="text-gray-400 text-6xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
    
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {primaryAction && (
        <Link
          href={primaryAction.href}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {primaryAction.label}
        </Link>
      )}
      {secondaryAction && (
        <Link
          href={secondaryAction.href}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {secondaryAction.label}
        </Link>
      )}
    </div>
  </div>
);

// Predefined empty states for common scenarios
export const EmptyTemplates = () => (
  <EmptyState
    icon="📧"
    title="No email templates yet"
    description="Create your first email template to start building professional email campaigns."
    primaryAction={{
      label: "Create Template",
      href: "/email-templates/new"
    }}
    secondaryAction={{
      label: "Learn More",
      href: "/email"
    }}
  />
);

export const EmptyCampaigns = () => (
  <EmptyState
    icon="📊"
    title="No campaigns yet"
    description="Create your first email campaign to start reaching your audience."
    primaryAction={{
      label: "Create Campaign",
      href: "/email/campaigns/new"
    }}
    secondaryAction={{
      label: "View Templates",
      href: "/email-templates"
    }}
  />
);

export const EmptyContacts = () => (
  <EmptyState
    icon="👥"
    title="No contacts yet"
    description="Start building your email list by adding your first contact."
    primaryAction={{
      label: "Add Contact",
      href: "/email/contacts"
    }}
    secondaryAction={{
      label: "Import Contacts",
      href: "/email/contacts"
    }}
  />
);

export const EmptyEmailDashboard = () => (
  <EmptyState
    icon="📬"
    title="Welcome to Email Marketing"
    description="Get started by creating your first template and building your contact list."
    primaryAction={{
      label: "Create Template",
      href: "/email-templates/new"
    }}
    secondaryAction={{
      label: "Add Contacts",
      href: "/email/contacts"
    }}
  />
);


