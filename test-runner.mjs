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
  initialMetrics.completedTasks !== 0 ||
  initialMetrics.remainingTasks !== 77 ||
  initialMetrics.percentage !== 0
) {
  throw new Error(
    `Initial metrics failed. Expected 77 total, 0 completed, 77 remaining, 0%`
  );
}
console.log("✓ Initial metrics match: 77 Total, 0 Completed, 77 Remaining, 0%");

// Test 3: Category Completion Verification
console.log("\n[Test 3] Verifying Category Completion Breakdown:");
const expectedBreakdown = {
  1: { completed: 0, total: 5 },
  2: { completed: 0, total: 9 },
  3: { completed: 0, total: 8 },
  4: { completed: 0, total: 8 },
  5: { completed: 0, total: 7 },
  6: { completed: 0, total: 7 },
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
  metricsAfterCheck.completedTasks !== 1 ||
  metricsAfterCheck.remainingTasks !== 76 ||
  metricsAfterCheck.percentage !== 1
) {
  throw new Error("Recalculation after check failed");
}
console.log("✓ Checking a task automatically increments completed count & overall percentage (1/77 = 1%).");

// Uncheck Task 3
const updatedTasks2 = updatedTasks1.map((t) =>
  t.id === "task-3" ? { ...t, completed: false } : t
);
const metricsAfterUncheck = calculateChecklistMetrics(updatedTasks2);
console.log("Metrics after unchecking task 3:", metricsAfterUncheck);
if (
  metricsAfterUncheck.completedTasks !== 0 ||
  metricsAfterUncheck.remainingTasks !== 77
) {
  throw new Error("Recalculation after uncheck failed");
}
console.log("✓ Unchecking a task automatically decrements completed count & updates remaining.");

// Test 5: Initial Tasks Functionality
console.log("\n[Test 5] Testing Initial Tasks Functionality:");
const resetTasks = getInitialTasksArray();
const resetMetrics = calculateChecklistMetrics(resetTasks);
if (
  resetMetrics.completedTasks !== 0 ||
  resetMetrics.remainingTasks !== 77 ||
  resetMetrics.percentage !== 0
) {
  throw new Error("Initial state check failed");
}
console.log("✓ All 77 initial tasks are uncompleted (0%).");

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% READY FOR LAUNCH!\n");
