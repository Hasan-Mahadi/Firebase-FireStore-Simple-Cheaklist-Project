import {
  INITIAL_CATEGORIES,
  getInitialTasksArray,
  calculateChecklistMetrics,
} from "./src/checklistData.js";

console.log("=== RUNNING AMAR CITY CHECKLIST VERIFICATION SUITE ===");

// Test 1: Category Count
console.log("\n[Test 1] Verifying 10 Categories:");
if (INITIAL_CATEGORIES.length !== 10) {
  throw new Error(`Expected 10 categories, found ${INITIAL_CATEGORIES.length}`);
}
console.log("✓ Exactly 10 categories present.");

// Test 2: Total Tasks and Initial Completion
console.log("\n[Test 2] Verifying 77 Tasks & Initial Completion State:");
const tasks = getInitialTasksArray();
if (tasks.length !== 77) {
  throw new Error(`Expected 77 tasks, found ${tasks.length}`);
}
console.log(`✓ Exactly ${tasks.length} tasks initialized.`);

const initialMetrics = calculateChecklistMetrics(tasks);
console.log("Initial Metrics:", initialMetrics);

if (
  initialMetrics.totalTasks !== 77 ||
  initialMetrics.completedTasks !== 8 ||
  initialMetrics.remainingTasks !== 69 ||
  initialMetrics.percentage !== 10
) {
  throw new Error(
    `Initial metrics failed. Expected 77 total, 8 completed, 69 remaining, 10%`
  );
}
console.log("✓ Initial metrics match: 77 Total, 8 Completed, 69 Remaining, 10%");

// Test 3: Category Completion Verification
console.log("\n[Test 3] Verifying Category Completion Breakdown:");
const expectedBreakdown = {
  1: { completed: 2, total: 5 },
  2: { completed: 5, total: 9 },
  3: { completed: 0, total: 8 },
  4: { completed: 0, total: 8 },
  5: { completed: 0, total: 7 },
  6: { completed: 1, total: 7 },
  7: { completed: 0, total: 10 },
  8: { completed: 0, total: 7 },
  9: { completed: 0, total: 7 },
  10: { completed: 0, total: 9 },
};

INITIAL_CATEGORIES.forEach((cat) => {
  const catTasks = tasks.filter((t) => t.categoryId === cat.id);
  const completed = catTasks.filter((t) => t.completed).length;
  const expected = expectedBreakdown[cat.number];
  if (completed !== expected.completed || catTasks.length !== expected.total) {
    throw new Error(
      `Category ${cat.number} (${cat.title}) expected ${expected.completed}/${expected.total}, got ${completed}/${catTasks.length}`
    );
  }
  console.log(`✓ Category ${cat.number}. ${cat.title}: ${completed}/${catTasks.length}`);
});

// Test 4: Dynamic Toggle & Progress Recalculation
console.log("\n[Test 4] Testing Checking and Unchecking Tasks:");
// Check Task 3 (in Brand category)
const taskToToggle = tasks.find((t) => t.id === "task-3");
if (!taskToToggle || taskToToggle.completed) {
  throw new Error("Task 3 should initially be false");
}

const updatedTasks1 = tasks.map((t) =>
  t.id === "task-3" ? { ...t, completed: true } : t
);
const metricsAfterCheck = calculateChecklistMetrics(updatedTasks1);
console.log("Metrics after checking task 3:", metricsAfterCheck);
if (
  metricsAfterCheck.completedTasks !== 9 ||
  metricsAfterCheck.remainingTasks !== 68 ||
  metricsAfterCheck.percentage !== 12
) {
  throw new Error("Recalculation after check failed");
}
console.log("✓ Checking a task automatically increments completed count & overall percentage (9/77 = 12%).");

// Uncheck Task 1
const updatedTasks2 = updatedTasks1.map((t) =>
  t.id === "task-1" ? { ...t, completed: false } : t
);
const metricsAfterUncheck = calculateChecklistMetrics(updatedTasks2);
console.log("Metrics after unchecking task 1:", metricsAfterUncheck);
if (
  metricsAfterUncheck.completedTasks !== 8 ||
  metricsAfterUncheck.remainingTasks !== 69
) {
  throw new Error("Recalculation after uncheck failed");
}
console.log("✓ Unchecking a task automatically decrements completed count & updates remaining.");

// Test 5: Reset Checklist Functionality
console.log("\n[Test 5] Testing Reset Functionality:");
const resetTasks = getInitialTasksArray();
const resetMetrics = calculateChecklistMetrics(resetTasks);
if (
  resetMetrics.completedTasks !== 8 ||
  resetMetrics.remainingTasks !== 69 ||
  resetMetrics.percentage !== 10
) {
  throw new Error("Reset failed to restore initial state");
}
console.log("✓ Reset correctly restores exact 8 initial completed tasks.");

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% READY FOR LAUNCH!\n");
