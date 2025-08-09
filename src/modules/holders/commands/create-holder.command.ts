export class CreateHolderCommand {
  public constructor(
    public readonly document: string,
    public readonly cardId: string,
    public readonly metadata: Record<string, unknown> = {},
  ) {}
}

