"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import BubbleSelect from "./ui/BubbleSelect";
import ToggleChip from "./ui/ToggleChip";
import SliderInput from "./ui/SliderInput";
import TripleOption from "./ui/TripleOption";
import NumberInput from "./ui/NumberInput";
import NotesInput from "./ui/NotesInput";
import StreakBadge from "./ui/StreakBadge";
import PreviousValue from "./ui/PreviousValue";
import SaveBar, { SaveStatus } from "./SaveBar";
import Header from "./Header";
import WelcomeBanner from "./WelcomeBanner";
import {
  Entry,
  MetricKey,
  METRIC_KEYS,
  countTrackedMetrics,
  emptyEntry,
} from "@/lib/types";
import { addDays, getPreviousDayLabel, getTodayStr } from "@/lib/dates";
import { formatMetricValue } from "@/lib/metricLabels";

interface StreakData {
  overall: number;
  metrics: Record<MetricKey, number>;
}

interface DailyFormProps {
  initialDate?: string;
}

function MetricSection({
  index,
  label,
  streak,
  currentDate,
  previousValue,
  children,
}: {
  index: number;
  label: string;
  streak: number;
  currentDate: string;
  previousValue?: string | null;
  children: React.ReactNode;
}) {
  const previousDayLabel = getPreviousDayLabel(currentDate);
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-primary">{label}</h3>
          {previousValue !== undefined && (
            <PreviousValue label={previousValue} dayLabel={previousDayLabel} />
          )}
        </div>
        <StreakBadge count={streak} />
      </div>
      {children}
    </motion.section>
  );
}

