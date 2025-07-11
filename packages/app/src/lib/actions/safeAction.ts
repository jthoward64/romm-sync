export abstract class SomeActionResponse {
  abstract ok: boolean;
}

export class SuccessActionResponse<T> extends SomeActionResponse {
  readonly ok = true;
  constructor(public data: T) {
    super();
  }
}

export class ErrorActionResponse extends SomeActionResponse {
  readonly ok = false;
  constructor(public error: { message: string }) {
    super();
  }
}

export type ActionResponse<T> = SuccessActionResponse<T> | ErrorActionResponse;

export function safeAction<Args extends unknown[], Return>(
  action: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<ActionResponse<Return>> {
  return async (...args: Args): Promise<ActionResponse<Return>> => {
    try {
      const data = await action(...args);
      return new SuccessActionResponse(data);
    } catch (error) {
      if (error instanceof Error) {
        return new ErrorActionResponse({ message: error.message });
      }
      return new ErrorActionResponse({ message: "An unknown error occurred." });
    }
  };
}
