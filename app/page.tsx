import Grid from '@/components/Grid';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-2xl font-bold text-blue-600">MiniSheet</h1>
      <Grid />
    </main>
  );
}
