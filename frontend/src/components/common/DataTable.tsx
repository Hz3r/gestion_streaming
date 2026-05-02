// src/components/common/DataTable.tsx
import { useMemo } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Trash2, Plus } from "lucide-react";
// ─── Props del componente ───
interface DataTableProps<T extends Record<string, any>> {
    columns: MRT_ColumnDef<T>[];      // Columnas (las define cada página)
    data: T[];                         // Datos (los provee cada página)
    title?: string;                    // Título opcional sobre la tabla
    onAdd?: () => void;                // Callback al hacer clic en "Agregar"
    onEdit?: (row: T) => void;         // Callback al hacer clic en "Editar"
    onDelete?: (row: T) => void;       // Callback al hacer clic en "Eliminar"
    isLoading?: boolean;               // Estado de carga
}
function DataTable<T extends Record<string, any>>({
    columns,
    data,
    title,
    onAdd,
    onEdit,
    onDelete,
    isLoading = false,
}: DataTableProps<T>) {
    // ─── Configuración de la tabla ───
    const table = useMaterialReactTable({
        columns,
        data,
        // ─── Acciones por fila ───
        enableRowActions: !!(onEdit || onDelete),
        positionActionsColumn: "last",
        renderRowActions: ({ row }) => (
            <Box sx={{ display: "flex", gap: "2px" }}>
                {onEdit && (
                    <Tooltip title="Editar">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(row.original)}
                        >
                            <Edit size={18} />
                        </IconButton>
                    </Tooltip>
                )}
                {onDelete && (
                    <Tooltip title="Eliminar">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(row.original)}
                        >
                            <Trash2 size={18} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        ),
        // ─── Búsqueda global ───
        enableGlobalFilter: true,
        positionGlobalFilter: "left",
        // ─── Paginación ───
        enablePagination: true,
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
            showGlobalFilter: true,
        },
        // ─── Estado de carga ───
        state: { isLoading },
        // ─── Configuración visual ───
        enableColumnActions: false,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        // ─── Textos en español ───
        localization: {
            actions: "Acciones",
            rowsPerPage: "Filas por página",
            search: "Buscar...",
            noRecordsToDisplay: "No se encontraron registros",
            of: "de",
        },
    });
    return (
        <div className="page-table">
            {/* ─── Toolbar superior ─── */}
            <div className="page-table__toolbar">
                {title && <h3 className="page-table__title">{title}</h3>}
                {onAdd && (
                    <button className="btn-add" onClick={onAdd}>
                        <Plus size={18} />
                        Agregar
                    </button>
                )}
            </div>
            {/* ─── Tabla ─── */}
            <div className="table-card">
                <MaterialReactTable table={table} />
            </div>
        </div>
    );
}
export default DataTable;