import { DataAnalysisForExcel } from '#/types/integration-mstroy-types';
import * as XLSX from 'xlsx';


export const exportToExcelAdvanced = (data: DataAnalysisForExcel[], filename: string = 'data_analysis.xlsx'): void => {
    if (!data || data.length === 0) {
        console.warn('Нет данных для экспорта');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        
        // Преобразуем данные
        const wsData = data.map((item, index) => ({
            '№': index + 1,
            'Система': item.system,
            'Дата': item.date,
            'Подразделение': item.organization,
            'Организация': item.mainOrganization,
            'Количество': item.value
        }));
        
        const ws = XLSX.utils.json_to_sheet(wsData);
        
        // Добавляем заголовок
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F1');
        range.s.r = 0;
        range.e.r = 0;
        
        // Стилизация заголовков
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true, color: { rgb: 'FFFFFF' } },
                fill: { fgColor: { rgb: '4472C4' } },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
        }
        
        // Настраиваем ширину колонок
        ws['!cols'] = [
            { wch: 5 },
            { wch: 10 },
            { wch: 12 },
            { wch: 30 },
            { wch: 25 },
            { wch: 12 },
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Анализ');
        XLSX.writeFile(wb, filename);
        
    } catch (error) {
        console.error('Ошибка экспорта:', error);
    }
};