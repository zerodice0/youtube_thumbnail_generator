'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './navigation.module.css';
import { Home, History } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigator}>
      <Link className={styles.navigatorTitle} href="/">Youtube 오디오 다운로드 및 자막 생성 툴</Link>
      <div className={styles.navigatorItems}>
        <div className={styles.navigatorItem}>
          <Home size={16} />
          <Link
            href="/"
            className={`${styles.navigationItemLink} ${pathname === '/' ? styles.active : ''}`}
          >
            처리 요청
          </Link>
        </div>
        <span className={styles.navigatorSeparator}>|</span>
        <div className={styles.navigatorItem}>
          <History size={16} />
          <Link
            href="/history"
            className={`${styles.navigationItemLink} ${pathname === '/history' ? styles.active : ''}`}
          >
            처리 내역
          </Link>
        </div>
      </div>
    </nav>
  );
}
