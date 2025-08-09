export class ListCardsByHolderIdQuery {
  public constructor(public readonly holderId: string, public readonly page: number = 1, public readonly pageSize: number = 20) {}
}

