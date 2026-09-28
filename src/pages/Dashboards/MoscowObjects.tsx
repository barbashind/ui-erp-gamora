import { Layout } from "@consta/uikit/Layout";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Select } from "@consta/uikit/Select";
import { Badge } from "@consta/uikit/Badge";
import { Loader } from "@consta/uikit/Loader";
import { Column } from "@consta/charts/Column";
import { Bar } from "@consta/charts/Bar";
import { DownloadOutlined, WarningOutlined } from "@ant-design/icons";
import { useEffect, useState, ReactNode } from "react";
import { ComboboxMultiple } from "../../global/ComboboxMultiple";
import {
  DepartmentTree,
  OvisionFilter,
  OvisionZone,
} from "../../types/integration-ovision";
import {
  authOvision,
  fetchDepartmentTree,
  getOvisionData,
  getOvisionPersonData,
  getOvisionZones,
  OvisionToken,
} from "../../services/IntegrationOvisionRS";
import { exportToExcelReport } from "../IntegrationFaceIdPage/ExportToExcelReport";
import {
  AggregatedItem,
  MergedItem,
} from "../IntegrationFaceIdPage/FaceIDFilter";

/* ============================================================
 *  Палитра «Автобан»
 * ============================================================ */
const ROAD = {
  orange: "#f97316",
  orangeLight: "#fb923c",
  orangeDark: "#ea580c",
  asphalt: "#111827",
  asphaltSoft: "#374151",
  line: "#e5e7eb",
  lineSoft: "#f3f4f6",
  text: "#111827",
  textMuted: "#6b7280",
  warnBg: "#fef3c7",
  warnBorder: "#f59e0b",
} as const;

const chartPalette = [
  ROAD.orange,
  ROAD.orangeDark,
  ROAD.asphalt,
  ROAD.asphaltSoft,
  ROAD.orangeLight,
  "#9ca3af",
  "#78350f",
];

/* ============================================================
 *  Валидаторы (без изменений)
 * ============================================================ */
const isValidSnils = (snils: string): boolean => {
  const trimmed = snils.trim();
  const formatRegex = /^\d{11}$|^\d{3}-\d{3}-\d{3} \d{2}$/;
  if (!formatRegex.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  const numberPart = digits.slice(0, 9);
  const controlDigits = digits.slice(9, 11);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(numberPart[i], 10) * (9 - i);
  let expectedControl: number;
  if (sum < 100) expectedControl = sum;
  else if (sum === 100 || sum === 101) expectedControl = 0;
  else {
    const remainder = sum % 101;
    expectedControl = remainder < 100 ? remainder : 0;
  }
  return parseInt(controlDigits, 10) === expectedControl;
};

const isValidInnPhysical = (inn: string): boolean => {
  const digits = inn.replace(/\D/g, "");
  if (digits.length !== 12) return false;
  if (/^(\d)\1{11}$/.test(digits)) return false;
  const c11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let s11 = 0;
  for (let i = 0; i < 10; i++) s11 += parseInt(digits[i], 10) * c11[i];
  let k11 = s11 % 11;
  if (k11 >= 10) k11 = 0;
  const c12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let s12 = 0;
  for (let i = 0; i < 11; i++) s12 += parseInt(digits[i], 10) * c12[i];
  let k12 = s12 % 11;
  if (k12 >= 10) k12 = 0;
  return parseInt(digits[10], 10) === k11 && parseInt(digits[11], 10) === k12;
};

const isValidOkpdtr = (code: string): boolean => {
  const digits = code.replace(/\D/g, "");
  if (digits.length !== 6) return false;
  if (digits[0] !== "1" && digits[0] !== "2") return false;
  if (/^(\d)\1{5}$/.test(digits)) return false;
  return true;
};

const UNKNOWN = "Неизвестно";

const resolveOrgById = (
  tree: DepartmentTree,
  id: number | string | null | undefined,
): string => {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return UNKNOWN;
  return tree.byId.get(numId) ?? UNKNOWN;
};

/* ============================================================
 *  Общие UI-обёртки
 * ============================================================ */
interface SummaryCardProps {
  title: string;
  accent?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const SummaryCard = ({
  title,
  accent = ROAD.orange,
  children,
  style,
}: SummaryCardProps) => (
  <Card
    border
    style={{
      position: "relative",
      padding: 20,
      minWidth: 260,
      flex: "1 1 240px",
      borderTop: `3px solid ${accent}`,
      ...style,
    }}
  >
    <Text
      size="s"
      weight="semibold"
      style={{
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: ROAD.textMuted,
        marginBottom: 14,
        display: "block",
      }}
    >
      {title}
    </Text>
    {children}
  </Card>
);

const ChartCard = ({
  title,
  right,
  children,
  style,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
}) => (
  <Card
    border
    style={{
      padding: 0,
      overflow: "hidden",
      ...style,
    }}
  >
    <Layout
      direction="row"
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 20px",
        background: ROAD.lineSoft,
        borderBottom: `1px solid ${ROAD.line}`,
      }}
    >
      <Layout direction="row" style={{ alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 6,
            height: 18,
            borderRadius: 3,
            background: ROAD.orange,
          }}
        />
        <Text size="m" weight="semibold" style={{ color: ROAD.asphalt }}>
          {title}
        </Text>
      </Layout>
      {right}
    </Layout>
    <div style={{ padding: 20 }}>{children}</div>
  </Card>
);

