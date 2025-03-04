import { BoardClient } from './board-client';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function BoardPage({ params }: PageProps) {
  
  const resolvedParams = await Promise.resolve(params);
  
  return <BoardClient id={resolvedParams.id} />;
} 