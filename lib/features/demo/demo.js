import { createSlice } from "@reduxjs/toolkit"

import { DEMO_TUTORIAL_STEPS } from "@/lib/demo-tutorial"

const initialState = {
  status: "idle",
  currentStep: 0,
}

export const demo = createSlice({
  name: "demo",
  initialState,
  reducers: {
    startTutorial: (state) => {
      state.status = "active"
      state.currentStep = 0
    },
    skipTutorial: (state) => {
      state.status = "skipped"
    },
    restartTutorial: (state) => {
      state.status = "active"
      state.currentStep = 0
    },
    advanceTutorial: (state, action) => {
      if (state.status !== "active") return

      const expectedStep = DEMO_TUTORIAL_STEPS[state.currentStep]
      if (!expectedStep) return
      if (expectedStep.id !== action.payload) return

      state.currentStep += 1

      if (state.currentStep >= DEMO_TUTORIAL_STEPS.length) {
        state.status = "completed"
      }
    },
    hydrateTutorial: (state, action) => {
      const payload = action.payload || {}
      const nextStatus = payload.status || "idle"
      const nextStep = Number(payload.currentStep)

      state.status = ["idle", "active", "skipped", "completed"].includes(nextStatus)
        ? nextStatus
        : "idle"
      state.currentStep = Number.isFinite(nextStep) && nextStep >= 0 ? nextStep : 0
    },
    resetTutorial: (state) => {
      state.status = "idle"
      state.currentStep = 0
    },
  },
})

export const {
  startTutorial,
  skipTutorial,
  restartTutorial,
  advanceTutorial,
  hydrateTutorial,
  resetTutorial,
} = demo.actions

export default demo.reducer

