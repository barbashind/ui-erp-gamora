import { Layout } from "@consta/uikit/Layout";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { Loader } from "@consta/uikit/Loader";
import { Bar } from "@consta/charts/Bar";
import { useEffect, useState, ReactNode, CSSProperties } from "react";
import { DepartmentTree } from "../../types/integration-ovision";
import {
  authOvision,
  fetchDepartmentTree,
  getOvisionPeopleBioData,
  getOvisionPeopleData,
  OvisionToken,
} from "../../services/IntegrationOvisionRS";
import {
  authOvisionKBS,
  fetchDepartmentTreeKBS,
  getOvisionPeopleBioDataKBS,
  getOvisionPeopleDataKBS,
  OvisionTokenKBS,
} from "../../services/IntegrationOvisionKBS";
import { HighwayBar } from "../../global/HighwayBar";

/* ============================================================
 *  Палитра «Автобан» v2
 * ============================================================ */
const ROAD = {
  accent: "#ed7931",
  accentDark: "#e25e33",
  accentLight: "#f1aa48",
  accentGradient:
    "linear-gradient(4.34deg, #df5430 -1.37%, #f1aa48 137.96%)",

  blue: "#063955",
  blue2: "#004267",
  dark: "#011735",

  bg: "var(--color-bg-default)",
  bgSecondary: "var(--color-bg-secondary)",
  bgSoft: "var(--color-bg-stripe)",
  border: "var(--color-bg-border)",
  text: "var(--color-typo-primary)",
  textMuted: "var(--color-typo-secondary)",
  brand: "var(--color-typo-brand)",
} as const;

const chartPalette = [
  ROAD.accent,
  ROAD.accentDark,
  ROAD.blue,
  ROAD.blue2,
  ROAD.accentLight,
  "#9ca3af",
  "#d6d6d6",
];

const UNKNOWN = "Неизвестно";

/* ============================================================
 *  Хелперы
 * ============================================================ */
const resolveOrgById = (
  tree: DepartmentTree,
  id: number | string | null | undefined,
): string => {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return UNKNOWN;
  return tree.byId.get(numId) ?? UNKNOWN;
};

/** Нормализуем имя для ключа мёржа */
const normalizeName = (s: string): string =>
  (s || "").trim().replace(/\s+/g, " ").toLowerCase();

/* ============================================================
 *  Типы
 * ============================================================ */
export interface MergedPersonItem {
  employeeId: number | string;
  name: string;
  organization: string;
  statusRS: boolean;
  statusKBS: boolean;
}

export interface MergedBioItem {
  employeeId: number | string;
  organization: string;
}

export interface AggregatedBioItem {
  organization: string;
  count: number;
}

export interface AggregatedAllItem {
  organization: string;
  countAll: number;
  count: number;
  countMyId: number;
  countKBS: number;
}

/* ============================================================
 *  Общие UI-обёртки
 * ============================================================ */
interface StatCardProps {
  title: string;
  accent?: string;
  registered: number;
  remaining: number;
  loading: boolean;
}

