import App from '@/components/App';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  const { k } = await searchParams;
  return <App urlCode={k ?? null} />;
}
