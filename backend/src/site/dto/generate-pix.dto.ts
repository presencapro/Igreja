import { IsDefined } from 'class-validator';

export class GeneratePixDto {
  @IsDefined()
  valor!: string | number;
}
