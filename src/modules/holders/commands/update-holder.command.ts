export class UpdateHolderCommand {
  public constructor(
    public readonly id: string,
    public readonly document?: string,
    public readonly cardId?: string,
    public readonly metadata: Record<string, unknown> = {},
  ) {}
}

