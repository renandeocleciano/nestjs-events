import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @Length(5, 50)
  public document?: string;
}

