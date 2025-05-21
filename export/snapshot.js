let snapshotExporter = null;

export function registerSnapshotExporter(exporter) {
  if (typeof exporter !== 'function') {
    throw new Error('Snapshot exporter must be a function');
  }
  snapshotExporter = exporter;
}

export async function exportSnapshot(sagaId, state) {
  if (!snapshotExporter) {
    console.warn('No snapshot exporter registered');
    return null;
  }

  try {
    const snapshot = {
      id: sagaId,
      timestamp: Date.now(),
      state: {
        status: state.status,
        context: state.context,
        steps: state.steps.map(step => ({
          name: step.name,
          status: step.status || 'pending'
        }))
      }
    };

    await snapshotExporter(snapshot);
    return snapshot;
  } catch (error) {
    console.error('Failed to export snapshot:', error);
    throw error;
  }
}

export function clearSnapshotExporter() {
  snapshotExporter = null;
} 