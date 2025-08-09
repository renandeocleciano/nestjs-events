import { IsString, Length, IsUUID } from 'class-validator';

export class CreateHolderDto {
  @IsString()
  @Length(5, 50)
  public document!: string;

  @IsUUID()
  public cardId!: string;
}

