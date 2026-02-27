"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { restartTutorial, skipTutorial } from "@/lib/features/demo/demo"
import { selectConnectionMode, selectDemoTutorialStatus, selectDemoTutorialStep } from "@/lib/selectors"
import { DEMO_TUTORIAL_STEPS, DEMO_TUTORIAL_TOTAL_STEPS, getTutorialStep } from "@/lib/demo-tutorial"

function DemoGuide() {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const connectionMode = useAppSelector(selectConnectionMode)
  const tutorialStatus = useAppSelector(selectDemoTutorialStatus)
  const currentStep = useAppSelector(selectDemoTutorialStep)

  if (connectionMode !== "demo") return null

  const isActive = tutorialStatus === "active"
  const isSkipped = tutorialStatus === "skipped"
  const isCompleted = tutorialStatus === "completed"
  const step = getTutorialStep(currentStep)
  const totalSteps = DEMO_TUTORIAL_TOTAL_STEPS
  const routeLabel = step?.route === "/"
    ? "Trading"
    : step?.route === "/wallet"
      ? "Wallet"
      : "Swap"

  return (
    <aside className="demo-guide" role="complementary" aria-label="Demo tutorial">
      <h3>Demo Guide</h3>

      {isActive && step ? (
        <>
          <p className="demo-guide__progress">Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</p>
          <p className="demo-guide__title">{step.title}</p>
          <p className="demo-guide__description">{step.description}</p>
          {pathname !== step.route && (
            <p className="demo-guide__hint">
              Continue on <Link href={step.route}>{routeLabel}</Link>.
            </p>
          )}
        </>
      ) : null}

      {isCompleted && (
        <p className="demo-guide__description">
          Tutorial complete. You can keep exploring in demo mode or restart the guide.
        </p>
      )}

      {isSkipped && (
        <p className="demo-guide__description">
          Tutorial skipped. Demo mode is still active.
        </p>
      )}

      <div className="demo-guide__actions">
        {isActive ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => dispatch(skipTutorial())}
          >
            Skip Tutorial
          </button>
        ) : (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => dispatch(restartTutorial())}
          >
            Restart Tutorial
          </button>
        )}
      </div>

      <ol className="demo-guide__steps">
        {DEMO_TUTORIAL_STEPS.map((tutorialStep, index) => {
          const isDone = currentStep > index || isCompleted
          const isCurrent = isActive && currentStep === index

          return (
            <li key={tutorialStep.id} className={isCurrent ? "is-current" : isDone ? "is-done" : undefined}>
              {tutorialStep.title}
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

export default DemoGuide