const StatCard = ({
  title,
  accent = ROAD.accent,
  registered,
  remaining,
  loading,
}: StatCardProps) => (
  <Card
    border
    style={{
      position: "relative",
      padding: 20,
      minWidth: 260,
      flex: "1 1 240px",
      overflow: "hidden",
      borderTop: `3px solid ${accent}`,
      background: ROAD.bg,
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

    <Layout direction="row" style={{ gap: 24, alignItems: "flex-start" }}>
      <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" view="secondary" style={{ marginBottom: 4 }}>
          Зарегистрировано
        </Text>
        {loading ? (
          <Loader />
        ) : (
          <Text
            size="4xl"
            weight="bold"
            style={{ color: accent, lineHeight: 1 }}
          >
            {registered}
          </Text>
        )}
      </Layout>

      <Layout direction="column" style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" view="secondary" style={{ marginBottom: 4 }}>
          Осталось
        </Text>
        {loading ? (
          <Loader />
        ) : (
          <Text
            size="4xl"
            weight="bold"
            style={{ color: ROAD.textMuted, lineHeight: 1 }}
          >
            {remaining}
          </Text>
        )}
      </Layout>
    </Layout>
  </Card>
);

const ChartCard = ({
  title,
  children,
  flex,
  style,
}: {
  title: string;
  children: ReactNode;
  flex?: string;
  style?: CSSProperties;
}) => (
  <Card
    border
    style={{
      flex: flex ?? "1 1 45%",
      minWidth: 400,
      padding: 0,
      overflow: "hidden",
      background: ROAD.bg,
      ...style,
    }}
  >
    <Layout
      direction="row"
      style={{
        alignItems: "center",
        gap: 10,
        padding: "14px 20px",
        background: ROAD.bgSoft,
        borderBottom: `1px solid ${ROAD.border}`,
      }}
    >
      <div
        style={{
          width: 6,
          height: 18,
          borderRadius: 3,
          background: ROAD.accent,
        }}
      />
      <Text size="m" weight="semibold" style={{ color: ROAD.text }}>
        {title}
      </Text>
    </Layout>

    <div style={{ padding: 20 }}>{children}</div>
  </Card>
);

/* ============================================================
 *  Основной компонент
 * ============================================================ */
const FaceIDReport = () => {
  const [isLoadPeople, setIsLoadPeople] = useState<boolean>(true);

  const [persons, setPersons] = useState<MergedPersonItem[]>([]);
  const [personsNot, setPersonsNot] = useState<MergedPersonItem[]>([]);
  const [personsKBS, setPersonsKBS] = useState<MergedPersonItem[]>([]);
  const [personsKBSNot, setPersonsKBSNot] = useState<MergedPersonItem[]>([]);
  const [personsAll, setPersonsAll] = useState<MergedPersonItem[]>([]);

  const [bioData, setBioData] = useState<AggregatedBioItem[]>([]);
  const [bioDataKBS, setBioDataKBS] = useState<AggregatedBioItem[]>([]);
  const [bioDataAll, setBioDataAll] = useState<AggregatedAllItem[]>([]);

  /* ---------- агрегаторы ---------- */
  const aggregateItemsBio = (items: MergedBioItem[]): AggregatedBioItem[] => {
    const resultBio: AggregatedBioItem[] = Object.entries(
      items.reduce((acc, person) => {
        acc[person.organization] = (acc[person.organization] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    ).map(([organization, count]) => ({ organization, count }));

    resultBio.sort((a, b) => b.count - a.count);
    return resultBio;
  };

  const aggregateAllItems = (items: MergedPersonItem[]): AggregatedAllItem[] => {
    const map = new Map<string, AggregatedAllItem>();

    for (const item of items) {
      let acc = map.get(item.organization);
      if (!acc) {
        acc = {
          organization: item.organization,
          countAll: 0,
          count: 0,
          countMyId: 0,
          countKBS: 0,
        };
        map.set(item.organization, acc);
      }

      acc.countAll += 1;
      if (item.statusRS || item.statusKBS) acc.count += 1;
      if (item.statusRS) acc.countMyId += 1;
      if (item.statusKBS) acc.countKBS += 1;
    }

    const result = Array.from(map.values());
    result.sort((a, b) => b.count - a.count);
    return result;
  };

  /* ---------- загрузка (Promise.allSettled) ---------- */
  useEffect(() => {
    const processOvisionData = async (): Promise<void> => {
      const token: OvisionToken = await authOvision();
      const deptTree = await fetchDepartmentTree(token.access_token);
      const people = await getOvisionPeopleData(token.access_token);

      const enrichedPeople: MergedPersonItem[] = [];
      for (const ev of people.data) {
        const departmentName = ev.profiles[0].department || "";
        const department = ev.profiles[0].departments_id || "";
        const isSub = departmentName === resolveOrgById(deptTree, department);
        const isAtf = departmentName.toLowerCase().includes("автоколонна");
        const organization = isSub
          ? "Субподряд"
          : isAtf
          ? "АТФ"
          : resolveOrgById(deptTree, department);

        enrichedPeople.push({
          employeeId: ev.id,
          organization,
          name: ev.name,
          statusKBS: false,
          statusRS: false,
        });
      }
      setPersonsNot(enrichedPeople);
    };

    const processOvisionDataKBS = async (): Promise<void> => {
      const token: OvisionTokenKBS = await authOvisionKBS();
      const deptTree = await fetchDepartmentTreeKBS(token.access_token);
      const people = await getOvisionPeopleDataKBS(token.access_token);

      const enrichedPeople: MergedPersonItem[] = [];
      for (const ev of people.data) {
        const departmentName = ev.profiles[0].department || "";
        const department = ev.profiles[0].departments_id || "";
        const isSub = departmentName === resolveOrgById(deptTree, department);
        const isAtf = departmentName.toLowerCase().includes("автоколонна");
        const organization = isSub
          ? "Субподряд"
          : isAtf
          ? "АТФ"
          : resolveOrgById(deptTree, department);

        enrichedPeople.push({
          employeeId: ev.id,
          organization,
          name: ev.name,
          statusKBS: false,
          statusRS: false,
        });
      }
      setPersonsKBSNot(enrichedPeople);
    };

    const processOvisionBioData = async (): Promise<void> => {
      const token: OvisionToken = await authOvision();
      const deptTree = await fetchDepartmentTree(token.access_token);
      const people = await getOvisionPeopleBioData(token.access_token);

      const enrichedPeople: MergedBioItem[] = [];
      const enrichedPeople1: MergedPersonItem[] = [];

      for (const ev of people.data) {
        const departmentName = ev.profiles[0].department || "";
        const department = ev.profiles[0].departments_id || "";
        const isSub = departmentName === resolveOrgById(deptTree, department);
        const isAtf = departmentName.toLowerCase().includes("автоколонна");
        const organization = isSub
          ? "Субподряд"
          : isAtf
          ? "АТФ"
          : resolveOrgById(deptTree, department);

        enrichedPeople.push({ employeeId: ev.id, organization });
        enrichedPeople1.push({
          employeeId: ev.id,
          organization,
          name: ev.name,
          statusKBS: false,
          statusRS: true,
        });
      }

      setPersons(enrichedPeople1);
      setBioData(aggregateItemsBio(enrichedPeople));
    };

    const processOvisionBioDataKBS = async (): Promise<void> => {
      const token: OvisionTokenKBS = await authOvisionKBS();
      const deptTree = await fetchDepartmentTreeKBS(token.access_token);
      const people = await getOvisionPeopleBioDataKBS(token.access_token);

      const enrichedPeople: MergedBioItem[] = [];
      const enrichedPeople1: MergedPersonItem[] = [];

      for (const ev of people.data) {
        const departmentName = ev.profiles[0].department || "";
        const department = ev.profiles[0].departments_id || "";
        const isSub = departmentName === resolveOrgById(deptTree, department);
        const isAtf = departmentName.toLowerCase().includes("автоколонна");
        const organization = isSub
          ? "Субподряд"
          : isAtf
          ? "АТФ"
          : resolveOrgById(deptTree, department);

        enrichedPeople.push({ employeeId: ev.id, organization });
        enrichedPeople1.push({
          employeeId: ev.id,
          organization,
          name: ev.name,
          statusKBS: true,
          statusRS: false,
        });
      }

      setPersonsKBS(enrichedPeople1);
      setBioDataKBS(aggregateItemsBio(enrichedPeople));
    };

    const loadAllData = async () => {
      setIsLoadPeople(true);
      try {
        const results = await Promise.allSettled([
          processOvisionBioData(),
          processOvisionBioDataKBS(),
          processOvisionData(),
          processOvisionDataKBS(),
        ]);

        const labels = ["bio RS", "bio KBS", "regular RS", "regular KBS"];
        const failed = results
          .map((r, i) =>
            r.status === "rejected"
              ? { source: labels[i], reason: r.reason }
              : null,
          )
          .filter((x): x is { source: string; reason: unknown } => x !== null);

        if (failed.length > 0) {
          console.error(
            "Не все источники данных загрузились:",
            failed.map((f) => f.source).join(", "),
            failed,
          );
        }
      } finally {
        setIsLoadPeople(false);
      }
    };

    void loadAllData();
  }, []);

  /* ---------- мёрж ---------- */
  useEffect(() => {
    const map = new Map<string, MergedPersonItem>();

    const merge = (list: MergedPersonItem[]) => {
      for (const item of list) {
        const key = `${normalizeName(item.name)}||${item.organization}`;
        const existing = map.get(key);
        if (existing) {
          existing.statusRS = existing.statusRS || item.statusRS || false;
          existing.statusKBS = existing.statusKBS || item.statusKBS || false;
        } else {
          map.set(key, { ...item });
        }
      }
    };

    merge(persons);
    merge(personsNot);
    merge(personsKBS);
    merge(personsKBSNot);

    setPersonsAll(Array.from(map.values()));
  }, [persons, personsNot, personsKBS, personsKBSNot]);

  useEffect(() => {
    setBioDataAll(aggregateAllItems(personsAll));
  }, [personsAll]);

  /* ---------- сводные значения ---------- */
  const totalRegistered = personsAll.filter(
    (i) => i.statusKBS || i.statusRS,
  ).length;
  const totalRemaining = personsAll.length - totalRegistered;

  const myIdRegistered = personsAll.filter((i) => i.statusRS).length;
  const myIdRemaining = personsAll.length - myIdRegistered;

  const kbsRegistered = personsAll.filter((i) => i.statusKBS).length;
  const kbsRemaining = personsAll.length - kbsRegistered;

  /* ============================================================
   *  Рендер
   * ============================================================ */
  return (
    <Layout
      direction="column"
      className={cnMixSpace({ p: "xl" })}
      style={{ background: ROAD.bg, color: ROAD.text }}
    >
      {/* ======================= ЗАГОЛОВОК ======================= */}
      <Layout
        direction="row"
        style={{
          alignItems: "center",
          gap: 12,
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: `2px solid ${ROAD.accent}`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 28,
            borderRadius: 4,
            background: ROAD.accentGradient,
          }}
        />
        <Text size="2xl" weight="bold" style={{ color: ROAD.text }}>
          Face ID · Отчёт по регистрации
        </Text>
      </Layout>

      {/* ======================= СВОДНЫЕ КАРТОЧКИ ======================= */}
      <Layout
        direction="row"
        style={{ flexWrap: "wrap", gap: 16, marginBottom: 28 }}
      >
        <StatCard
          title="Всего в OVISION"
          accent={ROAD.accent}
          registered={totalRegistered}
          remaining={totalRemaining}
          loading={isLoadPeople}
        />
        <StatCard
          title="Мой ID"
          accent={ROAD.accentDark}
          registered={myIdRegistered}
          remaining={myIdRemaining}
          loading={isLoadPeople}
        />
        <StatCard
          title="Госуслуги · Биометрия"
          accent={ROAD.brand}
          registered={kbsRegistered}
          remaining={kbsRemaining}
          loading={isLoadPeople}
        />
      </Layout>

      {/* ======================= СПИСОК ОРГАНИЗАЦИЙ ======================= */}
      <Card
        border
        style={{
          padding: 0,
          marginBottom: 28,
          overflow: "hidden",
          background: ROAD.bg,
        }}
      >
        {/* Шапка */}
        <Layout
          direction="row"
          style={{
            padding: "14px 20px",
            background: ROAD.bgSoft,
            borderBottom: `1px solid ${ROAD.border}`,
            gap: 16,
            alignItems: "center",
          }}
        >
          <Text
            size="s"
            weight="semibold"
            style={{
              width: 220,
              color: ROAD.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Организация
          </Text>
          <Text
            size="s"
            weight="semibold"
            style={{
              width: 140,
              textAlign: "right",
              color: ROAD.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Зарегистрировано
          </Text>
          <Text
            size="s"
            weight="semibold"
            style={{
              width: 120,
              textAlign: "right",
              color: ROAD.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Всего
          </Text>
          <Text
            size="s"
            weight="semibold"
            style={{
              flex: 1,
              color: ROAD.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            % зарегистрированных
          </Text>
        </Layout>

        {/* Пусто */}
        {bioDataAll.length === 0 && !isLoadPeople && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Text view="secondary">Нет данных</Text>
          </div>
        )}

        {/* Строки */}
        {bioDataAll.map((row) => (
          <Layout
            key={row.organization}
            direction="row"
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${ROAD.border}`,
              gap: 16,
              alignItems: "center",
            }}
          >
            <Text
              size="m"
              weight="semibold"
              style={{ width: 220, color: ROAD.text }}
              truncate
            >
              {row.organization}
            </Text>

            <Text
              size="m"
              weight="bold"
              style={{ width: 140, textAlign: "right", color: ROAD.accent }}
            >
              {row.count}
            </Text>

            <Text
              size="m"
              style={{ width: 120, textAlign: "right", color: ROAD.textMuted }}
            >
              {row.countAll}
            </Text>

            <div style={{ flex: 1, minWidth: 200 }}>
              <HighwayBar registered={row.count} total={row.countAll} />
            </div>
          </Layout>
        ))}
      </Card>

      {/* ======================= ГРАФИКИ ======================= */}
      <Layout
        direction="row"
        style={{ flexWrap: "wrap", gap: 16, alignItems: "stretch" }}
      >
        <ChartCard title="Мой ID · по организациям" flex="1 1 45%">
          <Bar
            style={{ width: "100%" }}
            data={bioData}
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

        <ChartCard
          title="Госуслуги · Биометрия · по организациям"
          flex="1 1 45%"
        >
          <Bar
            style={{ width: "100%" }}
            data={bioDataKBS}
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
    </Layout>
  );
};

export default FaceIDReport;