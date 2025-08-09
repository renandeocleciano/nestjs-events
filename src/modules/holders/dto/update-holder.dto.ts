import { IsOptional, IsString, Length, IsUUID } from 'class-validator';

export class UpdateHolderDto {
  @IsOptional()
  @IsString()
  @Length(5, 50)
  public document?: string;

  @IsOptional()
  @IsUUID()
  public cardId?: string;
}

