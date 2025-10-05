import Link from 'next/link';
import React from 'react';

// Define the shape of the user prop this component needs
interface UserSummary {
  _id: string;
  role: 'player' | 'developer' | 'admin';
}

interface ProfileLinkProps {
  user: UserSummary;
  children: React.ReactNode;
  className?: string;
}

export const ProfileLink = ({ user, children, className }: ProfileLinkProps) => {
  // Determine the correct profile URL based on the user's role
  const profileUrl = user.role === 'developer'
    ? `/developer/${user._id}`
    : `/profile/${user._id}`;

  return (
    <Link href={profileUrl} passHref legacyBehavior>
      <a className={className} style={{ textDecoration: 'none', color: 'inherit' }}>
        {children}
      </a>
    </Link>
  );
};