/* ============================================================
 *  Основной компонент
 * ============================================================ */
const MoscowObjects = () => {
  const [isLoadObjects, setIsLoadObjects] = useState<boolean>(true);
  const [isLoadEntries, setIsLoadEntries] = useState<boolean>(true);
  const [isLoadUncorrects, setIsLoadUncorrects] = useState<boolean>(true);

  const today = new Date();
  const day = new Date();
  day.setDate(day.getDate() - 7);

  const setStartOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 1, 0);
    return d;
  };
  const setEndOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const [objects, setObjects] = useState<OvisionZone[]>([]);
  const [entries, setEntries] = useState<MergedItem[]>([]);
  const [entriesUncorrect, setEntriesUncorrect] = useState<MergedItem[]>([]);

  const [dateMax, setDateMax] = useState<Date | null>(today);
  const [dateMin, setDateMin] = useState<Date | null>(day);

  const [selectedObjects, setSelectedObjects] = useState<OvisionZone[]>([]);
  const [selectedObject, setSelectedObject] = useState<OvisionZone | null>(null);
  const [objectDate, setObjectDate] = useState<Date | null>(today);

  const [dataAgr1, setDataAgr1] = useState<AggregatedItem[]>([]);
  const [todayData, setTodayData] = useState<AggregatedItem[]>([]);

  /* ---------- агрегаторы ---------- */
  const aggregateItemsWithOrgs = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.organization}|${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else
        map.set(key, {
          organization: item.organization || "",
          date: item.date,
          object: item.object,
          count: 1,
        });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  const aggregateItemsWithoutOrgs = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else
        map.set(key, {
          organization: item.organization || "",
          date: item.date,
          object: item.object,
          count: 1,
        });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  /* ============================================================
   *  Загрузчики — БЕЗ внутреннего setIsLoad*(false)
   *  Лоадером управляет только вызывающий useEffect
   * ============================================================ */

  // ---- Зоны ----
  const processZonesData = async (): Promise<OvisionZone[]> => {
    const token: OvisionToken = await authOvision();
    const resp = await getOvisionZones(token.access_token);
    const zones = resp.data.filter((item) => Number(item.id) !== 0);
    setObjects(zones);
    setSelectedObject(zones[0]);
    setSelectedObjects(zones);
    return zones;
  };

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoadObjects(true);
      try {
        await processZonesData();
      } catch (err) {
        console.error("Ошибка загрузки зон:", err);
      } finally {
        setIsLoadObjects(false);
      }
    };
    void loadAllData();
  }, []);

  // ---- Проходы ----
  const processEntriesData = async (
    dateFrom: Date,
    dateTo: Date,
    zones: OvisionZone[],
  ): Promise<MergedItem[]> => {
    const token: OvisionToken = await authOvision();
    const filter: OvisionFilter = {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    };

    const events = await getOvisionData(filter, token.access_token);
    const enriched: MergedItem[] = [];

    for (const ev of events.data) {
      const dateOnly = ev.created_at.split("T")[0];
      const zone = zones.find(
        (item) =>
          item.id === Number(ev.event.zone_id) ||
          item.id === Number(ev.event.zone_source_id),
      );
      enriched.push({
        date: dateOnly,
        object: zone?.name || "Не найдено",
        employeeId: ev.objects_id,
        fullName: ev.title,
      });
    }

    const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
    for (const item of enriched) {
      if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
      const dateMap = groupedByDate.get(item.date)!;
      if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
    }
    const result: MergedItem[] = [];
    for (const dateMap of groupedByDate.values())
      result.push(...Array.from(dateMap.values()));
    result.sort((a, b) => a.date.localeCompare(b.date));

    setDataAgr1(aggregateItemsWithoutOrgs(result));
    setEntries(result);
    return result;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!dateMin || !dateMax) return;
      setIsLoadEntries(true);
      try {
        await processEntriesData(dateMin, dateMax, selectedObjects);
      } catch (err) {
        console.error("Ошибка загрузки проходов:", err);
      } finally {
        setIsLoadEntries(false);
      }
    };
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMax, dateMin, selectedObjects]);

  // ---- Некорректные проходы ----
  const processEntriesUncorrectData = async (): Promise<MergedItem[]> => {
    const token: OvisionToken = await authOvision();
    const deptTree = await fetchDepartmentTree(token.access_token);
    const enriched: MergedItem[] = [];

    for (const ev of entries) {
      await getOvisionPersonData(token.access_token, Number(ev.employeeId))
        .then((resp) => {
          const zone = ev.object;
          const snils =
            resp.data.values.find((el) => el.name === "snils")?.value || null;
          const inn =
            resp.data.values.find((el) => el.name === "staffinn")?.value ||
            null;
          const citizenship =
            Number(
              resp.data.values.find((el) => el.name === "citizen")?.value,
            ) || null;
          const kigId =
            resp.data.values.find((el) => el.name === "kigid")?.value || null;
          const jobTitle =
            resp.data.profiles[0].values.find((el) => el.name === "funres")
              ?.value || null;

          const department = resp.data.profiles[0].departments_id || "";
          const departmentName = resp.data.profiles[0].department || "";
          const isAtf = departmentName.toLowerCase().includes("автоколонна");
          const organization = isAtf
            ? "АТФ"
            : resolveOrgById(deptTree, department);

          enriched.push({
            date: ev.date,
            object: zone,
            employeeId: ev.employeeId,
            fullName: ev.fullName,
            organization,
            snils: !snils
              ? "Не заполнен СНИЛС"
              : !isValidSnils(snils)
              ? "Некорректный СНИЛС"
              : undefined,
            inn: !inn
              ? "Не заполнен ИНН"
              : !isValidInnPhysical(inn)
              ? "Некорректный ИНН"
              : undefined,
            country: !citizenship ? "Не заполнено гражданство" : undefined,
            kig:
              citizenship !== 643 && citizenship !== 112 && !kigId
                ? "Не заполнен КИГ ID"
                : undefined,
            okpdtr: !jobTitle
              ? "Не заполнена должность"
              : !isValidOkpdtr(jobTitle)
              ? "Некорректная должность"
              : undefined,
          });
        })
        .catch((error) => {
          console.warn(
            `[SKUD] Пропущена запись employeeId=${ev.employeeId}:`,
            error?.message || error,
          );
        });
    }

    const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
    for (const item of enriched) {
      if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
      const dateMap = groupedByDate.get(item.date)!;
      if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
    }
    const result: MergedItem[] = [];
    for (const dateMap of groupedByDate.values())
      result.push(...Array.from(dateMap.values()));
    result.sort((a, b) => a.date.localeCompare(b.date));

    setEntriesUncorrect(result);
    setTodayData(aggregateItemsWithOrgs(result));
    return result;
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (entries.length === 0) {
        setEntriesUncorrect([]);
        setIsLoadUncorrects(false);
        return;
      }
      setIsLoadUncorrects(true);
      try {
        await processEntriesUncorrectData();
      } catch (err) {
        console.error("Ошибка загрузки некорректных проходов:", err);
      } finally {
        setIsLoadUncorrects(false);
      }
    };
    void loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // Фильтр «некорректных» для выбранного объекта и даты
  useEffect(() => {
    const todayStr = objectDate
      ? objectDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const filtered = entriesUncorrect.filter((item) => item.date === todayStr);
    setTodayData(aggregateItemsWithOrgs(filtered));
  }, [entriesUncorrect, objectDate]);

  /* ---------- производные значения для карточек ---------- */
  const todayStr = today.toISOString().split("T")[0];

  const averagePerDay =
    dateMax && dateMin
      ? Math.round(
          entries.length /
            Math.max(
              1,
              Math.round(
                (new Date(
                  dateMax.getFullYear(),
                  dateMax.getMonth(),
                  dateMax.getDate(),
                ).getTime() -
                  new Date(
                    dateMin.getFullYear(),
                    dateMin.getMonth(),
                    dateMin.getDate(),
                  ).getTime()) /
                  (24 * 60 * 60 * 1000),
              ),
            ),
        )
      : 0;

  const entriesToday = entries.filter((item) => item.date === todayStr).length;

  const incorrectList = entriesUncorrect.filter(
    (i) => i.kig || i.inn || i.snils || i.okpdtr || i.country,
  );
  const incorrectTotal = incorrectList.length;
  const incorrectPercent = entriesUncorrect.length
    ? Math.round((incorrectTotal / entriesUncorrect.length) * 100)
    : 0;

  /* ============================================================
   *  РЕНДЕР
   * ============================================================ */
  return (
    <Layout direction="column" className={cnMixSpace({ p: "xl" })}>
      {/* ======================= ЗАГОЛОВОК ======================= */}
      <Layout
        direction="row"
        style={{
          alignItems: "center",
          gap: 12,
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: `2px solid ${ROAD.orange}`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 28,
            borderRadius: 4,
            background: `linear-gradient(180deg, ${ROAD.orangeLight} 0%, ${ROAD.orangeDark} 100%)`,
          }}
        />
        <Text size="2xl" weight="bold" style={{ color: ROAD.asphalt }}>
          Face ID · Объекты Москвы
        </Text>
      </Layout>

      {/* ======================= ФИЛЬТРЫ ======================= */}
      <Layout
        direction="row"
        style={{
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          marginBottom: 24,
        }}
      >
        <Layout direction="column" style={{ minWidth: 240 }}>
          <Text
            size="xs"
            style={{ color: ROAD.textMuted, marginBottom: 6, fontWeight: 600 }}
          >
            Период
          </Text>
          <Layout direction="row">
            <DatePicker
              type="date"
              size="s"
              value={dateMin}
              maxDate={today}
              onChange={(value) => value && setDateMin(setStartOfDay(value))}
            />
            <DatePicker
              type="date"
              size="s"
              value={dateMax}
              maxDate={today}
              onChange={(value) => value && setDateMax(setEndOfDay(value))}
              className={cnMixSpace({ mL: "s" })}
            />
          </Layout>
        </Layout>

        <Layout direction="column" style={{ minWidth: 280 }}>
          <Text
            size="xs"
            style={{ color: ROAD.textMuted, marginBottom: 6, fontWeight: 600 }}
          >
            Объекты
          </Text>
          <ComboboxMultiple
            items={objects}
            value={selectedObjects}
            onChange={(value) => setSelectedObjects(value ?? [])}
            getItemLabel={(item) => item.name}
            getItemKey={(item) => item.id}
            placeholder="Выберите объекты"
            size="s"
            multiple
            style={{ minWidth: 280 }}
            isLoading={isLoadObjects}
          />
        </Layout>
      </Layout>

      {/* ======================= КАРТОЧКИ СВОДКИ ======================= */}
      <Layout
        direction="row"
        style={{
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard title="Всего объектов" accent={ROAD.asphalt}>
          {isLoadObjects ? (
            <Loader />
          ) : (
            <Text
              size="4xl"
              weight="bold"
              style={{ color: ROAD.asphalt, lineHeight: 1 }}
            >
              {objects.length}
            </Text>
          )}
        </SummaryCard>

        <SummaryCard title="Численность на объектах" accent={ROAD.orange}>
          {isLoadEntries ? (
            <Loader />
          ) : (
            <Layout
              direction="row"
              style={{ gap: 24, alignItems: "flex-start" }}
            >
              <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  view="secondary"
                  style={{ marginBottom: 4 }}
                >
                  В среднем
                </Text>
                <Text
                  size="2xl"
                  weight="bold"
                  style={{ color: ROAD.orange, lineHeight: 1.1 }}
                >
                  {averagePerDay}
                </Text>
              </Layout>
              <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  view="secondary"
                  style={{ marginBottom: 4 }}
                >
                  Сегодня
                </Text>
                <Text
                  size="2xl"
                  weight="bold"
                  style={{ color: ROAD.asphalt, lineHeight: 1.1 }}
                >
                  {entriesToday}
                </Text>
              </Layout>
            </Layout>
          )}
        </SummaryCard>

        <SummaryCard title="Некорректные проходы" accent={ROAD.warnBorder}>
          {isLoadUncorrects ? (
            <Loader />
          ) : (
            <Layout
              direction="row"
              style={{ gap: 24, alignItems: "flex-start" }}
            >
              <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  view="secondary"
                  style={{ marginBottom: 4 }}
                >
                  Всего
                </Text>
                <Text
                  size="2xl"
                  weight="bold"
                  style={{ color: ROAD.orangeDark, lineHeight: 1.1 }}
                >
                  {incorrectTotal}
                </Text>
              </Layout>
              <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  view="secondary"
                  style={{ marginBottom: 4 }}
                >
                  % от всех
                </Text>
                <Text
                  size="2xl"
                  weight="bold"
                  style={{ color: ROAD.warnBorder, lineHeight: 1.1 }}
                >
                  {incorrectPercent}%
                </Text>
              </Layout>
            </Layout>
          )}
        </SummaryCard>
      </Layout>

      {/* ======================= ОСНОВНОЙ КОНТЕНТ ======================= */}
      {isLoadEntries ? (
        <Layout
          style={{
            width: "100%",
            minHeight: "50vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader size="m" />
        </Layout>
      ) : (
        <Layout direction="column" style={{ gap: 20 }}>
          {/* -------- График по объектам за период -------- */}
          <ChartCard
            title="Статистика по объектам за период"
            right={
              <Button
                label="Выгрузить"
                size="s"
                iconLeft={AntIcon.asIconComponent(() => (
                  <DownloadOutlined
                    className={cnMixFontSize("l") + cnMixSpace({ mR: "xs" })}
                  />
                ))}
                view="secondary"
                onClick={() => exportToExcelReport(entriesUncorrect)}
                disabled={isLoadUncorrects}
              />
            }
          >
            <Column
              data={dataAgr1}
              xField="date"
              yField="count"
              seriesField="object"
              isGroup
              color={chartPalette}
            />
          </ChartCard>

          {/* -------- Две колонки -------- */}
          <Layout
            direction="row"
            style={{ flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}
          >
            {/* -------- ЛЕВАЯ: селект объекта + Bar -------- */}
            <Layout
              direction="column"
              style={{ flex: "1 1 45%", minWidth: 400, gap: 16 }}
            >
              <Card border style={{ padding: 16 }}>
                <Layout
                  direction="row"
                  style={{ gap: 12, alignItems: "flex-end" }}
                >
                  <Select
                    items={objects}
                    value={selectedObject}
                    onChange={setSelectedObject}
                    getItemLabel={(item) => item.name}
                    getItemKey={(item) => item.id}
                    placeholder="Выберите объект"
                    label="Объект"
                    size="s"
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <DatePicker
                    type="date"
                    size="s"
                    value={objectDate}
                    maxDate={today}
                    onChange={(value) => value && setObjectDate(value)}
                  />
                </Layout>
              </Card>

              <ChartCard
                title="Распределение по организациям"
                right={
                  <Layout
                    direction="row"
                    style={{ alignItems: "baseline", gap: 8 }}
                  >
                    <Text size="xs" view="secondary">
                      Всего на объекте
                    </Text>
                    <Text
                      size="l"
                      weight="bold"
                      style={{ color: ROAD.orange }}
                    >
                      {
                        entries.filter(
                          (item) =>
                            item.object === selectedObject?.name &&
                            item.date ===
                              objectDate?.toISOString().split("T")[0],
                        ).length
                      }
                    </Text>
                  </Layout>
                }
              >
                <Bar
                  style={{ minHeight: 350, width: "100%" }}
                  data={todayData.filter(
                    (item) => item.object === selectedObject?.name,
                  )}
                  xField="count"
                  yField="organization"
                  seriesField="organization"
                  legend={false}
                  yAxis={{
                    label: {
                      formatter: (text: string) => {
                        const maxLen = 25;
                        return text.length > maxLen
                          ? text.slice(0, maxLen) + "…"
                          : text;
                      },
                    },
                  }}
                  label={{
                    position: "middle",
                    layout: [
                      { type: "interval-adjust-position" },
                      { type: "interval-hide-overlap" },
                      { type: "adjust-color" },
                    ],
                  }}
                  color={chartPalette}
                />
              </ChartCard>
            </Layout>

            {/* -------- ПРАВАЯ: список некорректных проходов -------- */}
            <Layout
              direction="column"
              style={{ flex: "1 1 45%", minWidth: 400 }}
            >
              <ChartCard title="Некорректные проходы">
                <div
                  style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {isLoadUncorrects ? (
                    <Layout
                      style={{
                        minHeight: 200,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Loader size="m" />
                    </Layout>
                  ) : incorrectList.length === 0 ? (
                    <Text size="s" view="secondary">
                      Нет данных
                    </Text>
                  ) : (
                    incorrectList.map((pass) => (
                      <div
                        key={pass.employeeId + pass.date}
                        style={{
                          border: `1px solid ${ROAD.line}`,
                          borderLeft: `3px solid ${ROAD.warnBorder}`,
                          borderRadius: 8,
                          padding: "12px 14px",
                          background: ROAD.lineSoft,
                        }}
                      >
                        <Layout
                          direction="row"
                          style={{
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <Text size="s" weight="semibold">
                            {pass.object}
                          </Text>
                          <Text size="s" view="secondary">
                            {pass.date}
                          </Text>
                        </Layout>
                        <Text size="s" style={{ marginBottom: 8 }}>
                          {pass.fullName}
                        </Text>
                        <Layout
                          direction="row"
                          style={{
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          {pass.inn && (
                            <Badge
                              iconLeft={AntIcon.asIconComponent(() => (
                                <WarningOutlined
                                  className={
                                    cnMixFontSize("l") +
                                    cnMixSpace({ mR: "xs" })
                                  }
                                />
                              ))}
                              label={pass.inn}
                              size="s"
                              view="stroked"
                              status="error"
                            />
                          )}
                          {pass.snils && (
                            <Badge
                              label={pass.snils}
                              size="s"
                              view="stroked"
                              status="error"
                            />
                          )}
                          {pass.country && (
                            <Badge
                              label={pass.country}
                              size="s"
                              view="stroked"
                              status="error"
                            />
                          )}
                          {pass.kig && (
                            <Badge
                              label={pass.kig}
                              size="s"
                              view="stroked"
                              status="error"
                            />
                          )}
                          {pass.okpdtr && (
                            <Badge
                              label={pass.okpdtr}
                              size="s"
                              view="stroked"
                              status="error"
                            />
                          )}
                        </Layout>
                      </div>
                    ))
                  )}
                </div>
              </ChartCard>
            </Layout>
          </Layout>
        </Layout>
      )}
    </Layout>
  );
};

export default MoscowObjects;