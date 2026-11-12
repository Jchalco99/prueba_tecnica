import { History } from 'lucide-react';
import {
  type Equipo,
  INTERVALO_POR_TIPO,
  TIPO_EQUIPO_LABEL,
} from '@/entities/equipo/model/types';
import { EstadoMantenimientoBadge } from '@/entities/equipo/ui/estado-mantenimiento-badge';
import { formatFecha } from '@/shared/lib/format-date';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

interface MantenimientoHistoryDialogProps {
  equipo: Equipo;
  compact?: boolean;
}

/** Displays a modal with the chronological maintenance log of an equipment unit. */
export function MantenimientoHistoryDialog({
  equipo,
  compact = false,
}: MantenimientoHistoryDialogProps) {
  const mantenimientos = equipo.mantenimientos ?? [];
  const totalRegistros = mantenimientos.length;
  const intervalo = INTERVALO_POR_TIPO[equipo.tipo];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Ver historial de mantenimiento de ${equipo.codigo}`}
            title={`Ver historial (${totalRegistros})`}
          >
            <History aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Ver historial de mantenimiento de ${equipo.codigo}`}
          >
            <History aria-hidden="true" />
            <span>Historial ({totalRegistros})</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5 pr-6">
            <DialogTitle className="font-mono">{equipo.codigo}</DialogTitle>
            <EstadoMantenimientoBadge
              requiereMantenimiento={equipo.requiereMantenimiento}
            />
          </div>
          <DialogDescription>
            {TIPO_EQUIPO_LABEL[equipo.tipo]} · Horómetro actual: {equipo.horometro}{' '}
            h · Ciclo cada {intervalo} h
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Historial de mantenimientos preventivos</span>
          <Badge variant="secondary">
            {totalRegistros}{' '}
            {totalRegistros === 1 ? 'registro' : 'registros'}
          </Badge>
        </div>

        {totalRegistros === 0 ? (
          <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            Esta unidad aún no tiene mantenimientos registrados.
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3">Servicio</TableHead>
                  <TableHead className="px-3">Fecha y hora</TableHead>
                  <TableHead className="px-3 text-right">Horómetro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mantenimientos.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-2.5 text-xs font-medium">
                      <span className="font-mono">
                        #{totalRegistros - index}
                      </span>
                      {index === 0 ? (
                        <Badge
                          variant="outline"
                          className="ml-2 px-1.5 py-0 text-[10px]"
                        >
                          Último
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground">
                      {formatFecha(item.fecha)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-mono text-xs font-semibold tabular-nums">
                      {item.horometroActual} h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
