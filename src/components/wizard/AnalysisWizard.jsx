import React, { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Step1Food } from "./Step1Food";
import { Step2Conditions } from "./Step2Conditions";
import { Step3Packaging } from "./Step3Packaging";
import { Step4Analysis } from "./Step4Analysis";
import { Step5Results } from "./Step5Results";
import { validateFoodInputs } from "../../utils/validation";

export function AnalysisWizard({
  input,
  setInput,
  updateFood,
  runAdvisor,
  result,
  loading,
  backendHealthy,
  validationErrors = {},
  errorState,
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
    setIsAnalyzing(true);
    // 1. Validate physical food and packaging constraints
    const val = validateFoodInputs(input);
    if (!val.isValid) {
      setIsAnalyzing(false);
      await runAdvisor(); // Triggers errorState and validationErrors
      if (val.errors.food || val.errors.moisture || val.errors.fat || val.errors.ph || val.errors.composition) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Run real ML backend pipeline with timeout protection
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

      {/* Validation Error Alert Banner */}
      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <div style={{
          background: "rgba(201, 91, 74, 0.1)",
          border: "1px solid rgba(201, 91, 74, 0.35)",
          borderRadius: "var(--radius-md)",
          padding: "14px 18px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          color: "var(--color-risk-red)"
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px", color: "var(--color-risk-red)" }} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: "14px", color: "var(--color-risk-red)", marginBottom: "4px" }}>
              Input Parameter Validation Issue
            </strong>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", lineHeight: "1.5", color: "var(--color-primary-dark)" }}>
              {Object.entries(validationErrors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <Step1Food
          input={input}
          setInput={setInput}
          validationErrors={validationErrors}
          onSelectFood={(key) => updateFood(key)}
          onNext={() => {
            const val = validateFoodInputs(input);
            if (val.errors.food || val.errors.moisture || val.errors.fat || val.errors.ph || val.errors.composition) {
              runAdvisor(); // Populates validationErrors and errorState
              return;
            }
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 2 && (
        <Step2Conditions
          input={input}
          setInput={setInput}
          validationErrors={validationErrors}
          onBack={() => {
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNext={() => {
            const val = validateFoodInputs(input);
            if (val.errors.temperature || val.errors.humidity || val.errors.shelf || val.errors.packageWeight) {
              runAdvisor();
              return;
            }
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {currentStep === 3 && (
        <Step3Packaging
          input={input}
          setInput={setInput}
          isAnalyzing={isAnalyzing || loading}
          onBack={() => {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onRunAnalysis={handleStartAnalysis}
        />
      )}

      {currentStep === 4 && (
        <Step4Analysis
          input={input}
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
