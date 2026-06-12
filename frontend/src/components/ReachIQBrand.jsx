import React from 'react';

/**
 * ReachIQ Logo Icon — Target/Person with growth arrow.
 * Used standalone for favicon/app icon sizes.
 */
export function ReachIQLogo({ size = 32, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      {/* Outer circle (target ring) */}
      <circle cx="14" cy="16" r="11" stroke="#2563EB" strokeWidth="2.5" />
      {/* Person head */}
      <circle cx="14" cy="13" r="3.5" fill="#2563EB" />
      {/* Person body arc */}
      <path
        d="M7.5 22.5c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Growth arrow */}
      <line x1="21" y1="11" x2="27" y2="5" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
      <polyline
        points="23,5 27,5 27,9"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * ReachIQ full brand wordmark for sidebar.
 * "Reach" in dark navy, "IQ" in primary blue.
 */
export function ReachIQWordmark({ className = '' }) {
  return (
    <div className={className}>
      <h1 className="font-bold text-textPrimary leading-none text-[15px]" style={{ letterSpacing: '-0.02em' }}>
        <span style={{ color: '#0F172A' }}>Reach</span>
        <span style={{ color: '#2563EB' }}>IQ</span>
      </h1>
      <span className="text-[9px] text-textSecondary uppercase tracking-widest block mt-0.5">
        AI-Powered CRM
      </span>
    </div>
  );
}

/**
 * Combined sidebar logo: icon + wordmark
 */
export default function ReachIQBrand({ iconSize = 28 }) {
  return (
    <div className="flex items-center gap-2.5">
      <ReachIQLogo size={iconSize} />
      <ReachIQWordmark />
    </div>
  );
}
