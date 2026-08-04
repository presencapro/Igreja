import { IsEmail, IsString } from 'class-validator';

export class PastoralLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
