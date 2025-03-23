'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './navigation.module.css';
import { Home, History } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigator}>
      <Link className={styles.navigatorTitle} href="/">YouTube Audio Transcriptor</Link>
      <div className={styles.navigatorItems}>
        <div className={styles.navigatorItem}>
          <Home size={16} />
          <Link
            href="/"
            className={`${styles.navigationItemLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Home
          </Link>
        </div>
        <span className={styles.navigatorSeparator}>|</span>
        <div className={styles.navigatorItem}>
          <History size={16} />
          <Link
            href="/history"
            className={`${styles.navigationItemLink} ${pathname === '/history' ? styles.active : ''}`}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}
