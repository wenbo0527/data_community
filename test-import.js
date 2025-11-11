console.log('Testing UnifiedEdgeManager import...');

try {
  const module = await import('./src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js');
  console.log('✅ Import successful:', !!module.default);
  console.log('✅ UnifiedEdgeManager class available:', typeof module.default);
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}