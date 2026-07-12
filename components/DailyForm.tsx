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
import SaveBar, { SaveStatus } from "./SaveBar";
import Header from "./Header";
import {
  Entry,
  MetricKey,
  METRIC_KEYS,
  countTrackedMetrics,
  emptyEntry,
} from "@/lib/types";
import { getTodayStr } from "./DateNav";

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
  children,
}: {
  index: number;
  label: string;
  streak: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-primary">{label}</h3>
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
  const [streaks, setStreaks] = useState<StreakData>({
    overall: 0,
    metrics: Object.fromEntries(
      METRIC_KEYS.map((k) => [k, 0])
    ) as Record<MetricKey, number>,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const formDataRef = useRef(formData);
  const retryTimeout = useRef<NodeJS.Timeout>();

  formDataRef.current = formData;

  const fetchEntry = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?date=${date}`);
      const data = await res.json();
      setFormData(data.entry ?? emptyEntry(date));
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
          <ToggleChip
            label="Alcohol"
            emoji="🍺"
            active={formData.alcohol === 1}
            onToggle={() =>
              handleChange(
                "alcohol",
                formData.alcohol === 1 ? 0 : formData.alcohol === 0 ? null : 1
              )
            }
            activeColor="red"
          />
          <ToggleChip
            label="Water"
            emoji="💧"
            active={formData.water === 1}
            onToggle={() =>
              handleChange(
                "water",
                formData.water === 1 ? 0 : formData.water === 0 ? null : 1
              )
            }
          />
          <ToggleChip
            label="Workout"
            emoji="🏋️"
            active={formData.workout === 1}
            onToggle={() =>
              handleChange(
                "workout",
                formData.workout === 1 ? 0 : formData.workout === 0 ? null : 1
              )
            }
          />
          <ToggleChip
            label="Reading"
            emoji="📖"
            active={formData.reading === 1}
            onToggle={() =>
              handleChange(
                "reading",
                formData.reading === 1 ? 0 : formData.reading === 0 ? null : 1
              )
            }
          />
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
        >
          <NumberInput
            value={formData.weight_kg}
            onChange={(v) => handleChange("weight_kg", v)}
          />
        </MetricSection>

        <MetricSection index={7} label="Notes" streak={streaks.metrics.notes}>
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