export default function DailyForm({ initialDate }: DailyFormProps) {
  const [currentDate, setCurrentDate] = useState(
    initialDate ?? getTodayStr()
  );
  const [formData, setFormData] = useState<Entry>(emptyEntry(currentDate));
  const [previousEntry, setPreviousEntry] = useState<Entry | null>(null);
  const [streaks, setStreaks] = useState<StreakData>({
    overall: 0,
    metrics: Object.fromEntries(
      METRIC_KEYS.map((k) => [k, 0])
    ) as Record<MetricKey, number>,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const retryTimeout = useRef<NodeJS.Timeout>();

  const prev = (key: MetricKey) =>
    formatMetricValue(key, previousEntry);

  const previousDayLabel = getPreviousDayLabel(currentDate);

  const fetchEntry = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const prevDate = addDays(date, -1);
      const [currentRes, prevRes] = await Promise.all([
        fetch(`/api/entries?date=${date}`),
        fetch(`/api/entries?date=${prevDate}`),
      ]);
      const currentData = await currentRes.json();
      const prevData = await prevRes.json();
      setFormData(currentData.entry ?? emptyEntry(date));
      setPreviousEntry(prevData.entry ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreaks = useCallback(async () => {
    const today = getTodayStr();
    const res = await fetch(`/api/streaks?today=${today}`);
    const data = await res.json();
    setStreaks(data);
  }, []);

  useEffect(() => {
    fetchEntry(currentDate);
  }, [currentDate, fetchEntry]);

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  const saveToDB = useCallback(
    async (data: Entry, retry = false) => {
      setSaveStatus("saving");
      try {
        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        fetchStreaks();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        if (!retry) {
          setSaveStatus("error");
          retryTimeout.current = setTimeout(() => {
            saveToDB(data, true);
          }, 3000);
        }
      }
    },
    [fetchStreaks]
  );

  const handleChange = useCallback(
    <K extends keyof Entry>(field: K, value: Entry[K]) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          saveToDB(updated);
        }, 1000);
        return updated;
      });
    },
    [saveToDB]
  );

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
    setFormData(emptyEntry(date));
    setPreviousEntry(null);
  };

  const handleExport = () => {
    window.location.href = "/api/export";
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const trackedCount = countTrackedMetrics(formData);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Header
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onExport={handleExport}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-[480px] space-y-6 px-4 py-6">
        <WelcomeBanner
          currentDate={currentDate}
          overallStreak={streaks.overall}
          trackedToday={trackedCount}
          totalMetrics={12}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-center"
        >
          {streaks.overall >= 1 ? (
            <p className="text-lg font-semibold">
              <span className="streak-flame">🔥</span> {streaks.overall}-day
              streak
            </p>
          ) : (
            <p className="text-secondary">Start your streak today</p>
          )}
        </motion.div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Priority Metrics
          </p>
        </div>

        <MetricSection
          index={0}
          label="Skin Score"
          streak={streaks.metrics.skin_score}
          currentDate={currentDate}
          previousValue={prev("skin_score")}
        >
          <SliderInput
            value={formData.skin_score}
            onChange={(v) => handleChange("skin_score", v)}
            minLabel="Ouch"
            maxLabel="Perfect"
          />
        </MetricSection>

        <MetricSection
          index={1}
          label="Stress Level"
          streak={streaks.metrics.stress}
          currentDate={currentDate}
          previousValue={prev("stress")}
        >
          <SliderInput
            value={formData.stress}
            onChange={(v) => handleChange("stress", v)}
            minLabel="Bliss"
            maxLabel="Overwhelmed"
          />
        </MetricSection>

        <MetricSection
          index={2}
          label="Workload"
          streak={streaks.metrics.workload}
          currentDate={currentDate}
          previousValue={prev("workload")}
        >
          <SliderInput
            value={formData.workload}
            onChange={(v) => handleChange("workload", v)}
            minLabel="Light"
            maxLabel="Maxed"
          />
        </MetricSection>

        <MetricSection
          index={3}
          label="Today's Busyness"
          streak={streaks.metrics.busyness}
          currentDate={currentDate}
          previousValue={prev("busyness")}
        >
          <TripleOption
            options={[
              { value: "packed", label: "Packed" },
              { value: "normal", label: "Normal" },
              { value: "relaxed", label: "Relaxed" },
            ]}
            value={formData.busyness}
            onChange={(v) => handleChange("busyness", v)}
          />
        </MetricSection>

        <div className="space-y-1 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Daily Habits
          </p>
        </div>

        <MetricSection
          index={4}
          label="Sleep Last Night"
          streak={streaks.metrics.sleep}
          currentDate={currentDate}
          previousValue={prev("sleep")}
        >
          <BubbleSelect
            options={[
              { value: "<8hr", label: "<8hr" },
              { value: "8hr", label: "8hr" },
              { value: "8hr+", label: "8hr+" },
            ]}
            value={formData.sleep}
            onChange={(v) => handleChange("sleep", v)}
          />
        </MetricSection>

        <MetricSection
          index={5}
          label="Food Today"
          streak={streaks.metrics.food}
          currentDate={currentDate}
          previousValue={prev("food")}
        >
          <TripleOption
            options={[
              { value: "clean", label: "Clean" },
              { value: "normal", label: "Normal" },
              { value: "unhealthy", label: "Unhealthy" },
            ]}
            value={formData.food}
            onChange={(v) => handleChange("food", v)}
          />
        </MetricSection>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="space-y-1">
            <ToggleChip
              emoji="🍺"
              categoryLabel="Alcohol"
              value={formData.alcohol}
              goodValue={0}
              goodLabel="No alcohol"
              badLabel="Had alcohol"
              onChange={(v) => handleChange("alcohol", v)}
            />
            <PreviousValue label={prev("alcohol")} dayLabel={previousDayLabel} />
          </div>
          <div className="space-y-1">
            <ToggleChip
              emoji="💧"
              categoryLabel="Water"
              value={formData.water}
              goodValue={1}
              goodLabel="Hydrated"
              badLabel="Dehydrated"
              onChange={(v) => handleChange("water", v)}
            />
            <PreviousValue label={prev("water")} dayLabel={previousDayLabel} />
          </div>
          <div className="space-y-1">
            <ToggleChip
              emoji="🏋️"
              categoryLabel="Workout"
              value={formData.workout}
              goodValue={1}
              goodLabel="Worked out"
              badLabel="No workout"
              onChange={(v) => handleChange("workout", v)}
            />
            <PreviousValue label={prev("workout")} dayLabel={previousDayLabel} />
          </div>
          <div className="space-y-1">
            <ToggleChip
              emoji="📖"
              categoryLabel="Reading"
              value={formData.reading}
              goodValue={1}
              goodLabel="Read today"
              badLabel="Didn't read"
              onChange={(v) => handleChange("reading", v)}
            />
            <PreviousValue label={prev("reading")} dayLabel={previousDayLabel} />
          </div>
        </motion.section>

        <div className="space-y-1 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Supplementary
          </p>
        </div>

        <MetricSection
          index={6}
          label="Weight"
          streak={streaks.metrics.weight_kg}
          currentDate={currentDate}
          previousValue={prev("weight_kg")}
        >
          <NumberInput
            value={formData.weight_kg}
            onChange={(v) => handleChange("weight_kg", v)}
          />
        </MetricSection>

        <MetricSection
          index={7}
          label="Notes"
          streak={streaks.metrics.notes}
          currentDate={currentDate}
          previousValue={prev("notes")}
        >
          <NotesInput
            value={formData.notes}
            onChange={(v) => handleChange("notes", v)}
          />
        </MetricSection>
      </main>

      <SaveBar
        status={saveStatus}
        trackedCount={trackedCount}
        totalCount={12}
      />
    </div>
  );
}
