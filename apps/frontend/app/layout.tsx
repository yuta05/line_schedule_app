export const metadata = { title: '予約フォーム', description: 'LIFF予約フォーム' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}


