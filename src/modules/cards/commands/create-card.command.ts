export class CreateCardCommand {
  public constructor(public readonly document: string, public readonly metadata: Record<string, unknown> = {}) {}
}

