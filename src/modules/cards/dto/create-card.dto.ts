import { IsString, Length } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @Length(5, 50)
  public document!: string;
}

