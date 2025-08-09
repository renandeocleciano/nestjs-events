export class UpdateCardCommand {
  public constructor(
    public readonly id: string,
    public readonly document?: string,
    public readonly metadata: Record<string, unknown> = {},
  ) {}
}

