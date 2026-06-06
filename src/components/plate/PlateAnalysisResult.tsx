import { Link } from "@tanstack/react-router";
import { UserCog, ArrowRight, Sparkles, Heart, Leaf, Flame, Wand2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type PlateAnalysis } from "@/lib/analyze-plate.functions";

function formatGoal(g: string) {
  return g
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function TargetCmp({
  label,
  actual,
  target,
  unit,
  cap,
  higherIsBetter,
}: {
  label: string;
  actual: number;
  target: number;
  unit: string;
  cap?: boolean;
  higherIsBetter?: boolean;
}) {
  const pct = target > 0 ? (actual / target) * 100 : 0;
  let tone: "good" | "warn" | "bad" = "good";
  if (cap) {
    tone = actual <= target ? "good" : actual <= target * 1.25 ? "warn" : "bad";
  } else if (higherIsBetter) {
    tone = actual >= target ? "good" : actual >= target * 0.7 ? "warn" : "bad";
  } else {
    const diff = Math.abs(pct - 100);
    tone = diff <= 15 ? "good" : diff <= 35 ? "warn" : "bad";
  }
  return (
    <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
      <p className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
        <span>{label}</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            tone === "good" && "bg-sage/20 text-sage",
            tone === "warn" && "bg-spice/20 text-spice",
            tone === "bad" && "bg-destructive/20 text-destructive",
          )}
        >
          {tone === "good" ? "on target" : tone === "warn" ? "off" : cap ? "too high" : higherIsBetter ? "too low" : "far off"}
        </span>
      </p>
      <p className="font-medium">
        {Math.round(actual)}
        {unit} <span className="text-muted-foreground">/ {Math.round(target)}{unit}</span>
      </p>
    </div>
  );
}

function PlateMatch({
  label,
  actual,
  ideal,
}: {
  label: string;
  actual: number;
  ideal: number;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(actual)));
  const diff = pct - ideal;
  const absDiff = Math.abs(diff);
  const status: "good" | "missing" | "over" =
    absDiff <= 8 ? "good" : diff < 0 ? "missing" : "over";
  const statusLabel =
    status === "good" ? "Balanced" : status === "missing" ? "Missing" : "Overdoing";
  const barColor =
    status === "good" ? "bg-sage" : status === "missing" ? "bg-spice" : "bg-destructive";
  const icon = status === "good" ? "✓" : status === "missing" ? "↓" : "↑";
  return (
    <div
      className={cn(
        "rounded-lg border border-border p-2.5",
        status === "good" && "bg-sage/5",
        status === "missing" && "bg-spice/5",
        status === "over" && "bg-destructive/5",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white",
              barColor,
            )}
          >
            {icon}
          </span>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{pct}%</span> / {ideal}%
          <span
            className={cn(
              "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              status === "good" && "bg-sage/20 text-sage",
              status === "missing" && "bg-spice/20 text-spice",
              status === "over" && "bg-destructive/20 text-destructive",
            )}
          >
            {statusLabel}
          </span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-y-0 left-0 w-0.5 bg-foreground/40"
          style={{ left: `${ideal}%` }}
          aria-hidden
        />
        <div
          className={cn("h-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3",
        accent && "bg-warm-gradient",
      )}
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-xl font-semibold">{value}</p>
      {children}
    </div>
  );
}

