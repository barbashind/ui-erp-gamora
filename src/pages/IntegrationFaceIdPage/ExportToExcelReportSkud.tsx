import * as XLSX from 'xlsx';
import { Events } from '../Dashboards/Agitation';

export const exportToExcelReportSkud = (
  data: Events[],
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
      'ID события',
      'Сотрудник id_строка',
      'Сотрудник',
      'Гражданство',
      'СНИЛС',
      'Номер карты иностранного гражданина',
      'Наименование организации',
      'Тип события',
      'Дата и время прохода',
      'Оборудование id_строка',
      'Оборудование',
      'ID прибора',
      'Признак удаления прибора',
      'УИН объекта строительства',
      'УИН объекта строительства УГД',
      'Признак удаления объекта',
      'Вид пропуска',
      'Тип пропуска',
      'Клиент',
      'Дата создания элемента',
      'Дата последнего изменения',
    ];

    // Преобразуем данные в массив массивов (порядок = порядок заголовков)
    const rows = data.map((item) => [
      item.id_event,
      item.id_employee,
      item.employee,
      item.country,
      item.snils,
      item.kig,
      item.org,
      item.type,
      item.date,
      item.terminal_id,
      item.devicename,
      item.term_id,
      item.isDeleted,
      item.uin,
      item.uinUGD,
      item.isDeletedObj,
      item.vidPropusk,
      item.typePropusk,
      item.client,
      item.dateCreation,
      item.dateUpdated,
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
      { wch: 16 }, // СНИЛС
      { wch: 30 }, // Номер карты иностранного гражданина
      { wch: 30 }, // Наименование организации
      { wch: 20 }, // Тип события
      { wch: 20 }, // Дата и время прохода
      { wch: 38 }, // Оборудование id_строка
      { wch: 25 }, // Оборудование
      { wch: 38 }, // ID прибора
      { wch: 15 }, // Признак удаления прибора
      { wch: 30 }, // УИН объекта строительства
      { wch: 30 }, // УИН объекта строительства УГД
      { wch: 15 }, // Признак удаления объекта
      { wch: 18 }, // Вид пропуска
      { wch: 18 }, // Тип пропуска
      { wch: 30 }, // Клиент
      { wch: 22 }, // Дата создания элемента
      { wch: 22 }, // Дата последнего изменения
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