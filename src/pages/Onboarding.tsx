import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Heart,
  Shield,
  Monitor,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import cartersLogo from "@/assets/Carters-Logo.png";

const STEPS = [
  { key: "welcome", label: "Welcome", icon: Heart },
  { key: "policies", label: "Policies", icon: Shield },
  { key: "system", label: "System Guide", icon: Monitor },
  { key: "compliance", label: "Compliance", icon: ClipboardCheck },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const markComplete = () => {
    setCompleted((prev) => new Set(prev).add(currentStep));
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const allDone = completed.size === STEPS.length;

  return (
    <AppLayout title="Staff Onboarding">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = completed.has(i);
            const active = i === currentStep;
            return (
              <button
                key={s.key}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : done
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary/50"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                <s.icon className="h-3.5 w-3.5 hidden sm:block" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {completed.size}/{STEPS.length} complete
          </span>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && <PoliciesStep />}
            {currentStep === 2 && <SystemStep />}
            {currentStep === 3 && <ComplianceStep />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="h-9 px-4 rounded-lg border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-30 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {allDone ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> Onboarding Complete!
            </div>
          ) : null}

          <button
            onClick={markComplete}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {completed.has(currentStep)
              ? currentStep < STEPS.length - 1
                ? "Next"
                : "Done"
              : "Mark Complete & Continue"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

/* ─── Step Components ─── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card border border-border/50 space-y-4">
      <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
      {children}
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card p-8 shadow-card border border-border/50 text-center space-y-4">
        <img src={cartersLogo} alt="Carters Care Group" className="h-16 mx-auto" />
        <h2 className="text-xl font-bold text-card-foreground">
          Welcome to Carters Care Group
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          We're thrilled to have you join our team. At Carters Care Group, we are
          dedicated to providing exceptional support to our NDIS and Aged Care
          clients across the community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Our Mission">
          <p className="text-sm text-muted-foreground leading-relaxed">
            To empower individuals with disability and older Australians to live
            their best lives through person-centred, high-quality care and
            support services.
          </p>
        </SectionCard>

        <SectionCard title="Our Values">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Dignity & Respect — Every person deserves to be treated with kindness",
              "Safety First — We never compromise on the safety of our clients or staff",
              "Accountability — We take ownership of our actions and responsibilities",
              "Team Spirit — We support each other and grow together",
            ].map((v, i) => (
              <li key={i} className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Your Role">
          <p className="text-sm text-muted-foreground leading-relaxed">
            As a support worker, you'll be the primary point of contact for
            clients in their homes and community. You'll assist with daily
            living, personal care, community access, and skill development.
          </p>
        </SectionCard>

        <SectionCard title="Who to Contact">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-card-foreground">Rostering:</strong> For shift changes, availability, or swaps</li>
            <li><strong className="text-card-foreground">Coordinator:</strong> For client concerns, care plan questions</li>
            <li><strong className="text-card-foreground">HR / Admin:</strong> For payroll, leave, compliance documents</li>
            <li><strong className="text-card-foreground">Emergency:</strong> Call 000 for life-threatening situations</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function PoliciesStep() {
  const policies = [
    {
      title: "Code of Conduct",
      items: [
        "Act with integrity and professionalism at all times",
        "Maintain professional boundaries with clients",
        "Report any concerns about client safety or wellbeing immediately",
        "Never accept gifts, money, or personal favours from clients",
        "Respect client privacy — never share information outside of work",
      ],
    },
    {
      title: "Incident Reporting",
      items: [
        "Report ALL incidents — no matter how minor — within 24 hours",
        "Use the Incidents module in this system to lodge reports",
        "Types: injuries, medication errors, behavioural incidents, safeguarding concerns",
        "Notify your coordinator immediately for serious incidents",
        "Complete follow-up actions as directed by management",
      ],
    },
    {
      title: "Privacy & Confidentiality",
      items: [
        "Client information is strictly confidential under Australian Privacy Principles",
        "Never discuss clients outside of work or on social media",
        "Secure all paper and electronic records",
        "Only access information you need for your role",
        "Breaches may result in disciplinary action and legal consequences",
      ],
    },
    {
      title: "NDIS & Aged Care Standards",
      items: [
        "Uphold the NDIS Code of Conduct and Practice Standards",
        "Support clients' rights to choice and control",
        "Follow individual care/support plans at all times",
        "Document all service delivery accurately in case notes",
        "Participate in mandatory training and supervision",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Key Policies & Procedures">
        <p className="text-sm text-muted-foreground">
          These are the essential policies you must understand and follow. Please read
          each section carefully.
        </p>
      </SectionCard>
      {policies.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <ul className="space-y-2">
            {p.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}

function SystemStep() {
  const modules = [
    {
      title: "Shift Check-In",
      desc: "When you arrive at a client's home, use the Check-In page to record your location and start time. Check out when you leave. GPS is captured automatically for compliance.",
    },
    {
      title: "Timesheets",
      desc: "Your shifts appear automatically from roster entries. Review your hours weekly and flag any discrepancies to your coordinator before the approval deadline.",
    },
    {
      title: "Case Notes",
      desc: "After every shift, write a case note describing the support you provided, any observations, and client mood/wellbeing. These are legal documents — be factual and professional.",
    },
    {
      title: "Roster",
      desc: "View your upcoming shifts on the Roster page. Your coordinator will assign shifts. If you need to change availability, contact rostering as early as possible.",
    },
    {
      title: "Incidents",
      desc: "Use the Incidents page to report any accidents, near-misses, behavioural events, medication errors, or safeguarding concerns. Include as much detail as possible.",
    },
    {
      title: "AI Assistant",
      desc: "Click the chat bubble in the bottom-right corner to ask questions about policies, procedures, or how to use the system. It's available 24/7.",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="System Walkthrough">
        <p className="text-sm text-muted-foreground">
          Here's how to use the key features of the Carters Care platform.
          Each module is accessible from the sidebar menu.
        </p>
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <SectionCard key={m.title} title={m.title}>
            <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function ComplianceStep() {
  const items = [
    { doc: "NDIS Worker Screening Check", status: "Required before first shift" },
    { doc: "Working with Children Check (WWCC)", status: "Required before first shift" },
    { doc: "National Police Check", status: "Within last 12 months" },
    { doc: "First Aid Certificate (HLTAID011)", status: "Must be current" },
    { doc: "CPR Certificate (HLTAID009)", status: "Must be current" },
    { doc: "Manual Handling Training", status: "Within first 30 days" },
    { doc: "Medication Administration Training", status: "If applicable to role" },
    { doc: "COVID-19 Vaccination Evidence", status: "As per current health directives" },
    { doc: "Driver's Licence + Insurance", status: "If using personal vehicle for work" },
    { doc: "Signed Employment Contract", status: "Before first shift" },
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Compliance Checklist">
        <p className="text-sm text-muted-foreground">
          The following documents and checks must be completed and submitted.
          Your coordinator will track these in the Compliance module.
        </p>
      </SectionCard>

      <div className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Document / Check</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Requirement</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-card-foreground">{item.doc}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionCard title="What Happens Next?">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Submit all required documents to your coordinator or HR</span>
          </li>
          <li className="flex items-start gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Complete any outstanding mandatory training modules</span>
          </li>
          <li className="flex items-start gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Shadow an experienced worker on your first 2–3 shifts</span>
          </li>
          <li className="flex items-start gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Schedule your induction meeting with your coordinator</span>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
