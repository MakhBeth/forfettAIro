import React from 'react';
import { Github } from 'lucide-react';
import styles from './Footer.module.css';

interface FooterProps {
  version?: string;
}

const Footer: React.FC<FooterProps> = ({ version = '2.0.0' }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mobileInfo}>
          <div className={styles.credits}>
            Made by <a href="https://github.com/MakhBeth" target="_blank" rel="noopener noreferrer">MakhBeth</a> with AI
          </div>
          <div className={styles.privacy}>
            🔒 All data stays local
          </div>
          <a href="https://github.com/MakhBeth/forfettAIro" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
            <Github size={14} /> View on GitHub
          </a>
        </div>
        <div className={styles.right}>
          <span className={styles.version}>v{version}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
