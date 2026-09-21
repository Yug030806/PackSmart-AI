import React, { useState } from "react";
import { Check } from "lucide-react";
import { Step1Food } from "./Step1Food";
import { Step2Conditions } from "./Step2Conditions";
import { Step3Packaging } from "./Step3Packaging";
import { Step4Analysis } from "./Step4Analysis";
import { Step5Results } from "./Step5Results";

export function AnalysisWizard({
  input,
  setInput,
  updateFood,
  runAdvisor,
  result,
  loading,
  backendHealthy,
  onOpenReport,
  onOpenSimulator
}) {
  // Step state: 1: Food, 2: Conditions, 3: Packaging, 4: AI Analysis, 5: Results
  const [currentStep, setCurrentStep] = useState(result ? 5 : 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps = [
    { n: "01", title: "Food Profile" },
    { n: "02", title: "Conditions" },
    { n: "03", title: "Packaging" },
    { n: "04", title: "AI Analysis" },
    { n: "05", title: "Results" }
  ];

  const handleStartAnalysis = async () => {
    setCurrentStep(4);
    setIsAnalyzing(true);
    // Run real ML backend pipeline
    await runAdvisor();
    setIsAnalyzing(false);
  };

  const handleAnalysisAnimationComplete = () => {
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewAnalysis = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* 10. Multi-Step Wizard Progress Indicator */}
      <nav className="stepper-nav" aria-label="Analysis Progress">
        {steps.map((st, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <React.Fragment key={st.n}>
              <div className={`stepper-item ${isActive ? "active" : isCompleted ? "completed" : ""}`}>
                <div className="stepper-number">
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : st.n}
                </div>
                <span className="stepper-title">{st.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`stepper-connector ${isCompleted ? "active" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Step Content */}
      {currentStep === 1 && (
        <Step1Food
          input={input}
          setInput={setInput}
          onSelectFood={(key) => updateFood(key)}
          onNext={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2Conditions
          input={input}
          setInput={setInput}
          onBack={() => {
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNext={() => {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3Packaging
          input={input}
          setInput={setInput}
          onBack={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onRunAnalysis={handleStartAnalysis}
        />
      )}

      {currentStep === 4 && (
        <Step4Analysis
          onComplete={handleAnalysisAnimationComplete}
          isBackendDone={!loading}
        />
      )}

      {currentStep === 5 && (
        <Step5Results
          result={result}
          input={input}
          onNewAnalysis={handleNewAnalysis}
          onOpenReport={onOpenReport}
          onOpenSimulator={onOpenSimulator}
        />
      )}
    </div>
  );
}
