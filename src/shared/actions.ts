// in this file i will introduse the three actions for worker service:uppercaseAction, addTimestampAction,filterFieldsAction
export function processPayload(
  payload: unknown,
  actionType: string
): unknown {
  if (typeof payload !== "object" || payload === null) return payload;

  const data = payload as Record<string, unknown>;

  switch (actionType) {
    case "uppercase":
      return uppercaseAction(data);
    case "add_timestamp":
      return addTimestampAction(data);
    case "filter_fields":
      return filterFieldsAction(data);
    default:
      return payload;
  }
}

function uppercaseAction(data: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = typeof value === "string" ? value.toUpperCase() : value;
  }
  return result;
}

function addTimestampAction(data: Record<string, unknown>) {
  return {
    ...data,
    _metadata: {
      processedAt: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  };
}
function filterFieldsAction(data: Record<string, unknown>) {
  const allowedFields = ["id", "name", "email", "message", "type"];
  const result: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}