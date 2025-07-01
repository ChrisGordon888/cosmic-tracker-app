# 🌌 COSMIC TRACKER: DEV ROADMAP & WIREFRAMES

A living plan to track the next steps as we expand the Cosmic Tracker app with rituals, quests, moon cycles, and more.

---

## 🚀 NEXT STEPS

✅ **1) Integrate Accurate Moon Phases**
- Create a JSON or JS object with your 2025 moon calendar.
- Build `utils/moonPhases.js` to:
  - Accept a date input.
  - Return the nearest moon phase from your dataset.
- Use this in Tracker, Calendar, and Home pages for accurate offline moon phase info.

✅ **2) Build Enhanced Tracker Page**
- Show today’s moon phase at the top.
- List today’s practice quests with progress buttons (e.g., check off reps).
- Mark quests as ✅ when completed.
- Add mood entry & sacred yes fields for daily tracking.

✅ **3) Upgrade Practice Quest CRUD Page**
- Add ability to link quests to specific rituals.
- Provide dropdowns/autocomplete for selecting rituals when creating quests.
- Allow editing quests: update reps, switch rituals, etc.

✅ **4) Refine Calendar Page**
- Display a heatmap calendar:
  - Color-code by mood intensity or quests completed each day.
  - Add moon icons on new/full/quarter moon dates.
- Consider using `react-calendar` or `react-heatmap-calendar` for visual polish.

✅ **5) Polish Profile Page**
- Add personal progress summaries:
  - “Quests completed this week”
  - “Moods logged this month”
  - “Current streak of daily Sacred Yes entries”

---

## ✨ WIREFRAME IDEAS

- Tracker Page:  
[🌕 Today's Moon Phase]
[📝 Sacred Yes input]
[📈 Mood input]
[🧘 Practice Quests list with checkboxes]

- Calendar Page:
[Month View with heatmap squares]
[Moon phase icons on special dates]
[Click day → see moods, quests, sacred yes]

- Profile Page:
[Profile info + stats]
[List of Sacred Yes, Moods, Quests history]
[Delete/edit buttons]

---

🚨 **Note:** Keep this file updated as tasks are completed or plans evolve!