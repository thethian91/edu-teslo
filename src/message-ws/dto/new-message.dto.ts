import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class NewMessageDto {
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  message: string;
}
