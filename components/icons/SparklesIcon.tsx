
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M9.315 7.584C10.59 6.331 12.753 6.331 14.029 7.584l.435.435a1.5 1.5 0 010 2.121l-2.122 2.121-5.09-5.09.434-.435z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M11.085 10.915l2.122-2.121.435.435a1.5 1.5 0 010 2.121l-2.121 2.121-2.546 2.546a1.5 1.5 0 01-2.121 0l-.435-.435-2.121-2.121.435-.435a1.5 1.5 0 012.121 0l2.546-2.546zM3.515 17.085l2.121-2.121.435.435a1.5 1.5 0 010 2.121l-2.121 2.121-.435-.435a1.5 1.5 0 010-2.121l.435-.435z"
      clipRule="evenodd"
    />
  </svg>
);

export default SparklesIcon;