function formatNutritionSource(source?: string) {
  if (source === "local_db") return "local food data";
  if (source === "usda") return "USDA FoodData Central";
  if (source === "fallback") return "curated fallback";
  return "nutrition database";
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 px-2.5 py-2">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 10));
  const color =
    value >= 7 ? "bg-sage" : value >= 4 ? "bg-spice" : "bg-destructive";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
      <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PlateAnalysisResult({ analysis }: { analysis: PlateAnalysis }) {
  if (!analysis.detected || analysis.blurry) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-display text-base">{analysis.nanumoniMessage}</p>
      </div>
    );
  }
  const n = analysis.nutrition;
  const score = Math.round(analysis.healthScore);
  return (
    <div className="space-y-4">
      {analysis.dishes.length > 0 && analysis.dishes.every((d) => d.confidence === "low") && (
        <div className="rounded-xl border border-spice/30 bg-spice/10 px-4 py-3 text-sm text-foreground">
          I can see food, but the estimate may be uncertain.
        </div>
      )}

      {analysis.profileIncomplete && (
        <div className="flex items-start gap-3 rounded-2xl border border-spice/30 bg-spice/5 px-4 py-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spice/15 text-spice">
            <UserCog className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm">
              Sona, Nanumoni can be more personal if you finish your profile
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Still missing: {analysis.missingProfileFields?.join(", ") || "—"}.
              Add it once and every plate gets tuned to YOU.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to="/profile">
              Complete <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <div className="rounded-2xl bg-warm-gradient p-4 ring-1 ring-border">
        <p className="font-display text-lg leading-snug">{analysis.nanumoniMessage}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
              "bg-primary/15 text-primary",
            )}
            title="Edamam image food detection"
          >
            <Sparkles className="h-2.5 w-2.5" />
            Edamam food detection
          </span>
          {analysis.ragGrounding && analysis.ragGrounding.length > 0 && (
            <span
              className="rounded-full bg-sage/15 px-2 py-0.5 font-semibold uppercase tracking-wide text-sage"
              title={analysis.ragGrounding.map((g) => `${g.dish} ↔ ${g.matched} (${g.similarity})`).join("\n")}
            >
              RAG · {analysis.ragGrounding.length} grounded
            </span>
          )}
          {typeof analysis.bmi === "number" && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
              BMI {analysis.bmi}
            </span>
          )}
          {analysis.fallbackReason && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
              {analysis.fallbackReason}
            </span>
          )}
          {analysis.nutritionEstimated && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
              Estimated nutrition
            </span>
          )}
        </div>
        {analysis.nutritionEstimated && (
          <p className="mt-2 text-xs text-muted-foreground">
            Detected from image, then estimated from nutrition database.
          </p>
        )}
      </div>

      {analysis.goalAlignment && analysis.goalAlignment.length > 0 && (
        <Section icon={<Heart className="h-4 w-4" />} title="For your goals">
          <div className="space-y-2">
            {analysis.goalAlignment.map((g, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-wrap items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm",
                  g.verdict === "great" && "bg-accent/40",
                  g.verdict === "okay" && "bg-secondary",
                  g.verdict === "risky" && "bg-destructive/10",
                )}
              >
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                  {formatGoal(g.goal)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    g.verdict === "great" && "bg-sage/20 text-sage",
                    g.verdict === "okay" && "bg-primary/15 text-primary",
                    g.verdict === "risky" && "bg-destructive/20 text-destructive",
                  )}
                >
                  {g.verdict}
                </span>
                <span className="basis-full text-foreground/90">{g.reason}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {analysis.dishes.length > 0 && (
        <Section icon={<Leaf className="h-4 w-4" />} title="What I see on your plate">
          <ul className="space-y-2">
            {analysis.dishes.map((d, i) => (
              <li key={i} className="rounded-xl glass-soft p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-base font-semibold">{d.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {d.portion}
                    {d.portion_grams ? ` · ~${Math.round(d.portion_grams)}g` : ""}
                    {" · "}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        d.confidence === "high" && "bg-sage/20 text-sage",
                        d.confidence === "medium" && "bg-primary/15 text-primary",
                        d.confidence === "low" && "bg-spice/20 text-spice",
                      )}
                    >
                      {d.confidence}
                    </span>
                  </span>
                </div>
                {d.nutrition && (
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] sm:grid-cols-7">
                    <Macro label="kcal" value={`${Math.round(d.nutrition.calories)}`} />
                    <Macro label="P" value={`${Math.round(d.nutrition.protein_g)}g`} />
                    <Macro label="C" value={`${Math.round(d.nutrition.carbs_g)}g`} />
                    <Macro label="F" value={`${Math.round(d.nutrition.fat_g)}g`} />
                    <Macro label="Fiber" value={`${Math.round(d.nutrition.fiber_g)}g`} />
                    <Macro label="Iron" value={`${d.nutrition.iron_mg.toFixed(1)}mg`} />
                    <Macro label="Na" value={`${Math.round(d.nutrition.sodium_mg)}mg`} />
                  </div>
                )}
                {((d.source || d.nutrition_source) || d.nutrition_confidence) && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Nutrition source: {formatNutritionSource(d.source || d.nutrition_source)}
                    {d.nutrition_confidence ? ` · ${d.nutrition_confidence} confidence` : ""}
                    {d.matched_food_name ? ` · matched ${d.matched_food_name}` : ""}
                  </p>
                )}
                {d.note && (
                  <p className="mt-2 text-xs text-foreground/80">{d.note}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Health score" value={`${score}/10`} accent>
          <ScoreBar value={score} />
        </Stat>
        {n && <Stat label="Calories" value={`${Math.round(n.calories)} kcal`} />}
        {n && (
          <Stat
            label="Protein"
            value={`${Math.round(n.protein_g)} g`}
          />
        )}
      </div>

      {n && (
        <Section icon={<Flame className="h-4 w-4" />} title="Nutrition breakdown">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <Macro label="Carbs" value={`${Math.round(n.carbs_g)} g`} />
            <Macro label="Fat" value={`${Math.round(n.fat_g)} g`} />
            <Macro label="Fiber" value={`${Math.round(n.fiber_g)} g`} />
            <Macro label="Iron" value={`${n.iron_mg.toFixed(1)} mg`} />
            <Macro label="Vit A" value={`${Math.round(n.vitaminA_ugRAE)} µg`} />
            <Macro label="Zinc" value={`${n.zinc_mg.toFixed(1)} mg`} />
            <Macro label="Sodium" value={`${Math.round(n.sodium_mg)} mg`} />
          </div>
        </Section>
      )}

      {analysis.goalAdjustedTargets && n && (
        <Section icon={<Heart className="h-4 w-4" />} title="Your goal-tuned targets (this meal)">
          <p className="mb-2 text-xs text-muted-foreground">
            {analysis.goalAdjustedTargets.notes}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <TargetCmp label="kcal" actual={n.calories} target={analysis.goalAdjustedTargets.calories} unit="" />
            <TargetCmp label="Protein" actual={n.protein_g} target={analysis.goalAdjustedTargets.protein_g} unit="g" />
            <TargetCmp label="Carbs" actual={n.carbs_g} target={analysis.goalAdjustedTargets.carbs_g} unit="g" />
            <TargetCmp label="Fat" actual={n.fat_g} target={analysis.goalAdjustedTargets.fat_g} unit="g" />
            <TargetCmp label="Fiber" actual={n.fiber_g} target={analysis.goalAdjustedTargets.fiber_g} unit="g" higherIsBetter />
            <TargetCmp label="Sodium" actual={n.sodium_mg} target={analysis.goalAdjustedTargets.sodium_mg_max} unit="mg" cap />
          </div>
        </Section>
      )}

      <Section icon={<Sparkles className="h-4 w-4" />} title="Nanumoni's reasoning">
        <p className="text-sm leading-relaxed text-foreground/90">{analysis.healthExplanation}</p>
      </Section>

      <Section title="Hygiene & freshness">
        <p className="text-sm text-foreground/90">{analysis.hygieneNotes}</p>
      </Section>

      <Section icon={<Leaf className="h-4 w-4" />} title="Ideal Deshi plate match">
        <p className="mb-3 rounded-lg bg-accent/40 px-3 py-2 text-sm font-medium text-accent-foreground">
          {analysis.idealPlateComparison}
        </p>
        {analysis.idealPlateBreakdown && (
          <div className="space-y-2.5">
            <PlateMatch
              label="½ Shak-Shobji (greens & veg)"
              actual={analysis.idealPlateBreakdown.shak_shobji_pct}
              ideal={50}
            />
            <PlateMatch
              label="¼ Bhat / Ruti (carbs)"
              actual={analysis.idealPlateBreakdown.bhat_carbs_pct}
              ideal={25}
            />
            <PlateMatch
              label="¼ Dal + Mach/Mangsho (protein)"
              actual={analysis.idealPlateBreakdown.dal_protein_pct}
              ideal={25}
            />
            {analysis.idealPlateBreakdown.notes && (
              <p className="pt-1 text-xs text-muted-foreground">
                {analysis.idealPlateBreakdown.notes}
              </p>
            )}
          </div>
        )}
      </Section>

      {analysis.personalizedSuggestions.length > 0 && (
        <Section title="Personalized tips">
          <ul className="space-y-1.5 text-sm">
            {analysis.personalizedSuggestions.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analysis.makeItHealthierTips.length > 0 && (
        <div id="nanumoni-healthier-tips">
          <Section icon={<Wand2 className="h-4 w-4" />} title="Make it healthier">
            <ul className="space-y-1.5 text-sm">
              {analysis.makeItHealthierTips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-sage">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {analysis.substitutions && analysis.substitutions.length > 0 && (
        <Section icon={<Sparkles className="h-4 w-4" />} title="Smart Deshi swaps">
          <ul className="space-y-2 text-sm">
            {analysis.substitutions.map((s, i) => (
              <li key={i} className="rounded-lg glass-soft p-2.5">
                <div className="flex flex-wrap items-center gap-1.5 font-medium">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="rounded-full bg-sage/20 px-2 py-0.5 text-xs text-sage">{s.to}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/80">{s.why}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analysis.portionAdjustment && (
        <Section icon={<Heart className="h-4 w-4" />} title="Portion adjustment for your goals">
          <p className="text-sm leading-relaxed text-foreground/90">{analysis.portionAdjustment}</p>
        </Section>
      )}

      {analysis.budgetAlternatives && analysis.budgetAlternatives.length > 0 && (
        <Section icon={<Wallet className="h-4 w-4" />} title="Budget-friendly alternatives">
          <ul className="space-y-1.5 text-sm">
            {analysis.budgetAlternatives.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">৳</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analysis.sources.length > 0 && (
        <p className="pt-1 text-[11px] text-muted-foreground">
          Based on {analysis.sources.join(", ")}
        </p>
      )}
    </div>
  );
}
