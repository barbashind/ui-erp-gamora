import * as XLSX from 'xlsx';
import { PersonRS } from '../Dashboards/FaceIDRegistration';

export const exportToExcelReportSkudCopy = (
  data: PersonRS[],
  filename: string = 'events_report.xlsx'
): void => {
  if (!data || data.length === 0) {
    console.warn('Нет данных для экспорта');
    return;
  }

  try {
    const wb = XLSX.utils.book_new();

    // Заголовки в том порядке, который нужен в таблице
    const headers = [
      'имя',
      'Снилс',
      'ИНН',
      'Дата рождения',
    ];

    // Преобразуем данные в массив массивов (порядок = порядок заголовков)
    const rows = data.map((item) => [
      item.name,
      item.snils,
      item.inn,
      item.birthday,
    ]);

    // Создаём лист с заголовками и данными
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Определяем диапазон
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:U1');

    // Стилизация заголовков (жирный, белый текст, синий фон)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }

    // Ширина колонок под каждый заголовок
    ws['!cols'] = [
      { wch: 38 }, // ID события
      { wch: 38 }, // Сотрудник id_строка
      { wch: 28 }, // Сотрудник
      { wch: 12 }, // Гражданство
      
    ];

    // Закрепим первую строку с заголовками (freeze pane)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Автофильтр по всей шапке
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      }),
    };

    XLSX.utils.book_append_sheet(wb, ws, 'События СКУД');
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Ошибка экспорта:', error);
  }
};