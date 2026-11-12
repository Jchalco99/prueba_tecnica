export function formatFecha(iso: string | null): string {
  if (!iso) {
    return 'Sin registros previos';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Sin registros previos';
  }
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
